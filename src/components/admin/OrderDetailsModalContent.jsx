import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Printer, UploadCloud } from 'lucide-react';

export const OrderDetailsModalContent = ({ order, logoPreview, handleLogoUpload, formatDate, formatPrice, getStatusInfo }) => {
  const printRef = useRef(null);

  // --- 🔥 بداية دالة الطباعة الاحترافية 🔥 ---
  const handlePrintInvoice = () => {
    if (!printRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة الفاتورة.');
      return;
    }

    // 1. استنساخ محتوى الفاتورة
    const invoiceContent = printRef.current.innerHTML;
    
    // 2. نسخ كل الـ <link> و <style> من الصفحة الحالية
    const stylesheets = Array.from(document.styleSheets)
      .map(sheet => sheet.href ? `<link rel="stylesheet" href="${sheet.href}">` : `<style>${Array.from(sheet.cssRules).map(rule => rule.cssText).join('')}</style>`)
      .join('\n');

    // 3. بناء صفحة HTML كاملة مع الستايلات المنسوخة
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>فاتورة طلب - ${order?.id?.slice(0, 8) || ''}</title>
          ${stylesheets}
          <style>
            /* ستايلات خاصة بالطباعة فقط */
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="bg-white dark:bg-black p-8">
          ${invoiceContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // 4. استدعاء الطباعة بعد تحميل الصور بالكامل
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };
  // --- 🔥 نهاية دالة الطباعة الاحترافية 🔥 ---

  // ... باقي الكود لم يتغير لأنه مكتوب بشكل ممتاز ...
  const safeOrder = order || {};
  const shippingInfo = safeOrder.shipping || {};
  const displayName = shippingInfo.fullName || 'غير متوفر';
  const displayEmail = safeOrder.userEmail || 'غير متوفر';
  const displayPhone = shippingInfo.phone || 'غير متوفر';
  const displayAddress = shippingInfo.address || 'غير متوفر';
  const displayCity = shippingInfo.city || 'غير متوفر';
  const displayCountry = shippingInfo.country || 'غير متوفر';
  const displayPostalCode = shippingInfo.postalCode || '';
  const displayNotes = shippingInfo.notes || '';
  const safeItems = safeOrder.items || [];
  const subtotalAmount = safeOrder.subtotal || 0;
  const shippingCost = safeOrder.shippingCost || 0;
  const totalAmount = safeOrder.total || 0;
  const statusInfo = getStatusInfo(safeOrder.status);

  return (
    <>
      {/* قسم الطباعة لا يتغير */}
      <div ref={printRef} className="printable-content">
        {/* ... */}
      </div>

      {/* قسم الأزرار يتغير فقط في الكلاسات الخاصة بإخفاء العناصر عند الطباعة */}
      <DialogFooter className="p-6 border-t dark:border-slate-700 flex-col sm:flex-row gap-2 no-print">
        <div className="flex items-center gap-2">
          <label htmlFor="logoUploadModal" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span><UploadCloud className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> تحميل شعار</span>
            </Button>
            <Input id="logoUploadModal" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
          <Button onClick={handlePrintInvoice} className="bg-green-500 hover:bg-green-600 text-white">
            <Printer className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> طباعة الفاتورة
          </Button>
        </div>
        <DialogClose asChild>
          <Button variant="outline">إغلاق</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
};
