'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Client } from '@/types';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Phone,
  Building,
  MapPin,
  Search,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { toastSuccess, toastError } from '@/components/ToastProvider';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    email: '',
    phone: '',
    vat_number: '',
    address: '',
    address_ar: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClients = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setClients(data as Client[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      name_ar: '',
      email: '',
      phone: '',
      vat_number: '',
      address: '',
      address_ar: '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      name_ar: client.name_ar || '',
      email: client.email || '',
      phone: client.phone || '',
      vat_number: client.vat_number || '',
      address: client.address || '',
      address_ar: client.address_ar || '',
    });
    setIsFormModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toastError('Client name is required', 'اسم العميل مطلوب');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update({
            name: formData.name,
            name_ar: formData.name_ar || null,
            email: formData.email || null,
            phone: formData.phone || null,
            vat_number: formData.vat_number || null,
            address: formData.address || null,
            address_ar: formData.address_ar || null,
          })
          .eq('id', editingClient.id)
          .eq('user_id', user.id);

        if (error) {
          toastError(error.message, 'فشل تحديث بيانات العميل');
          return;
        }

        toastSuccess('Client updated', 'تم تحديث بيانات العميل بنجاح');
      } else {
        const { error } = await supabase
          .from('clients')
          .insert({
            user_id: user.id,
            name: formData.name,
            name_ar: formData.name_ar || null,
            email: formData.email || null,
            phone: formData.phone || null,
            vat_number: formData.vat_number || null,
            address: formData.address || null,
            address_ar: formData.address_ar || null,
          });

        if (error) {
          toastError(error.message, 'فشل إضافة العميل');
          return;
        }

        toastSuccess('Client added', 'تمت إضافة العميل بنجاح');
      }

      setIsFormModalOpen(false);
      fetchClients();
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الاتصال');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) {
        toastError(error.message, 'فشل حذف العميل');
        return;
      }

      toastSuccess('Client deleted', 'تم حذف العميل بنجاح');
      setDeleteTarget(null);
      fetchClients();
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الاتصال');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.name_ar?.toLowerCase().includes(q) ||
      c.vat_number?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Clients Management | إدارة العملاء
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Maintain your Saudi enterprise & retail client database with 15-digit VAT IDs
          </p>
        </div>
        <Button variant="emerald" onClick={handleOpenAdd} className="shadow-md">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Client | إضافة عميل
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, VAT number, or email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total: <span className="font-bold text-slate-900">{filteredClients.length}</span> clients
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading clients... | جاري تحميل بيانات العملاء...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No clients found | لا يوجد عملاء بعد</p>
            <p className="text-xs text-slate-400 mt-1">Add your customer database for fast invoice creation</p>
            <Button variant="emerald" size="sm" onClick={handleOpenAdd} className="mt-4">
              <Plus className="h-4 w-4 mr-1" /> Add Client | إضافة عميل
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name | اسم العميل</TableHead>
                <TableHead>VAT ID | الرقم الضريبي</TableHead>
                <TableHead>Contact | بيانات التواصل</TableHead>
                <TableHead>Address | العنوان</TableHead>
                <TableHead className="text-right">Actions | إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <span className="font-bold text-slate-900 block">{client.name}</span>
                    {client.name_ar && (
                      <span className="text-xs text-slate-500" dir="rtl">{client.name_ar}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-slate-700">
                    {client.vat_number || 'N/A'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    <div>{client.email || '—'}</div>
                    <div className="text-slate-400">{client.phone || ''}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                    {client.address || client.address_ar || 'Saudi Arabia'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(client)}
                        className="text-xs h-8 px-2"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit | تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(client)}
                        className="text-xs h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add / Edit Client Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold text-slate-900">
              {editingClient ? 'Edit Client | تعديل العميل' : 'Add New Client | إضافة عميل جديد'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveClient} className="space-y-3 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Name (EN) *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Saudi Telecom Company"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 text-right" dir="rtl">
                اسم العميل (بالعربي)
              </label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                placeholder="شركة الاتصالات السعودية"
                dir="rtl"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 text-right"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  VAT ID | الرقم الضريبي
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={formData.vat_number}
                  onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                  placeholder="300000000000003"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone | الهاتف
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966 50 000 0000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email | البريد الإلكتروني
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="billing@client.com.sa"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Address | العنوان
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Riyadh, Olaya Dist, Kingdom of Saudi Arabia"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <DialogFooter className="gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Cancel | إلغاء
              </Button>
              <Button type="submit" variant="emerald" isLoading={isSubmitting}>
                Save Client | حفظ العميل
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteClient}
          titleEn="Delete Client"
          titleAr="حذف العميل"
          descriptionEn={`Are you sure you want to delete ${deleteTarget.name}?`}
          descriptionAr={`هل أنت متأكد من حذف العميل "${deleteTarget.name}"؟`}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
