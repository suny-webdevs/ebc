'use client';

import React, { useState } from 'react';
import { X, Download, FileText, Printer, Check, User, MapPin, Hash, Sparkles } from 'lucide-react';
import { CalculationInput, DetailedCostBreakdown } from '../lib/types';
import { downloadElectricBillPdf } from '../lib/pdf-generator';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: CalculationInput;
  breakdown: DetailedCostBreakdown;
  onUpdateCustomerInfo: (info: { customerName?: string; accountNumber?: string; address?: string }) => void;
}

export function PdfReportModal({
  isOpen,
  onClose,
  input,
  breakdown,
  onUpdateCustomerInfo,
}: PdfReportModalProps) {
  const [customerName, setCustomerName] = useState(input.customerName || 'Residential Consumer');
  const [accountNumber, setAccountNumber] = useState(input.accountNumber || 'EBC-MTR-988421');
  const [address, setAddress] = useState(input.address || '742 Evergreen Terrace, Grid Interconnect');
  const [notes, setNotes] = useState(
    'This statement was generated for comprehensive electric bill budgeting, rate comparison, and energy efficiency audit.'
  );
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsGenerating(true);
    // Update customer info
    onUpdateCustomerInfo({ customerName, accountNumber, address });

    setTimeout(() => {
      downloadElectricBillPdf(
        {
          input: {
            ...input,
            customerName,
            accountNumber,
            address,
          },
          breakdown,
          notes,
        },
        `EBC-Electric-Bill-Audit-${customerName.replace(/\s+/g, '_')}.pdf`
      );
      setIsGenerating(false);
      onClose();
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate PDF Utility Audit</h3>
              <p className="text-xs text-slate-300">Customize statement headers before downloading</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Account / Consumer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              Meter / Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Premises / Service Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Custom Statement Notes / Header Disclaimer
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Quick statement specs summary */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
            <span>Net Usage: <strong className="text-slate-900">{Math.round(breakdown.netBilledKwh)} kWh</strong></span>
            <span>Total Charges: <strong className="text-slate-900">{input.currency.symbol}{breakdown.totalBill.toFixed(2)}</strong></span>
            <span>Format: <strong>A4 Portrait PDF</strong></span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print View</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleDownload}
              className="px-4.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <span>Generating Document...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
