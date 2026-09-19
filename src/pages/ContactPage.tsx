import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Printing Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          Direct Facility Contact
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
          Let’s Discuss Your Next Print Project
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Visit our Hallo Majra production facility, call our print specialists, or send a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-3 uppercase tracking-wider text-xs">
              Official Business Details
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Printing Facility Address</div>
                  <p className="mt-0.5 leading-relaxed">
                    Plot No 1794, Gym Deep Complex, Hallo Majra, Near Urban Akhada, Chandigarh – 160002, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Phone Support</div>
                  <a href="tel:+918557049897" className="text-blue-700 font-bold hover:underline block mt-0.5">
                    +91 8557049897
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">WhatsApp Commercial Line</div>
                  <a
                    href="https://wa.me/918557049897"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold hover:underline block mt-0.5"
                  >
                    +91 8557049897 (Click to Chat)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-pink-50 text-pink-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Official Email</div>
                  <a href="mailto:printezyour@gmail.com" className="text-blue-700 hover:underline block mt-0.5">
                    printezyour@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Press & Office Working Hours</div>
                  <p className="mt-0.5">Mon–Fri: 9:00 AM – 7:00 PM</p>
                  <p>Sat: 10:00 AM – 6:00 PM</p>
                  <p className="text-slate-400">Sunday: Closed for maintenance</p>
                </div>
              </div>
            </div>
          </div>

          <a
            href="https://maps.google.com/?q=Plot+No+1794+Gym+Deep+Complex+Hallo+Majra+Chandigarh"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-slate-900 hover:bg-blue-900 text-white font-bold p-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Google Maps Application</span>
          </a>
        </div>

        {/* Right: Message Form + Live Map */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-3 uppercase tracking-wider text-xs">
              Send Direct Message
            </h3>

            {sent ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Message Sent Successfully</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Our team has received your message and will call or email you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Gurpreet"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. you@company.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="General Printing Inquiry">General Printing Inquiry</option>
                      <option value="Bulk Commercial Order">Bulk Commercial Order (5,000+ units)</option>
                      <option value="Packaging & Rigid Boxes">Packaging & Rigid Boxes</option>
                      <option value="Same-Day Rush Job">Same-Day Rush Event Job</option>
                      <option value="Existing Order Follow-Up">Existing Order Follow-Up</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your requirements or question..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Embedded Google Map */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-16/9 bg-slate-100 shadow-xs">
            <iframe
              title="PrintezYour Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13723.364448575073!2d76.7905183!3d30.7046187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390fed15a31a90c1%3A0xe7bc386121e78df!2sHallo%20Majra%2C%20Chandigarh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
