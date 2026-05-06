'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { propertiesApi } from '@/lib/api/properties.api';

const TYPE_LABELS: Record<string, string> = {
  SINGLE_ROOM: 'Single Room',
  DOUBLE_ROOM: 'Double Room',
  APARTMENT: 'Apartment',
  HOUSE: 'House',
  STUDIO: 'Studio',
  HOSTEL: 'Hostel',
};

export default function RecentProperties() {
  const { data, isLoading } = useQuery({
    queryKey: ['properties', 'recent'],
    queryFn: () => propertiesApi.getAll({ limit: 10, page: 1 }),
  });

  const properties = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Recently Added</CardTitle>
          <CardDescription>Last 10 property listings</CardDescription>
        </div>
        <Link
          href="/properties"
          className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Building2 className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No properties yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {properties.map((property) => {
              const primary =
                property.images.find((i) => i.isPrimary) ?? property.images[0];
              return (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="h-10 w-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                      {property.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {property.district.name} · UGX {Number(property.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs hidden sm:flex">
                      {TYPE_LABELS[property.type]}
                    </Badge>
                    <Badge
                      variant={property.status === 'AVAILABLE' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {property.status === 'AVAILABLE' ? 'Available' : 'Rented'}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}