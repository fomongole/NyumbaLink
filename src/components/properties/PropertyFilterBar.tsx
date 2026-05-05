'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { districtsApi } from '@/lib/api/districts.api';
import { PropertyFilters, PropertyType, PropertyStatus } from '@/types';

interface Props {
  filters: PropertyFilters & { search?: string };
  onChange: (filters: PropertyFilters & { search?: string }) => void;
  onReset: () => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'SINGLE_ROOM', label: 'Single Room' },
  { value: 'DOUBLE_ROOM', label: 'Double Room' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'STUDIO', label: 'Studio' },
];

const STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RENTED', label: 'Rented Out' },
];

const BEDROOMS = [1, 2, 3, 4, 5];

const UNSET = '__ALL__';

export default function PropertyFilterBar({ filters, onChange, onReset }: Props) {
  const { data: districts = [] } = useQuery({
    queryKey: ['districts'],
    queryFn: districtsApi.getAll,
  });

  const hasActiveFilters =
    filters.search ||
    filters.districtId ||
    filters.type ||
    filters.status ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.bedrooms;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Text search */}
      <div className="relative w-56">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <Input
          placeholder="Search title or area..."
          className="pl-8 h-9 text-sm"
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      {/* District */}
      <Select
        value={filters.districtId ?? UNSET}
        onValueChange={(v) =>
          onChange({ ...filters, districtId: v === UNSET ? undefined : v })
        }
      >
        <SelectTrigger className="h-9 w-40 text-sm">
          <SelectValue placeholder="District" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>All Districts</SelectItem>
          {districts.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type */}
      <Select
        value={filters.type ?? UNSET}
        onValueChange={(v) =>
          onChange({ ...filters, type: v === UNSET ? undefined : (v as PropertyType) })
        }
      >
        <SelectTrigger className="h-9 w-36 text-sm">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>All Types</SelectItem>
          {PROPERTY_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
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
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Bedrooms */}
      <Select
        value={filters.bedrooms?.toString() ?? UNSET}
        onValueChange={(v) =>
          onChange({ ...filters, bedrooms: v === UNSET ? undefined : Number(v) })
        }
      >
        <SelectTrigger className="h-9 w-32 text-sm">
          <SelectValue placeholder="Bedrooms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>Any Beds</SelectItem>
          {BEDROOMS.map((b) => (
            <SelectItem key={b} value={b.toString()}>
              {b} {b === 1 ? 'Bedroom' : 'Bedrooms'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Min / Max Price */}
      <Input
        type="number"
        placeholder="Min price"
        className="h-9 w-28 text-sm"
        value={filters.minPrice ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            minPrice: e.target.value ? Number(e.target.value) : undefined,
          })
        }
      />
      <Input
        type="number"
        placeholder="Max price"
        className="h-9 w-28 text-sm"
        value={filters.maxPrice ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            maxPrice: e.target.value ? Number(e.target.value) : undefined,
          })
        }
      />

      {/* Reset */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="h-9 gap-1.5">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}