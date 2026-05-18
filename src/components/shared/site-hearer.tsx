import { PLAY_STORE_URL } from '@/lib/constants';
import { ArrowUpRight } from 'lucide-react';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900 tracking-tight">Rentora</span>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-gray-700 transition-colors"
        >
          Get the App
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  );
}