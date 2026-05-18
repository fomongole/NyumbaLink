import Link from 'next/link';

interface SiteFooterProps {
  /** Pass 'privacy' to show a link to /privacy, 'terms' for /terms, or omit for no link. */
  crossLink?: 'privacy' | 'terms';
}

export default function SiteFooter({ crossLink }: SiteFooterProps) {
  return (
    <footer className="text-center py-8 text-xs text-gray-400">
      © {new Date().getFullYear()} Rentora Houselink Uganda. All rights reserved.
      {crossLink === 'terms' && (
        <>
          {' '}&nbsp;·&nbsp;
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </>
      )}
      {crossLink === 'privacy' && (
        <>
          {' '}&nbsp;·&nbsp;
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </>
      )}
    </footer>
  );
}