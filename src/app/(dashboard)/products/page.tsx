'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import { formatRiyal } from '@/lib/utils';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Search,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { toastSuccess, toastError } from '@/components/ToastProvider';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    unit_price: '',
    vat_rate: '15',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data as Product[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      name_ar: '',
      unit_price: '',
      vat_rate: '15',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_ar: product.name_ar || '',
      unit_price: product.unit_price.toString(),
      vat_rate: product.vat_rate.toString(),
    });
    setIsFormModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.unit_price) {
      toastError('Product name and unit price are required', 'اسم المنتج وسعر الوحدة مطلوبان');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            name_ar: formData.name_ar || null,
            unit_price: parseFloat(formData.unit_price),
            vat_rate: parseFloat(formData.vat_rate),
          })
          .eq('id', editingProduct.id)
          .eq('user_id', user.id);

        if (error) {
          toastError(error.message, 'فشل تحديث المنتج');
          return;
        }

        toastSuccess('Product updated', 'تم تحديث بيانات المنتج بنجاح');
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            user_id: user.id,
            name: formData.name,
            name_ar: formData.name_ar || null,
            unit_price: parseFloat(formData.unit_price),
            vat_rate: parseFloat(formData.vat_rate),
          });

        if (error) {
          toastError(error.message, 'فشل إضافة المنتج');
          return;
        }

        toastSuccess('Product added', 'تمت إضافة المنتج بنجاح');
      }

      setIsFormModalOpen(false);
      fetchProducts();
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الاتصال');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) {
        toastError(error.message, 'فشل حذف المنتج');
        return;
      }

      toastSuccess('Product deleted', 'تم حذف المنتج بنجاح');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الاتصال');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.name_ar?.toLowerCase().includes(q) ||
      p.unit_price.toString().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Products & Services | المنتجات والخدمات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Catalog of billable services and products with 15% VAT pricing in ﷼
          </p>
        </div>
        <Button variant="emerald" onClick={handleOpenAdd} className="shadow-md">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Product | إضافة منتج
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
            placeholder="Search catalog by name or price in ﷼..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total: <span className="font-bold text-slate-900">{filteredProducts.length}</span> items
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading catalog... | جاري تحميل المنتجات...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No products found | لا توجد منتجات بعد</p>
            <p className="text-xs text-slate-400 mt-1">Add items to quickly select them on new invoices</p>
            <Button variant="emerald" size="sm" onClick={handleOpenAdd} className="mt-4">
              <Plus className="h-4 w-4 mr-1" /> Add Product | إضافة منتج
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product / Service | المنتج أو الخدمة</TableHead>
                <TableHead>Unit Price (Excl. VAT) | السعر</TableHead>
                <TableHead>VAT Rate | الضريبة</TableHead>
                <TableHead>Total with VAT | الإجمالي</TableHead>
                <TableHead className="text-right">Actions | إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell>
                    <span className="font-bold text-slate-900 block">{prod.name}</span>
                    {prod.name_ar && (
                      <span className="text-xs text-slate-500" dir="rtl">{prod.name_ar}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono font-semibold text-slate-800">
                    {formatRiyal(prod.unit_price)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {prod.vat_rate}%
                  </TableCell>
                  <TableCell className="font-mono font-bold text-emerald-700">
                    {formatRiyal(Number(prod.unit_price) * (1 + Number(prod.vat_rate) / 100))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(prod)}
                        className="text-xs h-8 px-2"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit | تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(prod)}
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

      {/* Add / Edit Product Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold text-slate-900">
              {editingProduct ? 'Edit Product | تعديل المنتج' : 'Add New Product | إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-3 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name (EN) *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Cloud Hosting Service"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 text-right" dir="rtl">
                اسم المنتج أو الخدمة (بالعربي)
              </label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                placeholder="خدمة استضافة سحابية"
                dir="rtl"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 text-right"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Price | السعر (﷼) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  placeholder="500.00"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  VAT Rate | الضريبة (%)
                </label>
                <input
                  type="number"
                  value={formData.vat_rate}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono text-slate-600"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Cancel | إلغاء
              </Button>
              <Button type="submit" variant="emerald" isLoading={isSubmitting}>
                Save Product | حفظ المنتج
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
          onConfirm={handleDeleteProduct}
          titleEn="Delete Product"
          titleAr="حذف المنتج"
          descriptionEn={`Are you sure you want to delete "${deleteTarget.name}"?`}
          descriptionAr={`هل أنت متأكد من حذف المنتج "${deleteTarget.name}"؟`}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
