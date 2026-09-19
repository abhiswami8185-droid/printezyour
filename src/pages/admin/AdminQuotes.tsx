import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  DollarSign,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { QuoteRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AdminQuotesProps {
  quotes: QuoteRequest[];
  onQuoteUpdated: () => void;
  onNavigateTab: (tab: string, param?: string) => void;
}

export const AdminQuotes: React.FC<AdminQuotesProps> = ({ quotes = [], onQuoteUpdated, onNavigateTab }) => {
  const { role } = useAuth();
  const safeQuotes = Array.isArray(quotes) ? quotes : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeQuote, setActiveQuote] = useState<QuoteRequest | null>(null);

  const [quotedPrice, setQuotedPrice] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredQuotes = safeQuotes.filter(q => {
    if (statusFilter !== 'All' && q.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        q.id.toLowerCase().includes(query) ||
        q.customerName.toLowerCase().includes(query) ||
        q.phone.includes(query) ||
        q.serviceCategory.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleUpdatePrice = async () => {
    if (!activeQuote) return;
    setIsProcessing(true);
    try {
      const updated = await api.updateQuote(
        activeQuote.id,
        {
          quotedPrice: Number(quotedPrice),
          adminNotes,
          status: 'Quoted'
        },
        role
      );
      setActiveQuote(updated);
      onQuoteUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update quote');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvertToOrder = async () => {
    if (!activeQuote) return;
    const priceToUse = quotedPrice || activeQuote.quotedPrice || 0;
    if (priceToUse <= 0) {
      alert('Please specify a valid quoted price before converting to an order');
      return;
    }

    setIsProcessing(true);
    try {
      const order = await api.convertQuoteToOrder(activeQuote.id, priceToUse, role);
      alert(`Quote converted successfully into Order ${order.id}!`);
      setActiveQuote(null);
      onQuoteUpdated();
      onNavigateTab('orders', order.id);
    } catch (err: any) {
      alert(err.message || 'Failed to convert quote');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Quotation & Custom Estimation Desk
          </h2>
          <p className="text-xs text-slate-500">
            Review enterprise RFQs, set commercial pricing, and convert approved specs directly to press orders.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600">
          Showing {filteredQuotes.length} inquiries
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Quote ID, customer, category..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'New', 'Under Review', 'Quoted', 'Converted to Order'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="p-3.5 pl-5">Quote ID</th>
                <th className="p-3.5">Customer / Company</th>
                <th className="p-3.5">Category & Specs</th>
                <th className="p-3.5 text-center">Quantity</th>
                <th className="p-3.5 text-right">Quoted Price</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No quotations matching criteria.
                  </td>
                </tr>
              ) : (
                (filteredQuotes || []).map(quote => (
                  <tr key={quote.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-pink-600">
                      {quote.id}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{quote.customerName}</div>
                      <div className="text-[11px] text-slate-400">
                        {quote.phone} {quote.company ? `· ${quote.company}` : ''}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate">{quote.serviceCategory}</div>
                      <div className="text-[11px] text-slate-500 truncate">{quote.productRequirement}</div>
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-700">
                      {quote.quantity?.toLocaleString('en-IN') || 'Custom'}
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900">
                      {quote.quotedPrice ? `₹${quote.quotedPrice.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          quote.status === 'Converted to Order'
                            ? 'bg-emerald-100 text-emerald-800'
                            : quote.status === 'Quoted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {quote.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => {
                          setActiveQuote(quote);
                          setQuotedPrice(quote.quotedPrice || 0);
                          setAdminNotes(quote.adminNotes || '');
                        }}
                        className="bg-pink-50 hover:bg-pink-600 text-pink-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Evaluate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Evaluation Modal */}
      {activeQuote && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quotation Evaluation
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 flex items-center gap-2">
                  <span>{activeQuote.id}</span>
                  <span className="text-xs font-semibold bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full">
                    {activeQuote.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveQuote(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inquirer Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border">
              <div>
                <span className="text-slate-400 block text-[10px]">Client</span>
                <strong className="text-slate-900">{activeQuote.customerName}</strong>
                <div>Phone: {activeQuote.phone}</div>
                <div>Email: {activeQuote.email}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Job Category</span>
                <strong className="text-slate-900">{activeQuote.serviceCategory}</strong>
                <div>Quantity: {activeQuote.quantity} units</div>
                <div>Size: {activeQuote.sizeSpecs || 'Standard'}</div>
              </div>
            </div>

            {/* Requirement Description */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Customer Requirement
              </span>
              <p className="p-3 bg-slate-50 border rounded-xl text-slate-700 leading-relaxed">
                {activeQuote.productRequirement}
              </p>
            </div>

            {/* Quotation Calculator / Inputs */}
            <div className="space-y-4 pt-2 border-t text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official Quoted Price (₹ Excl. GST) *
                  </label>
                  <input
                    type="number"
                    value={quotedPrice}
                    onChange={e => setQuotedPrice(Number(e.target.value))}
                    placeholder="e.g. 18500"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated With 18% GST</label>
                  <div className="p-2.5 bg-slate-100 rounded-lg font-bold text-sm text-slate-800">
                    ₹{Math.round(quotedPrice * 1.18).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes / Turnaround Offer</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="e.g. Heidelberg run, 4-day delivery to Chandigarh warehouse"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleUpdatePrice}
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Save Quoted Price
                </button>

                <button
                  type="button"
                  onClick={handleConvertToOrder}
                  disabled={isProcessing || activeQuote.status === 'Converted to Order'}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {activeQuote.status === 'Converted to Order'
                      ? 'Already Converted'
                      : 'Convert to Live Press Order'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
