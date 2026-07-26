import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Seed default datasets from source code
import { defaultProducts, defaultSettings } from "./src/data/catalog";
import { BRANCHES } from "./src/data/branches";
import { Product, Order, StoreSettings, Branch } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON payloads including large Base64-encoded product thumbnails
  app.use(express.json({ limit: "20mb" }));

  // Establish stable local file persistence directory
  const DATA_DIR = path.join(process.cwd(), "data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
  const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
  const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
  const ALERTS_FILE = path.join(DATA_DIR, "admin-alerts.json");

  // Helper read/write utility
  function readData<T>(filePath: string, defaultVal: T): T {
    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), "utf-8");
        return defaultVal;
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    } catch (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return defaultVal;
    }
  }

  function writeData<T>(filePath: string, val: T) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(val, null, 2), "utf-8");
    } catch (err) {
      console.error(`Error writing file ${filePath}:`, err);
    }
  }

  // Load and seed states dynamically
  let products: Product[] = readData(PRODUCTS_FILE, defaultProducts);
  
  // Guarantee all default products from catalog are present
  const existingProductIds = new Set(products.map(p => p.id));
  let needSave = false;
  for (const defItem of defaultProducts) {
    if (!existingProductIds.has(defItem.id)) {
      products.push(defItem);
      needSave = true;
    }
  }
  if (products.length < defaultProducts.length) {
    products = [...defaultProducts];
    needSave = true;
  }
  if (needSave) {
    writeData(PRODUCTS_FILE, products);
  }

  let orders: Order[] = readData(ORDERS_FILE, []);
  let settings: StoreSettings = readData(SETTINGS_FILE, defaultSettings);
  let adminAlerts: any[] = readData(ALERTS_FILE, []);

  // --- API ROUTE ENDPOINTS ---

  // GET ALL BRANCHES WITH INVENTORY METRICS
  app.get("/api/branches", (req, res) => {
    try {
      const branchData = BRANCHES.map(b => {
        let availableSKUs = 0;
        let totalStockUnits = 0;
        products.forEach(p => {
          const bStock = (p.branchStock && typeof p.branchStock[b.id] === 'number')
            ? p.branchStock[b.id]
            : p.stock;
          if (bStock > 0) {
            availableSKUs += 1;
            totalStockUnits += bStock;
          }
        });
        return {
          ...b,
          totalSKUs: products.length,
          availableSKUs,
          totalUnits: totalStockUnits
        };
      });
      res.json(branchData);
    } catch (e) {
      console.error("Failed to fetch branches:", e);
      res.status(500).json({ error: "Failed to fetch branches" });
    }
  });

  // SYNC BRANCH-SPECIFIC PRODUCT INVENTORY
  app.post("/api/branches", (req, res) => {
    try {
      const { branchId, productId, stock, inventory, products: updatedProducts, syncMap } = req.body;

      if (Array.isArray(updatedProducts)) {
        products = updatedProducts;
        writeData(PRODUCTS_FILE, products);
        return res.json({ success: true, message: "Products and branch inventory synced successfully", count: products.length, products });
      }

      if (syncMap && typeof syncMap === 'object') {
        Object.keys(syncMap).forEach(bId => {
          const pMap = syncMap[bId];
          Object.keys(pMap).forEach(pId => {
            const numId = Number(pId);
            const pIdx = products.findIndex(p => p.id === numId);
            if (pIdx !== -1) {
              if (!products[pIdx].branchStock) products[pIdx].branchStock = {};
              products[pIdx].branchStock![bId] = Number(pMap[pId]);
            }
          });
        });
        writeData(PRODUCTS_FILE, products);
        return res.json({ success: true, message: "Multi-branch inventory map synced", products });
      }

      if (branchId && inventory && typeof inventory === 'object') {
        Object.keys(inventory).forEach(pId => {
          const numId = Number(pId);
          const pIdx = products.findIndex(p => p.id === numId);
          if (pIdx !== -1) {
            if (!products[pIdx].branchStock) products[pIdx].branchStock = {};
            products[pIdx].branchStock![branchId] = Number(inventory[pId]);
          }
        });
        writeData(PRODUCTS_FILE, products);
        return res.json({ success: true, branchId, updatedItems: Object.keys(inventory).length, products });
      }

      if (branchId && productId !== undefined && stock !== undefined) {
        const pIdx = products.findIndex(p => p.id === Number(productId));
        if (pIdx !== -1) {
          if (!products[pIdx].branchStock) products[pIdx].branchStock = {};
          products[pIdx].branchStock![branchId] = Number(stock);
          products[pIdx].branchId = branchId;
          writeData(PRODUCTS_FILE, products);
          return res.json({ success: true, product: products[pIdx] });
        }
        return res.status(404).json({ error: "Product not found" });
      }

      res.status(400).json({ error: "Invalid sync payload format" });
    } catch (e) {
      console.error("Failed to sync branch inventory:", e);
      res.status(500).json({ error: "Failed to sync branch inventory" });
    }
  });

  // PUT UPDATE BRANCH INVENTORY
  app.put("/api/branches/:branchId/inventory", (req, res) => {
    try {
      const { branchId } = req.params;
      const { productId, stock, inventory } = req.body;

      if (inventory && typeof inventory === 'object') {
        Object.keys(inventory).forEach(pId => {
          const numId = Number(pId);
          const pIdx = products.findIndex(p => p.id === numId);
          if (pIdx !== -1) {
            if (!products[pIdx].branchStock) products[pIdx].branchStock = {};
            products[pIdx].branchStock![branchId] = Number(inventory[pId]);
          }
        });
        writeData(PRODUCTS_FILE, products);
        return res.json({ success: true, branchId, updatedCount: Object.keys(inventory).length, products });
      }

      if (productId !== undefined && stock !== undefined) {
        const pIdx = products.findIndex(p => p.id === Number(productId));
        if (pIdx !== -1) {
          if (!products[pIdx].branchStock) products[pIdx].branchStock = {};
          products[pIdx].branchStock![branchId] = Number(stock);
          products[pIdx].branchId = branchId;
          writeData(PRODUCTS_FILE, products);
          return res.json({ success: true, product: products[pIdx] });
        }
        return res.status(404).json({ error: "Product not found" });
      }

      res.status(400).json({ error: "Invalid payload" });
    } catch (e) {
      console.error("Failed to update branch inventory:", e);
      res.status(500).json({ error: "Failed to update branch inventory" });
    }
  });

  // GET ALL PRODUCTS
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  // RESET PRODUCTS TO DEFAULT CATALOG
  app.post("/api/products/reset", (req, res) => {
    try {
      products = [...defaultProducts];
      writeData(PRODUCTS_FILE, products);
      res.json({ success: true, count: products.length, products });
    } catch (e) {
      console.error("Failed to reset products:", e);
      res.status(500).json({ error: "Failed to reset products" });
    }
  });

  // BULK UPDATE PRODUCTS
  app.post("/api/products/bulk", (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        products = req.body;
        writeData(PRODUCTS_FILE, products);
        res.json({ success: true, count: products.length });
      } else {
        res.status(400).json({ error: "Payload must be an array of products" });
      }
    } catch (e) {
      console.error("Failed to bulk update products:", e);
      res.status(500).json({ error: "Failed to bulk update products" });
    }
  });

  // ADD NEW PRODUCT
  app.post("/api/products", (req, res) => {
    try {
      const payload = req.body;
      const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
      const newProduct: Product = {
        id: maxId + 1,
        name: payload.name || "",
        brand: payload.brand || "Kipchimatt",
        category: payload.category || "food cupboard",
        price: Number(payload.price) || 0,
        originalPrice: Number(payload.originalPrice) || 0,
        stock: Number(payload.stock) || 0,
        branchId: payload.branchId || "kericho",
        branchStock: payload.branchStock || {},
        image: payload.image || "",
        description: payload.description || "",
        specifications: payload.specifications || {},
        rating: payload.rating || 5,
        ratingCount: payload.ratingCount || 0,
        reviews: payload.reviews || []
      };
      products.push(newProduct);
      writeData(PRODUCTS_FILE, products);
      res.json(newProduct);
    } catch (e) {
      console.error("Failed to add product:", e);
      res.status(500).json({ error: "Failed to add product" });
    }
  });

  // UPDATE PRODUCT (e.g. edits, review posts, stock refills)
  app.put("/api/products/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Product not found" });
      }
      products[idx] = {
        ...products[idx],
        ...req.body,
        id // Keep original ID safe
      };
      writeData(PRODUCTS_FILE, products);
      res.json(products[idx]);
    } catch (e) {
      console.error("Failed to update product:", e);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // DELETE PRODUCT
  app.delete("/api/products/:id", (req, res) => {
    try {
      const id = Number(req.params.id);
      products = products.filter(p => p.id !== id);
      writeData(PRODUCTS_FILE, products);
      res.json({ success: true });
    } catch (e) {
      console.error("Failed to delete product:", e);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // GET ALL ORDERS
  app.get("/api/orders", (req, res) => {
    res.json(orders);
  });

  // BULK UPDATE ORDERS
  app.post("/api/orders/bulk", (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        orders = req.body;
        writeData(ORDERS_FILE, orders);
        res.json({ success: true, count: orders.length });
      } else {
        res.status(400).json({ error: "Payload must be an array of orders" });
      }
    } catch (e) {
      console.error("Failed to bulk update orders:", e);
      res.status(500).json({ error: "Failed to bulk update orders" });
    }
  });

  // PLACE NEW ORDER (performs client-side item inventory deduction on server)
  app.post("/api/orders", (req, res) => {
    try {
      const payload = req.body;
      const newOrder: Order = {
        id: payload.id,
        items: payload.items || [],
        customer: payload.customer,
        payment: payload.payment,
        subtotal: Number(payload.subtotal) || 0,
        deliveryFee: Number(payload.deliveryFee) || 0,
        total: Number(payload.total) || 0,
        status: payload.status || "pending",
        notes: payload.notes || "",
        date: payload.date || new Date().toISOString()
      };

      // Deduct inventory levels on server to guarantee stock sync
      newOrder.items.forEach(item => {
        const pIdx = products.findIndex(p => p.id === item.id);
        if (pIdx !== -1) {
          products[pIdx].stock = Math.max(0, products[pIdx].stock - item.qty);
        }
      });
      writeData(PRODUCTS_FILE, products);

      orders.unshift(newOrder);
      writeData(ORDERS_FILE, orders);
      res.json(newOrder);
    } catch (e) {
      console.error("Failed to process order:", e);
      res.status(500).json({ error: "Failed to process order" });
    }
  });

  // UPDATE ORDER (status adjustments or administrative staff logs)
  app.put("/api/orders/:id", (req, res) => {
    try {
      const id = req.params.id;
      const idx = orders.findIndex(o => o.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Order not found" });
      }
      orders[idx] = {
        ...orders[idx],
        ...req.body
      };
      writeData(ORDERS_FILE, orders);
      res.json(orders[idx]);
    } catch (e) {
      console.error("Failed to update order:", e);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // GET STORE CONFIGURATION SETTINGS
  app.get("/api/settings", (req, res) => {
    res.json(settings);
  });

  // SAVE STORE CONFIGURATION SETTINGS
  app.post("/api/settings", (req, res) => {
    try {
      settings = {
        ...settings,
        ...req.body
      };
      writeData(SETTINGS_FILE, settings);
      res.json(settings);
    } catch (e) {
      console.error("Failed to save settings:", e);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // GET LOW STOCK ALERTS
  app.get("/api/admin-alerts", (req, res) => {
    res.json(adminAlerts);
  });

  // BULK UPDATE ADMIN ALERTS
  app.post("/api/admin-alerts/bulk", (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        adminAlerts = req.body;
        writeData(ALERTS_FILE, adminAlerts);
        res.json({ success: true, count: adminAlerts.length });
      } else {
        res.status(400).json({ error: "Payload must be an array of alerts" });
      }
    } catch (e) {
      console.error("Failed to bulk update alerts:", e);
      res.status(500).json({ error: "Failed to bulk update alerts" });
    }
  });

  // RECORD NEW LOW STOCK ALERT
  app.post("/api/admin-alerts", (req, res) => {
    try {
      const newAlert = req.body;
      adminAlerts.unshift(newAlert);
      writeData(ALERTS_FILE, adminAlerts);
      res.json(newAlert);
    } catch (e) {
      console.error("Failed to log low stock alert:", e);
      res.status(500).json({ error: "Failed to log alert" });
    }
  });

  // --- VITE DEV MIDDLEWARE AND STATIC PRODUCTION LAYER ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on port ${PORT}`);
  });
}

startServer();
