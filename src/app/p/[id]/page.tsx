/**
 * Place this file at:
 *   src/app/p/[id]/page.tsx
 *
 * Requires the two companion client components:
 *   src/components/property-public/PropertyGallery.tsx
 *   src/components/property-public/StickyEnquireBar.tsx
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DM_Serif_Display, Plus_Jakarta_Sans } from 'next/font/google';
import {
  MapPin, Eye, MessageCircle, Car, Layers, DoorClosed,
  BadgeCheck, CalendarClock, Calendar, Wifi, Droplets,
  Zap, Shield, Wind, Tv, ParkingSquare, Dumbbell,
  Building2, TreePine, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

import { API_BASE, APP_URL, PLAY_STORE_URL } from '@/lib/constants';
import SiteFooter from '@/components/shared/site-footer';
import PropertyGallery from '@/components/property-public/PropertyGallery';
import StickyEnquireBar from '@/components/property-public/StickyEnquireBar';

// ── Fonts ─────────────────────────────────────────────────────────────────────
const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface District { id: string; name: string; }
interface Contact { name: string; phone: string; role: string; whatsapp?: string; }
interface PropertyImage { id: string; url: string; publicId: string; isPrimary: boolean; }

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  billingCycle?: string;
  numberOfRooms: number;
  totalRooms?: number | null;
  hotelCategory?: string | null;
  area: string;
  address?: string;
  status: string;
  furnishing?: string;
  securityDeposit?: number;
  availableFrom?: string;
  floor?: number;
  parkingAvailable: boolean;
  amenities: string[];
  viewCount: number;
  enquiryCount: number;
  isFeatured: boolean;
  featuredUntil?: string | null;
  contact: Contact;
  district: District;
  images: PropertyImage[];
  createdAt: string;
}

// ── Label maps ────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL_HOUSE: 'Residential House',
  APARTMENT:         'Apartment',
  AIRBNB:            'AirBnB',
  OFFICE_SPACE:      'Office Space',
  BUSINESS_SPACE:    'Business Space',
  HOSTEL:            'Hostel',
  HOTEL_LODGE:       'Hotel / Lodge',
};

const BILLING_LABELS: Record<string, string> = {
  DAILY:       'day',
  MONTHLY:     'month',
  QUARTERLY:   '3 months',
  FOUR_MONTHS: '4 months',
  BIANNUAL:    '6 months',
  ANNUAL:      'year',
};

const FURNISHING_LABELS: Record<string, string> = {
  FURNISHED:      'Furnished',
  SEMI_FURNISHED: 'Semi-Furnished',
  UNFURNISHED:    'Unfurnished',
};

const HOTEL_CATEGORY_LABELS: Record<string, string> = {
  ORDINARY: 'Ordinary',
  VIP:      'VIP',
  VVIP:     'VVIP',
};

// Amenity keyword → icon mapping
const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi:       Wifi,
  internet:   Wifi,
  water:      Droplets,
  electricity: Zap,
  power:      Zap,
  security:   Shield,
  'air conditioning': Wind,
  ac:         Wind,
  tv:         Tv,
  parking:    ParkingSquare,
  gym:        Dumbbell,
  garden:     TreePine,
};

function getAmenityIcon(amenity: string): React.ElementType {
  const key = amenity.toLowerCase();
  for (const [keyword, Icon] of Object.entries(AMENITY_ICONS)) {
    if (key.includes(keyword)) return Icon;
  }
  return BadgeCheck;
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function getProperty(id: string): Promise<Property | null> {
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return { title: 'Property Not Found — Rentora' };

  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0];
  return {
    title:       `${property.title} — Rentora`,
    description: property.description.slice(0, 160),
    openGraph: {
      title:       property.title,
      description: `UGX ${Number(property.price).toLocaleString()} · ${property.area}, ${property.district.name}`,
      images:      primaryImage ? [primaryImage.url] : [],
      type:        'website',
      url:         `${APP_URL}/p/${id}`,
    },
    twitter: {
      card:        'summary_large_image',
      title:       property.title,
      description: `UGX ${Number(property.price).toLocaleString()} · ${property.area}, ${property.district.name}`,
      images:      primaryImage ? [primaryImage.url] : [],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function PublicPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) notFound();

  const isAvailable       = property.status === 'AVAILABLE';
  const isHostel          = property.type === 'HOSTEL';
  const whatsappNumber    = property.contact.whatsapp ?? property.contact.phone;
  const whatsappFormatted = whatsappNumber.replace(/[\s\-\+]/g, '').replace(/^0/, '256');
  const billingLabel      = property.billingCycle ? (BILLING_LABELS[property.billingCycle] ?? 'month') : 'month';

  const shareText = encodeURIComponent(
    `${property.title} — UGX ${Number(property.price).toLocaleString()} / ${billingLabel}\n${property.area}, ${property.district.name}\n\nFound on Rentora: ${APP_URL}/p/${id}`,
  );

  const whatsappHref = `https://wa.me/${whatsappFormatted}?text=${shareText}`;
  const shareUrl     = `${APP_URL}/p/${id}`;

  return (
    <div className={`${dmSerif.variable} ${jakarta.variable} min-h-screen bg-[#fafaf8]`}
      style={{ fontFamily: 'var(--font-body), sans-serif' }}>

      {/* ── Minimal Header ── */}
      <header className="sticky top-0 z-40 bg-[#fafaf8]/90 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span
              className="text-xl font-bold tracking-tight text-[#111]"
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              Rentora
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#111] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Browse listings</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 sm:pb-12">

        {/* ── Gallery ── */}
        <section className="pt-6 pb-2">
          <PropertyGallery
            images={property.images}
            title={property.title}
            isAvailable={isAvailable}
            isFeatured={property.isFeatured}
          />
        </section>

        {/* ── Two-column body ── */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* ── LEFT: Main content ── */}
          <div className="space-y-8 min-w-0">

            {/* Title block */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] px-3 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100">
                  {TYPE_LABELS[property.type] ?? property.type}
                </span>
                {property.hotelCategory && (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] px-3 py-1 bg-purple-50 text-purple-600 rounded-full border border-purple-100">
                    {HOTEL_CATEGORY_LABELS[property.hotelCategory] ?? property.hotelCategory}
                  </span>
                )}
                {!isAvailable && (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] px-3 py-1 bg-stone-100 text-stone-500 rounded-full border border-stone-200">
                    Rented Out
                  </span>
                )}
              </div>

              <h1
                className="text-3xl sm:text-4xl text-[#111] leading-tight mb-3"
                style={{ fontFamily: 'var(--font-display), serif' }}
              >
                {property.title}
              </h1>

              <p className="flex items-center gap-1.5 text-stone-500 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                {property.area}, {property.district.name}
                {property.address && (
                  <span className="text-stone-400"> — {property.address}</span>
                )}
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 text-sm text-stone-400 py-4 border-y border-stone-100">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {property.viewCount.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                {property.enquiryCount.toLocaleString()} enquiries
              </span>
            </div>

            {/* Description */}
            <div>
              <h2
                className="text-xl text-[#111] mb-3"
                style={{ fontFamily: 'var(--font-display), serif' }}
              >
                About this property
              </h2>
              <p className="text-[15px] text-stone-600 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div>
                <h2
                  className="text-xl text-[#111] mb-4"
                  style={{ fontFamily: 'var(--font-display), serif' }}
                >
                  What&apos;s included
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-stone-100 shadow-sm text-sm text-stone-700 font-medium"
                      >
                        <Icon className="h-4 w-4 text-orange-500 shrink-0" />
                        {amenity}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details grid — mobile only (desktop shows in sidebar) */}
            <div className="lg:hidden">
              <h2
                className="text-xl text-[#111] mb-4"
                style={{ fontFamily: 'var(--font-display), serif' }}
              >
                Property details
              </h2>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3.5">
                {!isHostel && (
                  <DetailRow icon={DoorClosed} label="Rooms" value={`${property.numberOfRooms} Room${property.numberOfRooms !== 1 ? 's' : ''}`} />
                )}
                {property.floor !== undefined && property.floor !== null && (
                  <DetailRow icon={Layers} label="Floor" value={property.floor === 0 ? 'Ground Floor' : `Floor ${property.floor}`} />
                )}
                <DetailRow icon={Car} label="Parking" value={property.parkingAvailable ? 'Available' : 'Not available'} />
                {property.furnishing && (
                  <DetailRow icon={BadgeCheck} label="Furnishing" value={FURNISHING_LABELS[property.furnishing] ?? property.furnishing} />
                )}
                {property.billingCycle && (
                  <DetailRow icon={CalendarClock} label="Billing" value={`Per ${BILLING_LABELS[property.billingCycle] ?? property.billingCycle}`} />
                )}
                {property.availableFrom && (
                  <DetailRow
                    icon={Calendar}
                    label="Available From"
                    value={new Date(property.availableFrom).toLocaleDateString('en-UG', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  />
                )}
              </div>
            </div>

          </div>

          {/* ── RIGHT: Sticky sidebar ── */}
          <aside className="hidden lg:block lg:sticky lg:top-[72px] space-y-4">

            {/* Price card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <p className="text-[11px] uppercase tracking-[0.1em] text-stone-400 font-semibold mb-2">
                {isHostel ? 'Starting price' : 'Listed price'}
              </p>
              <p
                className="text-4xl text-[#111] leading-none"
                style={{ fontFamily: 'var(--font-display), serif' }}
              >
                UGX {Number(property.price).toLocaleString()}
              </p>
              {property.billingCycle && (
                <p className="text-sm text-stone-400 mt-1.5">per {billingLabel}</p>
              )}
              {isHostel && (
                <p className="text-xs text-stone-400 mt-1">Individual rooms may vary</p>
              )}
              {property.securityDeposit != null && property.securityDeposit > 0 && (
                <p className="text-sm text-stone-500 mt-4 pt-4 border-t border-stone-100">
                  Security deposit: UGX {Number(property.securityDeposit).toLocaleString()}
                </p>
              )}
            </div>

            {/* Details card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3.5">
              <h3 className="text-sm font-semibold text-[#111]">Property details</h3>
              {!isHostel && (
                <DetailRow icon={DoorClosed} label="Rooms" value={`${property.numberOfRooms} Room${property.numberOfRooms !== 1 ? 's' : ''}`} />
              )}
              {property.floor !== undefined && property.floor !== null && (
                <DetailRow icon={Layers} label="Floor" value={property.floor === 0 ? 'Ground Floor' : `Floor ${property.floor}`} />
              )}
              <DetailRow icon={Car} label="Parking" value={property.parkingAvailable ? 'Available' : 'Not available'} />
              {property.furnishing && (
                <DetailRow icon={BadgeCheck} label="Furnishing" value={FURNISHING_LABELS[property.furnishing] ?? property.furnishing} />
              )}
              {property.billingCycle && (
                <DetailRow icon={CalendarClock} label="Billing" value={`Per ${BILLING_LABELS[property.billingCycle] ?? property.billingCycle}`} />
              )}
              {property.availableFrom && (
                <DetailRow
                  icon={Calendar}
                  label="Available From"
                  value={new Date(property.availableFrom).toLocaleDateString('en-UG', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                />
              )}
            </div>

            {/* Contact + WhatsApp CTA card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <p className="text-[11px] uppercase tracking-[0.1em] text-stone-400 font-semibold mb-3">
                {property.contact.role === 'OWNER' ? 'Property owner' : 'Agent / Broker'}
              </p>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-orange-500">
                    {property.contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111]">{property.contact.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{property.contact.phone}</p>
                </div>
              </div>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] active:scale-[0.98] text-white text-sm font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20"
              >
                <WhatsAppIcon />
                Enquire on WhatsApp
              </a>
            </div>

          </aside>
        </div>

        {/* ── App download banner ── */}
        <section className="mt-12 rounded-2xl overflow-hidden relative bg-[#111]">
          {/* Decorative orange glow */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative px-6 py-8 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 bg-orange-500/10 rounded-full">
                <Building2 className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs font-semibold text-orange-400 tracking-wide">Rentora for Android</span>
              </div>
              <p
                className="text-2xl sm:text-3xl text-white leading-snug"
                style={{ fontFamily: 'var(--font-display), serif' }}
              >
                Find your perfect home<br />across Uganda
              </p>
              <p className="text-sm text-stone-400 mt-2 max-w-sm">
                Hundreds of verified rentals — houses, apartments, hostels, hotels and more. All in one place.
              </p>
            </div>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-orange-500/25"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76a2.5 2.5 0 001.27-.36l10.27-5.87-2.88-2.88-8.66 9.11zM.11 1.06A2.5 2.5 0 000 1.87v20.26a2.5 2.5 0 00.11.81l.06.06 11.35-11.35v-.27L.17 1z"/>
                <path d="M15.62 15.64l-3.1-3.1V12l3.1-3.1.07.04 3.67 2.09c1.05.6 1.05 1.57 0 2.17l-3.67 2.09-.07.04z"/>
                <path d="M15.69 15.6L12.52 12.5 3.18.24A2.75 2.75 0 014.45.6l11.24 15z"/>
              </svg>
              Get on Google Play
            </a>
          </div>
        </section>

      </main>

      <SiteFooter />

      {/* ── Sticky mobile CTA ── */}
      <StickyEnquireBar
        price={property.price}
        billingLabel={billingLabel}
        whatsappHref={whatsappHref}
        shareUrl={shareUrl}
        shareTitle={property.title}
      />
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-sm text-stone-400 shrink-0">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="text-sm font-semibold text-[#111] text-right">{value}</span>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}