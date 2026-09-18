import React from 'react';
import { Printer, X, CheckCircle2, Download } from 'lucide-react';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { BarcodeSvg } from '../barcode/BarcodeSvg';

interface ReceiptModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, isOpen, onClose }) => {
  const { currentEnterprise } = useApp();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-white text-sm">Sale Completed Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Preview (Formatted as 80mm POS Thermal Slip) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
          
          <div
            id="thermal-receipt"
            className="w-[320px] bg-white text-slate-950 p-6 rounded shadow-lg border border-slate-200 text-xs font-mono select-text"
          >
            {/* Store Header */}
            <div className="text-center space-y-1 mb-4 border-b border-dashed border-slate-400 pb-3">
              <h1 className="text-sm font-extrabold uppercase tracking-tight text-slate-900 font-sans">
                {currentEnterprise.name}
              </h1>
              <p className="text-[10px] text-slate-600">{currentEnterprise.address}</p>
              <p className="text-[10px] text-slate-600">Tel: {currentEnterprise.phone}</p>
              {currentEnterprise.vatNumber && (
                <p className="text-[10px] text-slate-600">Tax ID: {currentEnterprise.vatNumber}</p>
              )}
              <div className="pt-1 text-[11px] font-bold text-slate-800">
                Branch: {sale.branchName}
              </div>
            </div>

            {/* Invoice & Order Meta */}
            <div className="text-[11px] space-y-0.5 mb-3 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>Invoice:</span>
                <span className="font-bold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date/Time:</span>
                <span>{new Date(sale.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{sale.cashierName}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-semibold">{sale.customerName}</span>
                </div>
              )}
              {sale.tableNumber && (
                <div className="flex justify-between text-indigo-900 font-bold">
                  <span>Table / Dine-in:</span>
                  <span>{sale.tableNumber}</span>
                </div>
              )}
            </div>

            {/* Itemized Lines */}
            <div className="mb-3 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between font-bold text-[11px] border-b border-slate-300 pb-1 mb-1">
                <span>Item</span>
                <span className="text-right">Qty x Price</span>
                <span className="text-right">Total</span>
              </div>

              <div className="space-y-1.5">
                {sale.items.map((item, i) => {
                  const lineTotal = (item.price * item.quantity) * (1 - (item.discount || 0) / 100);
                  return (
                    <div key={i} className="text-[11px]">
                      <div className="font-bold text-slate-900 leading-tight">
                        {item.name} {item.variantName ? `(${item.variantName})` : ''}
                      </div>
                      <div className="flex justify-between text-slate-600 text-[10px]">
                        <span>
                          {item.quantity} {item.unit} @ ${item.price.toFixed(2)}
                          {item.discount > 0 ? ` (-${item.discount}%)` : ''}
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          ${lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals & Tax Calculation */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-2 mb-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-${sale.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {sale.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({currentEnterprise.taxRate}%):</span>
                  <span>${sale.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {sale.serviceCharge > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Service Charge:</span>
                  <span>${sale.serviceCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-1 border-t border-slate-300">
                <span>TOTAL:</span>
                <span>${sale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="space-y-0.5 text-[11px] mb-4">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-bold uppercase">{sale.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span>${sale.amountPaid.toFixed(2)}</span>
              </div>
              {sale.changeDue > 0 && (
                <div className="flex justify-between font-bold text-slate-950">
                  <span>Change Due:</span>
                  <span>${sale.changeDue.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Barcode on Receipt */}
            <div className="flex flex-col items-center justify-center my-3 pt-1">
              <BarcodeSvg
                value={sale.invoiceNumber}
                width={200}
                height={45}
                includeText={true}
                barColor="#000"
                textColor="#000"
              />
            </div>

            {/* Footer Greeting */}
            <div className="text-center text-[10px] text-slate-500 space-y-0.5 mt-2">
              <p className="font-semibold text-slate-700">Thank you for your business!</p>
              <p>Please retain this receipt for warranty and returns.</p>
              <p className="text-[9px] text-slate-400">Powered by OmniPOS Multi-Enterprise Platform</p>
            </div>

          </div>

        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
          >
            Close
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Receipt (80mm)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
