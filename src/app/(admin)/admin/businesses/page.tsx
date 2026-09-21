'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import { AccessOverrideCard } from '@/components/admin/AccessOverrideCard';
import { Building, Search, Clock } from 'lucide-react';

export default function BusinessesAdminPage() {
  const [businesses, setBusinesses] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinesses = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or('is_super_admin.is.null,is_super_admin.eq.false')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBusinesses(data as Profile[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.company_name?.toLowerCase().includes(q) ||
      b.company_name_ar?.toLowerCase().includes(q) ||
      b.vat_number?.includes(q) ||
      b.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Registered Businesses & Access Overrides | إدارة المنشآت والصلاحيات
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Manage Saudi enterprise profiles, grant manual PIN deletion permissions, and adjust ZATCA plan tiers
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name, VAT ID, or email..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-white">{filteredBusinesses.length}</span> of {businesses.length} businesses
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
          Loading business profiles...
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          <Building className="h-12 w-12 text-slate-700 mx-auto mb-3" />
          No matching businesses found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBusinesses.map((b) => (
            <AccessOverrideCard
              key={b.id}
              business={b}
              onRefresh={fetchBusinesses}
            />
          ))}
        </div>
      )}
    </div>
  );
}
