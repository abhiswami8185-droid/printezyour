import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Building,
  TrendingUp,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import { Customer } from '../../types';

interface AdminCustomersProps {
  customers: Customer[];
  onNavigateTab: (tab: string, param?: string) => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ customers = [], onNavigateTab }) => {
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = safeCustomers.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Customer Directory & Commercial Accounts
          </h2>
          <p className="text-xs text-slate-500">
            Enterprise clients, recurring corporate accounts, order frequency, and lifetime spend.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600">
          {customers.length} Registered Accounts
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by client name, mobile, email, firm..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="p-3.5 pl-5">Client / Firm</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5 text-center">Orders Placed</th>
                <th className="p-3.5 text-right">Lifetime Invoiced</th>
                <th className="p-3.5 pr-5 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(filtered || []).map(cust => (
                <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-slate-900">{cust.name}</div>
                    {cust.company && (
                      <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span>{cust.company}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3.5">
                    <div className="font-medium text-slate-800">{cust.mobile}</div>
                    <div className="text-[10px] text-slate-400">{cust.email}</div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div>{cust.city}, {cust.state}</div>
                    <div className="text-[10px] text-slate-400">{cust.pincode}</div>
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-700">
                    {cust.totalOrders}
                  </td>
                  <td className="p-3.5 text-right font-black text-slate-900 font-display">
                    ₹{cust.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <a
                      href={`https://wa.me/${cust.mobile.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(cust.name)}%2C%20greetings%20from%20PrintezYour%20Chandigarh.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
