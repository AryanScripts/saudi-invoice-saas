'use client';

import React, { useEffect, useState } from 'react';
import { generateZatcaQrDataUrl, generateZatcaTlvPayload } from '@/lib/qr/zatca';
import { ZatcaQrInput } from '@/types';
import { QrCode, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZatcaQrCodeProps {
  input: ZatcaQrInput;
  size?: number;
  showDetails?: boolean;
}

export function ZatcaQrCode({ input, size = 160, showDetails = false }: ZatcaQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [tlvBase64, setTlvBase64] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadQr() {
      try {
        const url = await generateZatcaQrDataUrl(input);
        const b64 = generateZatcaTlvPayload(input);
        if (isMounted) {
          setQrDataUrl(url);
          setTlvBase64(b64);
        }
      } catch (err) {
        console.error('Failed to generate QR:', err);
      }
    }
    loadQr();
    return () => {
      isMounted = false;
    };
  }, [input]);

  const handleCopyBase64 = () => {
    navigator.clipboard.writeText(tlvBase64);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `ZATCA-QR-${input.vatNumber || 'invoice'}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="relative p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="ZATCA Compliant QR Code | رمز الاستجابة السريعة لهيئة الزكاة"
            width={size}
            height={size}
            className="rounded-lg shadow-2xs"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-100 rounded-lg text-slate-400"
          >
            <QrCode className="h-8 w-8 animate-pulse" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>ZATCA Validated | متوافق مع هيئة الزكاة</span>
      </div>

      {showDetails && (
        <div className="mt-4 w-full text-xs text-slate-600 border-t border-slate-100 pt-3 space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Seller | المورد:</span>
            <span className="font-semibold text-slate-800">{input.sellerName}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">VAT ID | الرقم الضريبي:</span>
            <span className="font-mono text-slate-800">{input.vatNumber}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Grand Total | الإجمالي:</span>
            <span className="font-bold text-emerald-700 font-mono">{input.invoiceTotal} ﷼</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">VAT Total | الضريبة:</span>
            <span className="font-bold text-slate-700 font-mono">{input.vatTotal} ﷼</span>
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyBase64}
              className="w-1/2 text-[11px] h-8"
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 mr-1" /> Copied | تم
                </>
              ) : (
                'Copy TLV | نسخ'
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="w-1/2 text-[11px] h-8"
            >
              <Download className="h-3 w-3 mr-1" /> Save QR | حفظ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
