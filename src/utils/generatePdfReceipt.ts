import jsPDF from 'jspdf';
import { Order, StoreSettings } from '../types';
import { formatMoney } from '../data/catalog';

export function generatePdfReceipt(order: Order, settings: StoreSettings): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const receiptNo = order.receiptNo || `KIP-REC-${order.id.slice(-6).toUpperCase()}`;
  const txnRef = order.transactionRef || `MP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const vatAmount = order.vatAmount || Math.round((order.total * 0.16) / 1.16);

  // Header Banner Background (Plum Color: #6b21a8)
  doc.setFillColor(107, 33, 168);
  doc.rect(0, 0, 210, 32, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('KIPCHIMATT SUPERMARKET', 15, 17);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL TAX INVOICE & DIGITAL RECEIPT', 15, 24);

  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt #: ${receiptNo}`, 195, 17, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(order.date).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}`, 195, 24, { align: 'right' });

  // Store Info & KRA Details
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  let y = 40;

  doc.text('Kipchimatt Supermarkets Ltd', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Head Office: Koinange Street, Nairobi | Tel: ${settings.storePhone}`, 15, y + 5);
  doc.text(`KRA PIN: P051928374Z | ETR Serial No: KRA-2026-99210`, 15, y + 10);

  y += 16;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(15, y, 195, y);

  // Customer & Payment Info Box
  y += 6;
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(15, y, 180, 32, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  // Column 1
  doc.text('CUSTOMER DETAILS', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${order.customer.name}`, 20, y + 13);
  doc.text(`Phone: ${order.customer.phone}`, 20, y + 18);
  doc.text(`Address: ${order.customer.address}, ${order.customer.county}`, 20, y + 23);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT SUMMARY', 110, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Method: ${order.payment}`, 110, y + 13);
  doc.text(`Transaction Ref: ${txnRef}`, 110, y + 18);
  doc.text(`Status: PAID IN FULL (SUCCESS)`, 110, y + 23);

  y += 38;

  // Items Table Header
  doc.setFillColor(107, 33, 168);
  doc.rect(15, y, 180, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.text('Item Description', 20, y + 5.5);
  doc.text('Qty', 120, y + 5.5, { align: 'center' });
  doc.text('Unit Price', 150, y + 5.5, { align: 'right' });
  doc.text('Total Price', 190, y + 5.5, { align: 'right' });

  y += 8;

  // Items Rows
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');

  order.items.forEach((item, idx) => {
    // Page overflow guard
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, y, 180, 7, 'F');
    }

    const shortName = item.name.length > 42 ? item.name.substring(0, 42) + '...' : item.name;
    doc.text(shortName, 20, y + 5);
    doc.text(String(item.qty), 120, y + 5, { align: 'center' });
    doc.text(formatMoney(item.price), 150, y + 5, { align: 'right' });
    doc.text(formatMoney(item.price * item.qty), 190, y + 5, { align: 'right' });

    y += 7;
  });

  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, 195, y);

  // Summary Totals
  y += 6;
  doc.setFontSize(9);

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 140, y);
  doc.text(formatMoney(order.subtotal), 190, y, { align: 'right' });

  if (order.discountAmount && order.discountAmount > 0) {
    y += 5;
    doc.setTextColor(0, 128, 0);
    doc.text(`Discount (${order.couponCode || 'Applied'}):`, 140, y);
    doc.text(`-${formatMoney(order.discountAmount)}`, 190, y, { align: 'right' });
    doc.setTextColor(40, 40, 40);
  }

  y += 5;
  doc.text('Delivery Fee:', 140, y);
  doc.text(order.deliveryFee === 0 ? 'FREE' : formatMoney(order.deliveryFee), 190, y, { align: 'right' });

  y += 5;
  doc.setTextColor(100, 100, 100);
  doc.text('Included VAT (16%):', 140, y);
  doc.text(formatMoney(vatAmount), 190, y, { align: 'right' });

  y += 7;
  doc.setDrawColor(107, 33, 168);
  doc.setLineWidth(0.8);
  doc.line(135, y, 195, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(107, 33, 168);
  doc.text('TOTAL PAID:', 140, y);
  doc.text(formatMoney(order.total), 190, y, { align: 'right' });

  // Verification & Barcode Box
  y += 16;
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(15, y, 180, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(`POS REGISTER AUTH CODE: ${receiptNo}`, 20, y + 6);
  doc.text(`LOYALTY POINTS EARNED: +${Math.floor(order.total / 100)} Points`, 20, y + 11);

  // Decorative barcode bars
  let barX = 20;
  doc.setFillColor(30, 30, 30);
  for (let i = 0; i < 46; i++) {
    const width = i % 3 === 0 ? 1.2 : i % 2 === 0 ? 0.8 : 0.4;
    doc.rect(barX, y + 14, width, 5, 'F');
    barX += width + 0.6;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Terminal: POS-T04 | Cashier: System Auto-ETR | Ref: ${txnRef}`, 190, y + 18, { align: 'right' });

  // Footer Message
  y += 28;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Thank you for shopping with Kipchimatt Supermarkets!', 105, y, { align: 'center' });
  doc.text('Goods in sound condition returnable within 7 days with this official receipt.', 105, y + 4, { align: 'center' });

  // Save the PDF
  doc.save(`Kipchimatt_Receipt_${receiptNo}.pdf`);
}
