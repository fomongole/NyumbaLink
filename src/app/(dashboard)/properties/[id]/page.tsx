'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  ChevronRight, Pencil, Trash2, ToggleLeft, ToggleRight,
  Images, Eye, MessageCircle, MapPin, Building2, User,
  Calendar, Car, Layers, BadgeCheck, DoorClosed,
  DollarSign, Star, Navigation, Hotel, CalendarClock,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import PropertyFormSheet from '@/components/properties/PropertyFormSheet';
import ImageUploadManager from '@/components/properties/ImageUploadManager';
import HostelRoomsPanel from '@/components/hostel-rooms/HostelRoomsPanel';
import DeleteDialog from '@/components/shared/DeleteDialog';

import { propertiesApi } from '@/lib/api/properties.api';
import Header from '@/components/layout/Header';
import { BillingCycle, HotelCategory } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL_HOUSE: 'Residential House',
  APARTMENT:         'Apartment',
  AIRBNB:            'AirBnB',
  OFFICE_SPACE:      'Office Space',
  BUSINESS_SPACE:    'Business Space',
  HOSTEL:            'Hostel',
  HOTEL_LODGE:       'Hotel / Lodge',
};

const FURNISHING_LABELS: Record<string, string> = {
  FURNISHED:      'Furnished',
  SEMI_FURNISHED: 'Semi-Furnished',
  UNFURNISHED:    'Unfurnished',
};

const BILLING_LABELS: Record<BillingCycle, string> = {
  DAILY:       'Daily',
  MONTHLY:     'Monthly',
  QUARTERLY:   'Quarterly (3 months)',
  FOUR_MONTHS: '4 Months',
  BIANNUAL:    'Biannual (6 months)',
  ANNUAL:      'Annual (1 year)',
};

const HOTEL_CATEGORY_LABELS: Record<HotelCategory, string> = {
  ORDINARY: 'Ordinary',
  VIP:      'VIP',
  VVIP:     'VVIP',
};

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { data: property, isLoading } = useQuery({
    queryKey: ['properties', id],
    queryFn: () => propertiesApi.getOne(id),
  });

  const toggleMutation = useMutation({
    mutationFn: () => propertiesApi.toggleStatus(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['properties', id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(
        `Marked as ${updated.status === 'AVAILABLE' ? 'Available' : 'Rented Out'}`,
      );
    },
    onError: () => toast.error('Failed to update status.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => propertiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property deleted');
      router.push('/properties');
    },
    onError: () => toast.error('Failed to delete property.'),
  });

  if (isLoading) {
    return (
      <>
        <Header title="Property Details" />
        <main className="flex-1 p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </main>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Header title="Property Not Found" />
        <main className="flex-1 p-6">
          <p className="text-gray-500">This property does not exist or has been deleted.</p>
          <Link href="/properties">
            <Button className="mt-4">Back to Properties</Button>
          </Link>
        </main>
      </>
    );
  }

  const isHostel = property.type === 'HOSTEL';
  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0];
  const displayImage = activeImage ?? primaryImage?.url;

  const lat = property.latitude != null ? Number(property.latitude) : null;
  const lng = property.longitude != null ? Number(property.longitude) : null;
  const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  return (
    <>
      <Header
        title={property.title}
        description={`${property.district.name} · ${property.area}`}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Top Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap">
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
            <Link href="/properties" className="text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap">
              Properties
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
            <span className="text-gray-700 font-medium truncate">{property.title}</span>
          </nav>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setImagesOpen(true)}>
              <Images className="h-4 w-4 mr-1.5" />
              Images ({property.images.length}/4)
            </Button>
            {!isHostel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
              >
                {property.status === 'AVAILABLE' ? (
                  <><ToggleRight className="h-4 w-4 mr-1.5 text-green-600" />Mark Rented</>
                ) : (
                  <><ToggleLeft className="h-4 w-4 mr-1.5" />Mark Available</>
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          {isHostel && (
            <TabsList className="mb-4 bg-gray-100 p-1">
              <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-white">
                <Building2 className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="rooms" className="gap-1.5 data-[state=active]:bg-white">
                <Hotel className="h-3.5 w-3.5" />
                Rooms
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Images + Description */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Building2 className="h-12 w-12 mb-2" />
                        <p className="text-sm">No images uploaded</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge
                        variant={property.status === 'AVAILABLE' ? 'default' : 'secondary'}
                        className="text-sm px-3 py-1 shadow-md"
                      >
                        {property.status === 'AVAILABLE' ? 'Available' : 'Rented Out'}
                      </Badge>
                    </div>
                  </div>
                  {property.images.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
                      {property.images.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => setActiveImage(img.url)}
                          className={`relative h-16 w-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                            (activeImage ?? primaryImage?.url) === img.url
                              ? 'border-primary'
                              : 'border-transparent'
                          }`}
                        >
                          <Image src={img.url} alt="" fill className="object-cover" />
                          {img.isPrimary && (
                            <div className="absolute top-0.5 right-0.5">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {property.description}
                    </p>
                  </CardContent>
                </Card>

                {property.amenities?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Amenities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-sm">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right: Details */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {isHostel ? 'Starting Price' : 'Listed Price'}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        UGX {Number(property.price).toLocaleString()}
                      </p>
                      {property.billingCycle && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          per {BILLING_LABELS[property.billingCycle].toLowerCase()}
                        </p>
                      )}
                      {isHostel && (
                        <p className="text-xs text-gray-400 mt-1">Individual rooms may vary</p>
                      )}
                    </div>

                    {property.securityDeposit && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        Security deposit: UGX {Number(property.securityDeposit).toLocaleString()}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                      {!isHostel && (
                        <div className="flex items-center gap-2 col-span-2">
                           <DoorClosed className="h-4 w-4 text-gray-400" />
                           <span className="text-sm">{property.numberOfRooms} Room{property.numberOfRooms !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{property.viewCount} Views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{property.enquiryCount} Enquiries</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Property Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <DetailRow icon={Building2} label="Type" value={TYPE_LABELS[property.type] ?? property.type} />
                    
                    {property.hotelCategory && (
                       <DetailRow
                         icon={Star}
                         label="Category"
                         value={HOTEL_CATEGORY_LABELS[property.hotelCategory] ?? property.hotelCategory}
                       />
                    )}
                    
                    <DetailRow icon={MapPin} label="District" value={property.district.name} />
                    <DetailRow icon={MapPin} label="Area" value={property.area} />
                    
                    {property.address && (
                      <DetailRow icon={MapPin} label="Address" value={property.address} />
                    )}

                    {hasCoords && (
                      <div className="flex items-start gap-2.5">
                        <Navigation className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 flex justify-between gap-2">
                          <span className="text-sm text-gray-500">GPS</span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-primary hover:underline text-right"
                          >
                            {lat!.toFixed(4)}, {lng!.toFixed(4)}
                          </a>
                        </div>
                      </div>
                    )}

                    {property.furnishing && (
                      <DetailRow icon={BadgeCheck} label="Furnishing" value={FURNISHING_LABELS[property.furnishing]} />
                    )}

                    {property.billingCycle && (
                      <DetailRow
                        icon={CalendarClock}
                        label="Billing Period"
                        value={BILLING_LABELS[property.billingCycle]}
                      />
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

                    {property.floor !== null && property.floor !== undefined && (
                      <DetailRow
                        icon={Layers}
                        label="Floor"
                        value={property.floor === 0 ? 'Ground Floor' : `Floor ${property.floor}`}
                      />
                    )}

                    <DetailRow
                      icon={Car}
                      label="Parking"
                      value={property.parkingAvailable ? 'Available' : 'Not available'}
                    />
                  </CardContent>
                </Card>

                {/* Contact card (replaces Landlord) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {property.contact.role === 'OWNER' ? 'Property Owner' : 'Agent / Broker'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{property.contact.name}</p>
                        <p className="text-xs text-gray-500">{property.contact.phone}</p>
                      </div>
                    </div>
                    {property.contact.email && (
                      <p className="text-sm text-gray-600">{property.contact.email}</p>
                    )}
                    {property.contact.whatsapp && (
                      <p className="text-sm text-gray-600">WhatsApp: {property.contact.whatsapp}</p>
                    )}
                    <Link href={`/contacts/${property.contact.id}`}>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        View Contact Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {isHostel && (
            <TabsContent value="rooms">
              <HostelRoomsPanel propertyId={id} />
            </TabsContent>
          )}
        </Tabs>
      </main>

      <PropertyFormSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        property={property}
      />

      <ImageUploadManager
        open={imagesOpen}
        onClose={() => setImagesOpen(false)}
        property={property}
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        title="Delete Property"
        description={`Are you sure you want to delete "${property.title}"? This is reversible.`}
      />
    </>
  );
}

function DetailRow({
  icon: Icon, label, value,
}: {
  icon: React.ElementType; label: string; value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 flex justify-between gap-2">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
      </div>
    </div>
  );
}