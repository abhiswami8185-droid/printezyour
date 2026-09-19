import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

interface WhatsAppFloatingProps {
  currentProduct?: string;
}

export const WhatsAppFloating: React.FC<WhatsAppFloatingProps> = ({ currentProduct }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const defaultMessage = currentProduct
    ? `Hello Printezyour, I am interested in ${currentProduct}. Can you share details and bulk pricing?`
    : `Hello Printezyour, I would like to know more about your printing services.`;

  const waUrl = `https://wa.me/918557049897?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 pointer-events-auto">
      {/* Floating Prompt Bubble */}
      {!isDismissed && (
        <div
          className={`hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs py-2 px-3.5 rounded-full shadow-lg border border-slate-200 transition-all duration-300 ${
            isHovered ? 'scale-105 shadow-xl' : ''
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-700 font-medium"
          >
            {currentProduct ? `Inquire about ${currentProduct}` : 'Need instant printing advice? Chat with us!'}
          </a>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-600 ml-1"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-hidden"
        aria-label="Contact PrintezYour on WhatsApp"
      >
        <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-pulse -z-10" />
        <MessageSquare className="w-7 h-7" />
        <span className="sr-only">WhatsApp +91 8557049897</span>
      </a>
    </div>
  );
};
