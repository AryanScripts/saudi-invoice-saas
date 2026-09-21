'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-lg font-bold text-slate-900">
            {titleEn} | {titleAr}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-500 mt-1">
            {descriptionEn}
            <br />
            <span className="text-xs text-slate-400 font-normal" dir="rtl">
              {descriptionAr}
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel | إلغاء
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Delete | حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
