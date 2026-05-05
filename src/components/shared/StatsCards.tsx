'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, CheckCircle, XCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { propertiesApi } from '@/lib/api/properties.api';
import { landlordsApi } from '@/lib/api/landlords.api';

export default function StatsCards() {
  const { data: propertiesData, isLoading: loadingProperties } = useQuery({
    queryKey: ['properties', 'all'],
    queryFn: () => propertiesApi.getAll({ limit: 1000 }),
  });

  const { data: landlords, isLoading: loadingLandlords } = useQuery({
    queryKey: ['landlords'],
    queryFn: landlordsApi.getAll,
  });

  const total = propertiesData?.meta.total ?? 0;
  const available = propertiesData?.data.filter((p) => p.status === 'AVAILABLE').length ?? 0;
  const rented = propertiesData?.data.filter((p) => p.status === 'RENTED').length ?? 0;
  const totalLandlords = landlords?.length ?? 0;

  const stats = [
    {
      title: 'Total Listings',
      value: total,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      loading: loadingProperties,
    },
    {
      title: 'Available',
      value: available,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      loading: loadingProperties,
    },
    {
      title: 'Rented Out',
      value: rented,
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      loading: loadingProperties,
    },
    {
      title: 'Total Landlords',
      value: totalLandlords,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      loading: loadingLandlords,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}