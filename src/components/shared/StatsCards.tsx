'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Eye,
  MessageCircle,
  Percent,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { propertiesApi } from '@/lib/api/properties.api';
import { landlordsApi } from '@/lib/api/landlords.api';

export default function StatsCards() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['properties', 'stats'],
    queryFn: propertiesApi.getStats,
  });

  // ── Wrap in arrow function so React Query's context object is not passed
  //    as the params argument. Extract .data.length for the count.
  const { data: landlordsResponse, isLoading: loadingLandlords } = useQuery({
    queryKey: ['landlords'],
    queryFn: () => landlordsApi.getAll(),
  });

  const primaryStats = [
    {
      title: 'Total Listings',
      value: stats?.total ?? 0,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      loading: loadingStats,
      badge: stats?.addedThisWeek
        ? { label: `+${stats.addedThisWeek} this week`, variant: 'default' as const }
        : null,
    },
    {
      title: 'Available',
      value: stats?.available ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      loading: loadingStats,
      badge: null,
    },
    {
      title: 'Rented Out',
      value: stats?.rented ?? 0,
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      loading: loadingStats,
      badge: null,
    },
    {
      title: 'Landlords',
      value: landlordsResponse?.data?.length ?? 0,  // ← .data.length, not .length
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      loading: loadingLandlords,
      badge: null,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Primary stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryStats.map((stat) => {
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
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    {stat.badge && (
                      <Badge variant={stat.badge.variant} className="mb-1 text-xs">
                        {stat.badge.label}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Occupancy Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Occupancy Rate</CardTitle>
            <div className="bg-orange-50 p-2 rounded-lg">
              <Percent className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900">{stats?.occupancyRate ?? 0}%</p>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${stats?.occupancyRate ?? 0}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Viewed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Viewed Property</CardTitle>
            <div className="bg-cyan-50 p-2 rounded-lg">
              <Eye className="h-4 w-4 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-full" />
            ) : stats?.topViewed?.[0] ? (
              <div>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {stats.topViewed[0].title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.topViewed[0].viewCount}
                  <span className="text-sm font-normal text-gray-500 ml-1">views</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Most Enquired */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Most Enquired</CardTitle>
            <div className="bg-teal-50 p-2 rounded-lg">
              <MessageCircle className="h-4 w-4 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-full" />
            ) : stats?.topEnquired?.[0] ? (
              <div>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {stats.topEnquired[0].title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.topEnquired[0].enquiryCount}
                  <span className="text-sm font-normal text-gray-500 ml-1">enquiries</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}