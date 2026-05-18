/**
 * Place this file at:
 *   src/components/property-public/StickyEnquireBar.tsx
 */
'use client';

import { useEffect, useState } from 'react';

interface Props {
  price: number;
  billingLabel: string;
  whatsappHref: string;
  shareUrl: string;
  shareTitle: string;
}

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function StickyEnquireBar({ price, billingLabel, whatsappHref, shareUrl, shareTitle }: Props) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 380);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleShare = async () => {
    // Assign to a typed local variable — avoids TypeScript narrowing navigator to `never`
    // in the else-branch after the 'share' in navigator check.
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };

    if (nav.share) {
      try {
        await nav.share({ title: shareTitle, url: shareUrl });
      } catch {
        // user cancelled — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        // clipboard unavailable
      }
    }
  };

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-50 sm:hidden transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!visible}
    >
      <div
        className="bg-white/96 backdrop-blur-xl border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 pt-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center gap-3">

          {/* Price */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 leading-none mb-0.5">
              Listed price
            </p>
            <p className="text-xl font-black text-gray-900 leading-tight truncate">
              UGX {Number(price).toLocaleString()}
              <span className="text-xs font-medium text-gray-400 ml-1">/{billingLabel}</span>
            </p>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex-shrink-0 h-11 w-11 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
            aria-label={copied ? 'Link copied' : 'Share listing'}
          >
            {copied ? (
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>

          {/* WhatsApp CTA */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] active:scale-[0.97] text-white text-sm font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-green-500/25"
          >
            {WA_ICON}
            Enquire
          </a>
        </div>
      </div>
    </div>
  );
}