'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Phone, MessageCircle, Mail,
  MapPin, CreditCard, Building2, Pencil,
  Trash2, Eye,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import Header from '@/components/layout/Header';
import ContactFormSheet from '@/components/contacts/ContactFormSheet';
import DeleteDialog from '@/components/shared/DeleteDialog';
import { contactsApi } from '@/lib/api/contacts.api';
import { propertiesApi } from '@/lib/api/properties.api';
import { ContactRole } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL_HOUSE: 'Residential House',
  APARTMENT:         'Apartment',
  AIRBNB:            'AirBnB',
  OFFICE_SPACE:      'Office Space',
  BUSINESS_SPACE:    'Business Space',
  HOSTEL:            'Hostel',
  HOTEL_LODGE:       'Hotel / Lodge',
};

const ROLE_BADGE_CLASS: Record<ContactRole, string> = {
  OWNER: 'bg-blue-50 text-blue-700 border-blue-200',
  AGENT: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsApi.getOne(id),
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['properties', { limit: 200 }],
    queryFn: () => propertiesApi.getAll({ limit: 200 }),
  });

  // Filter properties managed by this contact
  const contactProperties =
    propertiesData?.data.filter((p) => p.contact.id === id) ?? [];

  const deleteMutation = useMutation({
    mutationFn: () => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deactivated');
      router.push('/contacts');
    },
    onError: () => toast.error('Failed to deactivate contact.'),
  });

  if (isLoading) {
    return (
      <>
        <Header title="Contact Profile" />
        <main className="flex-1 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
        </main>
      </>
    );
  }

  if (!contact) {
    return (
      <>
        <Header title="Contact Not Found" />
        <main className="flex-1 p-6">
          <p className="text-gray-500">This contact does not exist.</p>
          <Link href="/contacts">
            <Button className="mt-4">Back to Contacts</Button>
          </Link>
        </main>
      </>
    );
  }

  const available = contactProperties.filter((p) => p.status === 'AVAILABLE').length;
  const rented = contactProperties.filter((p) => p.status === 'RENTED').length;

  return (
    <>
      <Header
        title={contact.name}
        description={`${contact.role === 'OWNER' ? 'Property Owner' : 'Agent / Broker'} · ${contactProperties.length} propert${contactProperties.length !== 1 ? 'ies' : 'y'}`}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/contacts"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Deactivate
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Profile card */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Avatar + name */}
                <div className="flex flex-col items-center gap-3 pb-4 border-b">
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-400">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center space-y-1.5">
                    <p className="font-semibold text-lg">{contact.name}</p>
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${ROLE_BADGE_CLASS[contact.role]}`}
                    >
                      {contact.role === 'OWNER' ? 'Property Owner' : 'Agent / Broker'}
                    </span>
                    <div className="pt-1">
                      <Badge variant={contact.isActive ? 'default' : 'secondary'}>
                        {contact.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 pb-4 border-b">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{contactProperties.length}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{available}</p>
                    <p className="text-xs text-gray-500">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-400">{rented}</p>
                    <p className="text-xs text-gray-500">Rented</p>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-3">
                  <ContactRow icon={Phone} value={contact.phone} />
                  {contact.whatsapp && (
                    <ContactRow
                      icon={MessageCircle}
                      value={contact.whatsapp}
                      iconClass="text-green-600"
                    />
                  )}
                  {contact.email && (
                    <ContactRow icon={Mail} value={contact.email} />
                  )}
                  {contact.physicalAddress && (
                    <ContactRow icon={MapPin} value={contact.physicalAddress} />
                  )}
                  {contact.nationalId && (
                    <ContactRow
                      icon={CreditCard}
                      value={contact.nationalId}
                      label="NIN"
                    />
                  )}
                </div>

                {contact.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{contact.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right — Properties list */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  Properties ({contactProperties.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contactProperties.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Building2 className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No properties for this contact yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactProperties.map((property) => {
                        const primary =
                          property.images.find((i) => i.isPrimary) ?? property.images[0];
                        return (
                          <TableRow key={property.id}>
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <div className="h-10 w-14 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                  {primary ? (
                                    <Image
                                      src={primary.url}
                                      alt={property.title}
                                      width={56}
                                      height={40}
                                      className="object-cover w-full h-full"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Building2 className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium leading-tight">{property.title}</p>
                                  <p className="text-xs text-gray-500">{property.area}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {TYPE_LABELS[property.type] ?? property.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              UGX {Number(property.price).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={property.status === 'AVAILABLE' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {property.status === 'AVAILABLE' ? 'Available' : 'Rented'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Link href={`/properties/${property.id}`}>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ContactFormSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        contact={contact}
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        title="Deactivate Contact"
        description={`Are you sure you want to deactivate ${contact.name}?`}
      />
    </>
  );
}

function ContactRow({
  icon: Icon,
  value,
  label,
  iconClass,
}: {
  icon: React.ElementType;
  value: string;
  label?: string;
  iconClass?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${iconClass ?? 'text-gray-400'}`} />
      <div>
        {label && <p className="text-xs text-gray-400">{label}</p>}
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
}