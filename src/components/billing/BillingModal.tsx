import React, { useState } from 'react';
import {
  Printer,
  Download,
  X,
  FileText,
  Building,
  CheckCircle2,
  Calendar,
  CreditCard,
  Percent,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Receipt
} from 'lucide-react';
import { Order, BusinessSettings } from '../../types';
import { generateBillingPDF, BillingConfig } from '../../utils/billingPdf';
import { numberToWordsINR } from '../../utils/numberToWords';

interface BillingModalProps {
  order: Order;
  settings: BusinessSettings | null;
  onClose: () => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  order,
  settings,
  onClose
}) => {
  const [billType, setBillType] = useState<'GST' | 'NON_GST'>('GST');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Dynamic config with sensible defaults
  const orderDateStr = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const defaultInvNo = billType === 'GST'
    ? `INV-PY-${order.id.slice(-6).toUpperCase()}`
    : `BILL-PY-${order.id.slice(-6).toUpperCase()}`;

  const [invoiceNo, setInvoiceNo] = useState(defaultInvNo);
  const [invoiceDate, setInvoiceDate] = useState(orderDateStr);
  const [customerGstin, setCustomerGstin] = useState<string>((order.customer as any).gstin || '');
  const [placeOfSupply, setPlaceOfSupply] = useState<string>(
    order.customer.state ? `${order.customer.state}` : '04-Chandigarh'
  );

  // When billType changes, update invoice prefix if user hasn't heavily customized it
  const handleBillTypeChange = (type: 'GST' | 'NON_GST') => {
    setBillType(type);
    const newPrefix = type === 'GST' ? 'INV-PY-' : 'BILL-PY-';
    setInvoiceNo(`${newPrefix}${order.id.slice(-6).toUpperCase()}`);
  };

  const isGST = billType === 'GST';
  const gstPercent = settings?.defaultGstPercent || 18;

  // Intra-state vs Inter-state determination
  const isIntraState = placeOfSupply.toLowerCase().includes('04') ||
    placeOfSupply.toLowerCase().includes('chandigarh') ||
    (order.customer.state && order.customer.state.toLowerCase().includes('chandigarh'));

  const subtotal = order.subtotal;
  const deliveryFee = order.deliveryFee || 0;
  const discount = order.discountAmount || 0;
  const taxAmount = isGST ? (order.taxAmount || Math.round(subtotal * (gstPercent / 100))) : 0;
  const grandTotal = isGST ? order.totalAmount : (subtotal + deliveryFee - discount);

  const billingConfig: BillingConfig = {
    billType,
    invoiceNo,
    invoiceDate,
    placeOfSupply,
    customerGstin
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const doc = generateBillingPDF(order, settings, billingConfig);
      const filename = `${isGST ? 'Tax-Invoice' : 'Non-GST-Bill'}-${invoiceNo}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container Card */}
      <div className="bg-slate-100 w-full max-w-5xl max-h-[96vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300">
        
        {/* Top Header / Control Toolbar (no-print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Commercial Billing & Invoice Module</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Order #{order.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate production-ready GST Tax Invoices or Non-GST Commercial Bills with statutory Indian compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-xs border border-slate-700 transition-colors"
              title="Print directly or save as PDF via system dialog"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Print Bill</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors disabled:opacity-50"
              title="Generate precision vector PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Configuration Bar (no-print) */}
        <div className="no-print bg-white p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Bill Type Selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Bill Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleBillTypeChange('GST')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    isGST
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                    isGST ? 'border-blue-600 bg-blue-600' : 'border-slate-400'
                  }`}>
                    {isGST && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs">GST Bill (Tax Invoice)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Statutory invoice with GSTIN ({settings?.gstin || '04AABCP8557N1Z9'}), HSN/SAC codes & tax breakup.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleBillTypeChange('NON_GST')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    !isGST
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                    !isGST ? 'border-blue-600 bg-blue-600' : 'border-slate-400'
                  }`}>
                    {!isGST && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs">Non-GST Bill</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Commercial non-tax voucher / cash memo for clients without GST requirements.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Invoice No & Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isGST ? 'Invoice Number' : 'Bill Number'}
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-blue-500"
              />

              <label className="block text-xs font-bold text-slate-700 mt-2 mb-1">
                Bill Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-blue-500"
              />
            </div>

            {/* Place of Supply & Customer GSTIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Place of Supply (State)
              </label>
              <input
                type="text"
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
                placeholder="e.g. 04-Chandigarh"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-blue-500"
              />

              {isGST && (
                <>
                  <label className="block text-xs font-bold text-slate-700 mt-2 mb-1">
                    Customer GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerGstin}
                    onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 04AAAAA0000A1Z5"
                    className="w-full text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-blue-500"
                  />
                </>
              )}
            </div>

          </div>
        </div>

        {/* Live A4 Invoice Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/70 flex justify-center">
          
          <div
            id="printable-invoice-sheet"
            className="bg-white w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-8 rounded-lg shadow-lg border border-slate-300 text-slate-900 flex flex-col justify-between"
            style={{ boxSizing: 'border-box' }}
          >
            <div>
              {/* Top Cyan/Blue Branding Bar */}
              <div className="h-1.5 bg-blue-700 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6" />

              {/* Document Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                    {isGST ? 'TAX INVOICE' : 'NON-GST BILL / CASH MEMO'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isGST
                      ? 'Issued under Section 31 of CGST / SGST Act 2017'
                      : 'Commercial Voucher · Not an Input Tax Credit document'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 inline-block">
                    {invoiceNo}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Date: {invoiceDate}</div>
                  <div className="text-xs text-slate-400 font-mono">Order: #{order.id}</div>
                </div>
              </div>

              {/* Company & Customer Details Side-by-Side */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
                
                {/* Supplier / Seller Info */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                    SUPPLIER / ISSUER
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {settings?.brandName || 'PrintezYour Commercial Printing Hub'}
                  </div>
                  <div className="text-slate-600 mt-1 leading-snug">
                    {settings?.address || 'Plot No 1794, Gym Deep Complex, Hallo Majra'}, {settings?.city || 'Chandigarh'} - {settings?.pincode || '160002'}
                  </div>
                  <div className="text-slate-500 mt-1">
                    Phone: {settings?.phone || '+91 8557049897'}
                  </div>
                  <div className="text-slate-500">
                    Email: {settings?.email || 'printezyour@gmail.com'}
                  </div>
                  {isGST && (
                    <div className="mt-2 pt-2 border-t border-slate-200 font-semibold text-slate-800">
                      GSTIN: <span className="font-mono text-blue-700">{settings?.gstin || '04AABCP8557N1Z9'}</span> (04-Chandigarh)
                    </div>
                  )}
                </div>

                {/* Buyer / Recipient Info */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                    BILLED TO / RECIPIENT
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {order.customer.name}
                  </div>
                  {order.customer.company && (
                    <div className="text-slate-700 font-medium text-xs">
                      {order.customer.company}
                    </div>
                  )}
                  <div className="text-slate-600 mt-1 leading-snug">
                    {order.customer.billingAddress || order.customer.deliveryAddress}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}
                  </div>
                  <div className="text-slate-500 mt-1">
                    Mobile: {order.customer.mobile}
                  </div>
                  <div className="text-slate-500">
                    Email: {order.customer.email || 'N/A'}
                  </div>
                  {isGST && (
                    <div className="mt-2 pt-2 border-t border-slate-200 font-semibold text-slate-800">
                      GSTIN: <span className="font-mono text-blue-700">{customerGstin || 'Unregistered'}</span> | POS: {placeOfSupply}
                    </div>
                  )}
                </div>

              </div>

              {/* Line Items Table */}
              <div className="mt-4">
                <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-900 text-white text-[11px] font-bold">
                    <tr>
                      <th className="p-2.5 w-8 text-center">#</th>
                      <th className="p-2.5">Item & Specifications</th>
                      {isGST && <th className="p-2.5 text-center">HSN/SAC</th>}
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Rate</th>
                      {isGST && <th className="p-2.5 text-right">Taxable Amt</th>}
                      {isGST && <th className="p-2.5 text-center">GST Rate</th>}
                      <th className="p-2.5 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(order.items || []).map((item, idx) => {
                      const hsn = item.category?.toLowerCase().includes('box') || item.category?.toLowerCase().includes('packaging')
                        ? '4819'
                        : '998912';
                      const unitRate = Math.round((item.subtotal / (item.quantity || 1)) * 100) / 100;
                      const itemTotal = isGST ? Math.round(item.subtotal * (1 + gstPercent / 100)) : item.subtotal;

                      return (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                          <td className="p-2.5 text-center text-slate-500">{idx + 1}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900">{item.productName}</div>
                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {item.selectedOptions.map(o => `${o.groupName}: ${o.valueName}`).join(' | ')}
                              </div>
                            )}
                          </td>
                          {isGST && <td className="p-2.5 text-center font-mono text-slate-600">{hsn}</td>}
                          <td className="p-2.5 text-center font-semibold">{item.quantity}</td>
                          <td className="p-2.5 text-right font-mono">₹{unitRate.toFixed(2)}</td>
                          {isGST && <td className="p-2.5 text-right font-mono font-semibold">₹{item.subtotal.toFixed(2)}</td>}
                          {isGST && <td className="p-2.5 text-center font-semibold text-blue-700">{gstPercent}%</td>}
                          <td className="p-2.5 text-right font-bold font-mono text-slate-900">₹{itemTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation & Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                
                {/* Bank Settlement Info */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Bank & Electronic Payment Details</span>
                    </div>
                    <div className="space-y-0.5 text-slate-700 text-[11px]">
                      <div><strong>Account Name:</strong> PrintezYour Commercial Press</div>
                      <div><strong>Bank:</strong> Axis Bank · Sector 20 Chandigarh</div>
                      <div><strong>Account No:</strong> <span className="font-mono">924020058849182</span></div>
                      <div><strong>IFSC Code:</strong> <span className="font-mono">UTIB0000185</span></div>
                      <div><strong>UPI VPA:</strong> <span className="font-mono text-blue-700 font-semibold">{settings?.upiId || '8557049897@okbizaxis'}</span></div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                    Payment Method: <span className="font-semibold text-slate-800">{order.paymentMethod}</span> | Status: <span className="font-semibold text-emerald-700 uppercase">{order.paymentStatus}</span>
                  </div>
                </div>

                {/* Subtotals & Grand Total */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal (Taxable Value):</span>
                    <span className="font-mono font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {isGST && (
                    <>
                      {isIntraState ? (
                        <>
                          <div className="flex justify-between text-slate-600">
                            <span>CGST ({(gstPercent / 2).toFixed(1)}%):</span>
                            <span className="font-mono font-medium">₹{(taxAmount / 2).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>SGST ({(gstPercent / 2).toFixed(1)}%):</span>
                            <span className="font-mono font-medium">₹{(taxAmount / 2).toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-slate-600">
                          <span>IGST ({gstPercent}%):</span>
                          <span className="font-mono font-medium">₹{taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery & Freight:</span>
                    <span className="font-mono font-medium">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Commercial Discount:</span>
                      <span className="font-mono">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-black text-slate-900">
                    <span>Grand Total:</span>
                    <span className="text-base text-blue-700 font-mono">
                      ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

              </div>

              {/* Amount in words */}
              <div className="mt-3 p-2 bg-slate-100 rounded-lg text-xs text-slate-700">
                <strong>Amount in Words:</strong> {numberToWordsINR(grandTotal)}
              </div>
            </div>

            {/* Bottom Footer & Authorized Signatory */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-3 gap-4 items-end text-[10px]">
                <div className="col-span-2 text-slate-500 space-y-0.5">
                  <div className="font-bold text-slate-700">Terms & Conditions:</div>
                  <div>1. Custom manufactured goods printed according to client-approved design are non-returnable.</div>
                  <div>2. Shortages or transit damages must be notified within 24 hours of delivery.</div>
                  <div>3. Overdue accounts will be charged interest @ 18% p.a.</div>
                  <div>4. All claims and disputes are strictly subject to Chandigarh jurisdiction only.</div>
                </div>

                <div className="text-center">
                  <div className="font-bold text-slate-800 text-xs">For {settings?.brandName || 'PrintezYour'}</div>
                  <div className="my-2 border border-blue-700 rounded-md p-1.5 inline-block text-[9px] font-bold text-blue-800 bg-blue-50/50">
                    PRINTEZYOUR PRESS<br />AUTHENTICATED & VERIFIED
                  </div>
                  <div className="text-slate-500 font-medium">Authorized Signatory</div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 text-center text-[9px] text-slate-400">
                This is a computer-generated commercial document issued by PrintezYour ERP · Generated on {new Date().toLocaleString('en-IN')}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
