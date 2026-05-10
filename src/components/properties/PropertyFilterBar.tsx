'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { districtsApi } from '@/lib/api/districts.api';
import { PropertyFilters, PropertyType, PropertyStatus, BillingCycle } from '@/types';

interface Props {
  filters: PropertyFilters & { search?: string };
  onChange: (filters: PropertyFilters & { search?: string }) => void;
  onReset: () => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'RESIDENTIAL_HOUSE', label: 'Residential House' },
  { value: 'APARTMENT',         label: 'Apartment' },
  { value: 'AIRBNB',            label: 'AirBnB' },
  { value: 'OFFICE_SPACE',      label: 'Office Space' },
  { value: 'BUSINESS_SPACE',    label: 'Business Space' },
  { value: 'HOSTEL',            label: 'Hostel' },
  { value: 'HOTEL_LODGE',       label: 'Hotel / Lodge' },
];

const STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RENTED',    label: 'Rented Out' },
];

const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'DAILY',       label: 'Daily' },
  { value: 'MONTHLY',     label: 'Monthly' },
  { value: 'QUARTERLY',   label: 'Quarterly' },
  { value: 'FOUR_MONTHS', label: '4 Months' },
  { value: 'BIANNUAL',    label: 'Biannual' },
  { value: 'ANNUAL',      label: 'Annual' },
];

const ROOM_COUNTS = [1, 2, 3, 4, 5];
const UNSET = '__ALL__';

export default function PropertyFilterBar({ filters, onChange, onReset }: Props) {
  const { data: districts = [] } = useQuery({
    queryKey: ['districts'],
    queryFn: districtsApi.getAll,
  });

  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ ...filters, search: searchInput || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const [advancedOpen, setAdvancedOpen] = useState(
    !!(filters.billingCycle || filters.minPrice || filters.maxPrice || filters.numberOfRooms),
  );

  const advancedCount = [
    filters.billingCycle, filters.minPrice, filters.maxPrice, filters.numberOfRooms,
  ].filter(Boolean).length;

  const hasAnyActiveFilter =
    filters.search || filters.districtId || filters.type || filters.status ||
    filters.billingCycle || filters.minPrice || filters.maxPrice || filters.numberOfRooms;

  return (
    <div className="space-y-2">
      {/* ── Row 1: Primary filters ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            placeholder="Search title or area..."
            className="pl-8 h-9 text-sm w-full rounded-md border border-input bg-background px-3 py-1 shadow-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          value={filters.districtId ?? UNSET}
          onValueChange={(v) => onChange({ ...filters, districtId: v === UNSET ? undefined : v })}
        >
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>All Districts</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type ?? UNSET}
          onValueChange={(v) =>
            onChange({ ...filters, type: v === UNSET ? undefined : (v as PropertyType) })
          }
        >
          <SelectTrigger className="h-9 w-44 text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>All Types</SelectItem>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status ?? UNSET}
          onValueChange={(v) =>
            onChange({ ...filters, status: v === UNSET ? undefined : (v as PropertyStatus) })
          }
        >
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="h-9 gap-1.5 text-sm"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          More filters
          {advancedCount > 0 && (
            <Badge className="h-4 min-w-[16px] px-1 text-[10px] rounded-full leading-none">
              {advancedCount}
            </Badge>
          )}
          <ChevronDown
            className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${
              advancedOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>

        {hasAnyActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput('');
              onReset();
            }}
            className="h-9 gap-1.5 text-sm text-gray-500"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </Button>
        )}
      </div>

      {/* ── Row 2: Advanced filters (collapsible) ── */}
      {advancedOpen && (
        <div className="flex flex-wrap gap-2 items-center pt-2.5 border-t border-gray-100">
          <Select
            value={filters.billingCycle ?? UNSET}
            onValueChange={(v) =>
              onChange({ ...filters, billingCycle: v === UNSET ? undefined : (v as BillingCycle) })
            }
          >
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue placeholder="Any Billing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>Any Billing</SelectItem>
              {BILLING_CYCLES.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.numberOfRooms?.toString() ?? UNSET}
            onValueChange={(v) =>
              onChange({ ...filters, numberOfRooms: v === UNSET ? undefined : Number(v) })
            }
          >
            <SelectTrigger className="h-9 w-32 text-sm">
              <SelectValue placeholder="Any Rooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>Any Rooms</SelectItem>
              {ROOM_COUNTS.map((b) => (
                <SelectItem key={b} value={b.toString()}>
                  {b} {b === 1 ? 'Room' : 'Rooms'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Min Price */}
          <div className="flex items-center h-9 rounded-md border border-input bg-background text-sm focus-within:ring-1 focus-within:ring-ring overflow-hidden">
            <span className="px-2.5 text-xs font-semibold text-gray-400 bg-gray-50 border-r border-input h-full flex items-center select-none shrink-0">
              UGX
            </span>
            <input
              type="number"
              placeholder="Min price"
              className="w-28 px-2.5 bg-transparent outline-none placeholder:text-gray-400 h-full text-sm"
              value={filters.minPrice ?? ''}
              onChange={(e) =>
                onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>

          {/* Max Price */}
          <div className="flex items-center h-9 rounded-md border border-input bg-background text-sm focus-within:ring-1 focus-within:ring-ring overflow-hidden">
            <span className="px-2.5 text-xs font-semibold text-gray-400 bg-gray-50 border-r border-input h-full flex items-center select-none shrink-0">
              UGX
            </span>
            <input
              type="number"
              placeholder="Max price"
              className="w-28 px-2.5 bg-transparent outline-none placeholder:text-gray-400 h-full text-sm"
              value={filters.maxPrice ?? ''}
              onChange={(e) =>
                onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}