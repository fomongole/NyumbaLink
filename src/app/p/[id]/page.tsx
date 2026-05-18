import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  MapPin, Eye, MessageCircle, Car, Layers, DoorClosed, BadgeCheck,
  CalendarClock, Calendar, Star, Wifi, Building2,
} from 'lucide-react';
import { API_BASE, APP_URL, PLAY_STORE_URL } from '@/lib/constants';
import SiteFooter from '@/components/shared/site-footer';
import SiteHeader from '@/components/shared/site-hearer';

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

  const primaryImage       = property.images.find((i) => i.isPrimary) ?? property.images[0];
  const otherImages        = property.images.filter((i) => i.id !== primaryImage?.id).slice(0, 3);
  const isAvailable        = property.status === 'AVAILABLE';
  const isHostel           = property.type === 'HOSTEL';
  const whatsappNumber     = property.contact.whatsapp ?? property.contact.phone;
  const whatsappFormatted  = whatsappNumber.replace(/[\s\-\+]/g, '').replace(/^0/, '256');
  const billingLabel       = property.billingCycle ? (BILLING_LABELS[property.billingCycle] ?? 'month') : 'month';

  const shareText = encodeURIComponent(
    `${property.title} — UGX ${Number(property.price).toLocaleString()} / ${billingLabel}\n${property.area}, ${property.district.name}\n\nFound on Rentora: ${APP_URL}/p/${id}`,
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Images ── */}
        <section className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden bg-gray-200 aspect-video">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={property.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 900px"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                <Building2 className="h-16 w-16 mb-2" />
                <p className="text-sm">No images available</p>
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full shadow ${isAvailable ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'}`}>
                {isAvailable ? 'Available' : 'Rented Out'}
              </span>
              {property.isFeatured && (
                <span className="text-sm font-semibold px-3 py-1 rounded-full shadow bg-yellow-400 text-yellow-900 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-700 text-yellow-700" />
                  Featured
                </span>
              )}
            </div>
          </div>

          {otherImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {otherImages.map((img) => (
                <div key={img.id} className="relative rounded-xl overflow-hidden bg-gray-200 aspect-video">
                  <Image
                    src={img.url}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 280px"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Two-column layout ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Title, description, amenities */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {TYPE_LABELS[property.type] ?? property.type}
                </span>
                {property.hotelCategory && (
                  <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                    {HOTEL_CATEGORY_LABELS[property.hotelCategory] ?? property.hotelCategory}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {property.title}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-gray-500 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                {property.area}, {property.district.name}
                {property.address && ` — ${property.address}`}
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">About this property</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {property.amenities?.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-700 shadow-sm">
                      <Wifi className="h-3.5 w-3.5 text-gray-400" />
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-5 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {property.viewCount.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                {property.enquiryCount.toLocaleString()} enquiries
              </span>
            </div>
          </div>

          {/* Right: Price card, details, contact */}
          <div className="space-y-4">

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                {isHostel ? 'Starting price' : 'Listed price'}
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                UGX {Number(property.price).toLocaleString()}
              </p>
              {property.billingCycle && (
                <p className="text-sm text-gray-400 mt-0.5">per {billingLabel}</p>
              )}
              {isHostel && (
                <p className="text-xs text-gray-400 mt-1">Individual rooms may vary</p>
              )}
              {property.securityDeposit && (
                <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
                  Security deposit: UGX {Number(property.securityDeposit).toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Property Details</h3>
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
                <DetailRow icon={CalendarClock} label="Billing" value={BILLING_LABELS[property.billingCycle] ? `Per ${BILLING_LABELS[property.billingCycle]}` : property.billingCycle} />
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

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {property.contact.role === 'OWNER' ? 'Property Owner' : 'Agent / Broker'}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gray-500">
                    {property.contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{property.contact.name}</p>
                  <p className="text-xs text-gray-500">{property.contact.phone}</p>
                </div>
              </div>
              <a
                href={`https://wa.me/${whatsappFormatted}?text=${shareText}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enquire on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── App download banner ── */}
        <section className="rounded-2xl bg-gray-900 text-white px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold">Discover more properties on Rentora</p>
            <p className="text-sm text-gray-400 mt-1">
              Browse hundreds of verified rentals across Uganda — houses, apartments, hostels and more.
            </p>
          </div>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            Download the App
          </a>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

// ── Helper component ──────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-sm text-gray-400 shrink-0">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="text-sm font-medium text-gray-800 text-right">{value}</span>
    </div>
  );
}