'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Building2, CheckCircle, XCircle, ContactRound,
  Percent, Eye, MessageCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { propertiesApi } from '@/lib/api/properties.api';
import { contactsApi } from '@/lib/api/contacts.api';

const TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL_HOUSE: 'Residential House',
  APARTMENT:         'Apartment',
  AIRBNB:            'AirBnB',
  OFFICE_SPACE:      'Office Space',
  BUSINESS_SPACE:    'Business Space',
  HOSTEL:            'Hostel',
  HOTEL_LODGE:       'Hotel / Lodge',
};

const TYPE_COLORS: Record<string, string> = {
  RESIDENTIAL_HOUSE: 'bg-blue-500',
  APARTMENT:         'bg-violet-500',
  AIRBNB:            'bg-pink-500',
  OFFICE_SPACE:      'bg-amber-500',
  BUSINESS_SPACE:    'bg-orange-500',
  HOSTEL:            'bg-teal-500',
  HOTEL_LODGE:       'bg-cyan-500',
};

export default function StatsCards() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['properties', 'stats'],
    queryFn: propertiesApi.getStats,
  });

  const { data: contactsResponse, isLoading: loadingContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactsApi.getAll(),
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
      title: 'Contacts',
      value: contactsResponse?.meta?.total ?? 0,
      icon: ContactRound,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      loading: loadingContacts,
      badge: null,
    },
  ];

  const byType = stats?.byType ?? {};
  const total = stats?.total ?? 0;

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

      {/* Listings by property type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Listings by Property Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : total === 0 ? (
            <p className="text-sm text-gray-400">No listings yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(TYPE_LABELS).map(([key, label]) => {
                const count = byType[key] ?? 0;
                if (count === 0) return null;
                const pct = Math.round((count / total) * 100);
                const barColor = TYPE_COLORS[key] ?? 'bg-gray-400';
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{label}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {count}
                        <span className="text-xs font-normal text-gray-400 ml-1">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${barColor} h-2 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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