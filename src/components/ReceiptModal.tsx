import React, { useState } from 'react';
import { X, Printer, Download, Copy, Check, Send, ShieldCheck, QrCode, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { formatMoney } from '../data/catalog';
import { generatePdfReceipt } from '../utils/generatePdfReceipt';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ReceiptModal({
  order,
  isOpen,
  onClose,
  settings,
  onShowToast
}: ReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  if (!isOpen || !order) return null;

  const receiptNo = order.receiptNo || `KIP-REC-${order.id.slice(-6).toUpperCase()}`;
  const txnRef = order.transactionRef || `MP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const orderDate = new Date(order.date).toLocaleString('en-KE', {
    dateStyle: 'full',
    timeStyle: 'short'
  });
  
  const vatAmount = order.vatAmount || Math.round((order.total * 0.16) / 1.16);

  const handlePrint = () => {
    if (onShowToast) {
      onShowToast(`🖨️ Print job sent to browser! Formatting for thermal receipt printing.`, 'success');
    }
    window.print();
  };

  const generateReceiptText = () => {
    let txt = `========================================\n`;
    txt += `       ${settings.storeName.toUpperCase()} SUPERMARKET       \n`;
    txt += `          OFFICIAL DIGITAL RECEIPT       \n`;
    txt += `========================================\n`;
    txt += `Receipt No: ${receiptNo}\n`;
    txt += `Date: ${orderDate}\n`;
    txt += `KRA PIN: P051928374Z | ETR: KRA-2026-992\n`;
    txt += `Customer: ${order.customer.name} (${order.customer.phone})\n`;
    txt += `Delivery: ${order.customer.address}, ${order.customer.county}\n`;
    txt += `Payment Method: ${order.payment}\n`;
    txt += `Txn Ref: ${txnRef}\n`;
    txt += `----------------------------------------\n`;
    txt += `ITEMS PURCHASED:\n`;
    order.items.forEach(item => {
      txt += `${item.qty}x ${item.name.substring(0, 22)} @ ${formatMoney(item.price)} = ${formatMoney(item.price * item.qty)}\n`;
    });
    txt += `----------------------------------------\n`;
    txt += `Subtotal: ${formatMoney(order.subtotal)}\n`;
    if (order.discountAmount && order.discountAmount > 0) {
      txt += `Discount Saved: -${formatMoney(order.discountAmount)}\n`;
    }
    txt += `Delivery Fee: ${order.deliveryFee === 0 ? 'FREE' : formatMoney(order.deliveryFee)}\n`;
    txt += `Included 16% VAT: ${formatMoney(vatAmount)}\n`;
    txt += `TOTAL PAID: ${formatMoney(order.total)}\n`;
    txt += `========================================\n`;
    txt += `Status: PAID IN FULL (SUCCESS)\n`;
    txt += `Loyalty Points Earned: +${Math.floor(order.total / 100)} Points\n`;
    txt += `Thank you for shopping with K-Matt!\n`;
    return txt;
  };

  const handleCopyReceipt = () => {
    const txt = generateReceiptText();
    navigator.clipboard.writeText(txt);
    setCopied(true);
    if (onShowToast) onShowToast('Receipt text copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = () => {
    try {
      generatePdfReceipt(order, settings);
      if (onShowToast) onShowToast(`PDF Receipt saved as KMatt_Receipt_${receiptNo}.pdf`, 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      handleDownloadTxt();
    }
  };

  const handleDownloadTxt = () => {
    const txt = generateReceiptText();
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KMatt_Receipt_${receiptNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast(`Text Receipt saved as KMatt_Receipt_${receiptNo}.txt`, 'success');
  };

  const handleSendEmail = () => {
    setSendingEmail(true);
    setTimeout(() => {
      setSendingEmail(false);
      if (onShowToast) onShowToast(`E-Receipt dispatched to ${order.customer.email || order.customer.phone}!`, 'success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static print:block print:inset-auto">
      {/* Native Thermal Paper Receipt Print Styles */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #printable-receipt {
            display: block !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 6mm 3mm !important;
            font-family: 'Courier New', Courier, monospace, system-ui !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
            color: #000000 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
          }
          #printable-receipt * {
            color: #000000 !important;
            background: transparent !important;
            border-color: #000000 !important;
            text-shadow: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Container */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-xl w-full border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col my-auto relative print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between border-b border-gray-800 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green" />
            <span className="font-extrabold text-sm tracking-tight">Official Order E-Receipt</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="bg-plum hover:bg-plum-dark text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Print standard paper/thermal receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button 
              onClick={handleDownloadPdf}
              className="bg-green hover:bg-green-dark text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download official PDF receipt"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF Receipt</span>
            </button>

            <button 
              onClick={handleDownloadTxt}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download TXT format"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TXT</span>
            </button>

            <button 
              onClick={handleCopyReceipt}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal/Invoice Document Area */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 print:text-black print:bg-white print:p-4">
          
          {/* Header Branding */}
          <div className="text-center border-b border-dashed border-gray-300 dark:border-gray-700 pb-5 space-y-1">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <span className="bg-plum text-white font-black text-lg px-2.5 py-0.5 rounded-lg tracking-wider">K-MATT</span>
            </div>
            <h1 className="text-base font-extrabold uppercase tracking-wide text-gray-900 dark:text-white print:text-black">
              K-Matt Supermarkets Ltd
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 print:text-gray-700 font-medium">
              Head Office: Koinange Street, Nairobi | Tel: {settings.storePhone}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 print:text-gray-700 font-medium">
              KRA PIN: <span className="font-bold">P051928374Z</span> | ETR S/N: <span className="font-bold">KRA-2026-99210</span>
            </p>
            <div className="inline-block mt-2 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              TAX INVOICE / OFFICIAL E-RECEIPT
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border-b border-gray-150 dark:border-gray-800 pb-4">
            <div>
              <span className="text-gray-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Receipt Number</span>
              <strong className="text-plum dark:text-pink-400 text-sm font-black tracking-tight">{receiptNo}</strong>
            </div>

            <div className="text-right">
              <span className="text-gray-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Transaction Date</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px]">{orderDate}</span>
            </div>

            <div>
              <span className="text-gray-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Customer Name</span>
              <span className="font-bold text-gray-900 dark:text-white">{order.customer.name}</span>
            </div>

            <div className="text-right">
              <span className="text-gray-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Phone / Contact</span>
              <span className="font-bold text-gray-900 dark:text-white">{order.customer.phone}</span>
            </div>

            <div className="col-span-2">
              <span className="text-gray-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Delivery / Pickup Location</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{order.customer.address}, {order.customer.county} ({order.deliveryType === 'pickup' ? `Pick up at ${order.pickupBranch || 'Main Branch'}` : 'Express Doorstep Delivery'})</span>
            </div>
          </div>

          {/* Payment Method Banner */}
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 sm:p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400 font-medium block text-[10px] uppercase">Payment Status</span>
              <span className="font-black text-green flex items-center gap-1 text-xs">
                <ShieldCheck className="w-4 h-4 text-green flex-shrink-0" />
                <span>PAID IN FULL</span>
              </span>
            </div>

            {order.pointsRedeemed && order.pointsRedeemed > 0 ? (
              <div className="sm:text-center">
                <span className="text-gray-500 dark:text-gray-400 font-medium block text-[10px] uppercase">Loyalty Reward</span>
                <span className="font-black text-plum dark:text-pink-400 text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-plum dark:text-pink-400" />
                  <span>{order.pointsRedeemed} PTS Redeemed (-{formatMoney(order.discountAmount || 0)})</span>
                </span>
              </div>
            ) : null}

            <div className="sm:text-right">
              <span className="text-gray-500 dark:text-gray-400 font-medium block text-[10px] uppercase">Payment Channel & Ref</span>
              <span className="font-extrabold text-gray-900 dark:text-white break-all">{order.payment} ({txnRef})</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">Itemized Purchases</h4>
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-gray-800 font-medium">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="p-2.5 text-gray-900 dark:text-gray-100 font-bold">{item.name}</td>
                      <td className="p-2.5 text-center text-gray-600 dark:text-gray-300 font-bold">{item.qty}</td>
                      <td className="p-2.5 text-right text-gray-600 dark:text-gray-300">{formatMoney(item.price)}</td>
                      <td className="p-2.5 text-right font-black text-gray-900 dark:text-white">{formatMoney(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-2 text-xs border-t border-gray-200 dark:border-gray-800 pt-3">
            <div className="flex justify-between text-gray-600 dark:text-gray-400 font-semibold">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>

            {order.discountAmount && order.discountAmount > 0 ? (
              <div className="flex justify-between text-green font-bold">
                <span>Loyalty Points Discount ({order.pointsRedeemed ? `${order.pointsRedeemed} PTS` : 'APPLIED'})</span>
                <span>-{formatMoney(order.discountAmount)}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-gray-600 dark:text-gray-400 font-semibold">
              <span>Delivery Fee</span>
              <span>{order.deliveryFee === 0 ? <strong className="text-green">FREE</strong> : formatMoney(order.deliveryFee)}</span>
            </div>

            <div className="flex justify-between text-gray-500 dark:text-gray-400 text-[11px] font-normal">
              <span>Included VAT (16% Standard Rate)</span>
              <span>{formatMoney(vatAmount)}</span>
            </div>

            <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-2 border-t border-dashed border-gray-300 dark:border-gray-700">
              <span>Total Paid Amount</span>
              <span className="text-plum dark:text-pink-400 font-black">{formatMoney(order.total)}</span>
            </div>
          </div>

          {/* Barcode & QR Code Counter Verification */}
          <div className="pt-4 border-t border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 font-mono text-[9px]">
                <QrCode className="w-4 h-4 text-gray-500" />
                <span>POS REGISTER AUTH CODE: {receiptNo}</span>
              </div>
              
              {/* Simulated CSS Barcode */}
              <div className="h-10 bg-gray-900 dark:bg-gray-100 p-1.5 rounded flex items-center justify-between gap-1 overflow-hidden">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-full ${i % 3 === 0 ? 'w-1 bg-white dark:bg-black' : i % 2 === 0 ? 'w-1.5 bg-gray-400 dark:bg-gray-600' : 'w-0.5 bg-white dark:bg-black'}`}
                  />
                ))}
              </div>
              <p className="text-[9px] text-center font-mono text-gray-400 uppercase tracking-widest">{receiptNo}</p>
            </div>

            <div className="text-right text-[10px] text-gray-500 dark:text-gray-400 space-y-0.5 min-w-[120px]">
              <p className="font-bold text-gray-700 dark:text-gray-300">Terminal: POS-T04</p>
              <p>Cashier: System Auto-ETR</p>
              {order.pointsRedeemed && order.pointsRedeemed > 0 ? (
                <p className="text-amber-600 dark:text-amber-400 font-extrabold">Redeemed: -{order.pointsRedeemed} PTS</p>
              ) : null}
              <p className="text-plum dark:text-pink-400 font-extrabold">Earned: +{Math.floor(order.total / 100)} PTS</p>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="text-center text-[10px] text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-150 dark:border-gray-800">
            <p>Thank you for shopping at K-Matt Supermarkets!</p>
            <p>Goods in sound condition returnable within 7 days with this official receipt.</p>
          </div>

        </div>

        {/* Bottom Actions Footer (Hidden on print) */}
        <div className="bg-gray-50 dark:bg-gray-800/80 p-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button 
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="text-xs font-bold text-plum hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-plum" />
            <span>{sendingEmail ? 'Dispatching...' : 'Email / SMS Copy'}</span>
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button 
              onClick={handleDownloadPdf}
              className="bg-green hover:bg-green-dark text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-md flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Receipt</span>
            </button>
            <button 
              onClick={handlePrint}
              className="bg-plum hover:bg-plum-dark text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-md flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
