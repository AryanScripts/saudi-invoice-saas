'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  CreditCard,
  Settings,
  ShieldCheck,
  LogOut,
  PlusCircle,
  Receipt,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { toastSuccess } from '@/components/ToastProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) {
          setProfile(data as Profile);
        }
      }
    }
    loadUser();
  }, [pathname]);

  const handleSignout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signout' }),
      });
      toastSuccess('Signed out successfully', 'تم تسجيل الخروج بنجاح');
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    {
      nameEn: 'Dashboard',
      nameAr: 'لوحة التحكم',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      nameEn: 'Invoices',
      nameAr: 'الفواتير',
      href: '/invoices',
      icon: FileText,
    },
    {
      nameEn: 'Clients',
      nameAr: 'العملاء',
      href: '/clients',
      icon: Users,
    },
    {
      nameEn: 'Products & Services',
      nameAr: 'المنتجات والخدمات',
      href: '/products',
      icon: Package,
    },
    {
      nameEn: 'Subscription',
      nameAr: 'الاشتراك والباقات',
      href: '/subscription',
      icon: CreditCard,
    },
    {
      nameEn: 'Settings & PIN',
      nameAr: 'الإعدادات ورمز الأمان',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-slate-900 border-r border-slate-800 text-white shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent block">
                SaudiInvoice
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold block -mt-1 font-arabic" dir="rtl">
                الفاتورة السعودية
              </span>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/20 shrink-0">
              {profile?.company_name?.[0] || 'C'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {profile?.company_name || 'My Company'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                VAT: {profile?.vat_number || '300000000000003'}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-700/40 text-[10px]">
            <span className="text-emerald-400 font-semibold uppercase">
              {profile?.plan_tier?.replace('_', ' ') || 'Phase 1'}
            </span>
            {Boolean(profile?.pin_deletion_access_granted || profile?.pin_package_purchased) && (
              <span className="inline-flex items-center gap-1 text-teal-400 font-semibold">
                <Lock className="h-3 w-3" /> PIN Protected
              </span>
            )}
          </div>
        </div>

        <div className="px-4 mb-3">
          <Link href="/invoices/new">
            <Button variant="emerald" className="w-full text-xs font-semibold h-9 shadow-md">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              New Invoice | فاتورة جديدة
            </Button>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.nameEn}</span>
                </div>
                <span className="text-[11px] font-arabic opacity-80" dir="rtl">
                  {item.nameAr}
                </span>
              </Link>
            );
          })}

          {/* Admin link if Super Admin */}
          {profile?.is_super_admin && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <Link
                href="/admin/dashboard"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  <span>Admin Portal</span>
                </div>
                <span className="text-[11px] font-arabic" dir="rtl">
                  لوحة المشرف
                </span>
              </Link>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleSignout}
            className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </div>
            <span className="font-arabic" dir="rtl">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-white">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-400" />
            <span className="font-bold text-sm">SaudiInvoice | الفاتورة</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                <span>{item.nameEn}</span>
                <span dir="rtl">{item.nameAr}</span>
              </Link>
            ))}
            <button
              onClick={handleSignout}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-slate-800 rounded-lg flex justify-between"
            >
              <span>Sign Out</span>
              <span dir="rtl">تسجيل الخروج</span>
            </button>
          </div>
        )}

        {/* Page Children */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
