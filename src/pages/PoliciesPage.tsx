import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck,
  Truck,
  CreditCard,
  RefreshCw,
  Lock,
  FileText
} from 'lucide-react';

interface PoliciesPageProps {
  initialPolicy?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ initialPolicy }) => {
  const [activeTab, setActiveTab] = useState(initialPolicy || 'print-quality');

  useEffect(() => {
    if (initialPolicy) {
      setActiveTab(initialPolicy);
    }
  }, [initialPolicy]);

  const policies = [
    { id: 'print-quality', label: 'Print Quality Policy', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'design-approval', label: 'Design Approval & Proofing', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'delivery', label: 'Delivery & Pickup Policy', icon: <Truck className="w-4 h-4" /> },
    { id: 'payment', label: 'Payment Terms & GST', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'refund', label: 'Return & Refund Policy', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Artwork Confidentiality', icon: <Lock className="w-4 h-4" /> },
    { id: 'terms', label: 'Terms & Conditions', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          Transparency & Assurance
        </span>
        <h1 className="text-3xl font-black text-slate-900 font-display mt-1">
          Business Policies & Service Terms
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review our operational quality standards, proofing protocols, and customer guarantees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Tabs */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-2 space-y-1 shadow-xs sticky top-24">
          {policies.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === p.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {p.icon}
              <span className="truncate">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Right Policy Content */}
        <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs text-xs sm:text-sm text-slate-600 space-y-6 leading-relaxed">
          {activeTab === 'print-quality' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Commercial Printing Quality Policy
              </h2>
              <p>
                PrintezYour operates high-speed commercial Heidelberg offset and Roland large-format digital presses.
                All print jobs are executed according to industry color calibration standards:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Color Matching & Tolerances:</strong> Colors rendered on backlit mobile/computer screens (RGB) will
                  experience a slight optical difference when reproduced on paper substrates using CMYK process inks. We maintain
                  an industry-standard ΔE color variance tolerance within acceptable commercial limits (typically within 5-10%).
                </li>
                <li>
                  <strong>Cutting & Bleed:</strong> We enforce a strict ±1.5mm mechanical cutting tolerance. All artwork files
                  must maintain a 3mm safety margin inside the trim line to prevent critical typography or logos from being trimmed.
                </li>
                <li>
                  <strong>Substrates & Papers:</strong> Mill-certified paper stocks (ITC, Century, BILT) are weighed in Grams per Square Metre (GSM).
                  Paper mill tolerances permit a variance of ±5% in paper bulk/density as standard across paper manufacturing.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'design-approval' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Design Approval & Digital Proofing Protocol
              </h2>
              <p>
                To guarantee zero errors before plate-making and press runs, we operate a mandatory proofing procedure:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Digital Proof:</strong> Before any commercial run commences, a digital PDF or high-resolution JPEG proof
                  is transmitted via WhatsApp or Email to the registered contact.
                </li>
                <li>
                  <strong>Customer Responsibility:</strong> It is the client's sole responsibility to verify all text, contact numbers,
                  addresses, spellings, GST numbers, QR codes, and alignment on the proof. Once final written approval is given on WhatsApp,
                  no cancellations or text revisions can be entertained.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Delivery & Pickup Policy
              </h2>
              <p>
                We service clients across Chandigarh Tricity (Chandigarh, Mohali, Panchkula, Zirakpur) and Pan-India:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Self-Pickup:</strong> Free of charge from our Hallo Majra, Chandigarh facility during standard working hours.
                  A WhatsApp alert is triggered as soon as jobs clear finishing and packaging.
                </li>
                <li>
                  <strong>Local Tricity Delivery:</strong> Dispatched via local courier partners or direct delivery vans. Free delivery
                  is automatically unlocked on orders exceeding ₹2,000.
                </li>
                <li>
                  <strong>Pan-India Shipping:</strong> Dispatched through leading air/surface logistics (Delhivery, BlueDart, DTDC, VRL Logistics).
                  Tracking consignments are updated upon pickup.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Payment Terms & GST Invoicing
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Advance Requirement:</strong> Since all print products are bespoke and customized with unique brand artwork,
                  a minimum 50% advance is mandatory prior to plate output. Balance is payable upon dispatch or pickup.
                </li>
                <li>
                  <strong>GST Invoices:</strong> PrintezYour is a registered commercial business entity (GSTIN: 04AABCP8557N1Z9).
                  All orders are charged 18% GST as per statutory printing classification. Tax invoices with your firm's GSTIN
                  are provided for 100% input tax credit (ITC) claims.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Return, Reprint & Refund Policy
              </h2>
              <p>
                Custom manufactured printed items have no resale value. Consequently, refunds cannot be issued for client design mistakes,
                grammatical errors, or change of mind after press approval.
              </p>
              <p>
                <strong>Our 100% Reprint Guarantee:</strong> In the rare event of a verified manufacturing defect (e.g. illegible smudging,
                incorrect paper GSM, incorrect quantity, or severe cutting misalignment exceeding tolerance), PrintezYour will reprint
                and replace the affected batch entirely free of charge upon submission of photos within 48 hours of receipt.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Privacy Policy & Artwork Confidentiality
              </h2>
              <p>
                We recognize that packaging dies, corporate logos, and client files contain sensitive intellectual property.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>All vector files, CDRs, and PDFs uploaded to our system are stored on secure local servers.</li>
                <li>Artwork files are never shared with third parties, competitors, or external marketing entities.</li>
                <li>We do not sell, rent, or lease customer contact lists or database entries.</li>
              </ul>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Standard Commercial Terms & Conditions
              </h2>
              <p>
                By placing an order on the PrintezYour digital platform or via WhatsApp, the client agrees to these standard commercial terms.
                All disputes are subject to the exclusive jurisdiction of the competent courts in Chandigarh, India.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
