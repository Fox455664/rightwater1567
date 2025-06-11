import React from 'react';

export const statusOptions = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'pending', label: 'قيد الانتظار', color: 'bg-yellow-500 dark:bg-yellow-400', textColor: 'text-white' },
  { value: 'processing', label: 'قيد المعالجة', color: 'bg-blue-500 dark:bg-blue-400', textColor: 'text-white' },
  { value: 'shipped', label: 'تم الشحن', color: 'bg-sky-500 dark:bg-sky-400', textColor: 'text-white' },
  { value: 'delivered', label: 'تم التسليم', color: 'bg-green-500 dark:bg-green-400', textColor: 'text-white' },
  { value: 'cancelled', label: 'ملغي', color: 'bg-red-500 dark:bg-red-400', textColor: 'text-white' },
];

export const getStatusInfo = (statusValue) => {
  return statusOptions.find(s => s.value === statusValue) || { label: statusValue || 'غير معروف', color: 'bg-slate-500', textColor: 'text-white' };
};

export const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(0);
  }
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(numericPrice);
};

export const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return 'غير متوفر';
  try {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return 'تاريخ غير صالح';
  }
};

const statusTranslations = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي'
};

export const getStatusArabic = (status) => statusTranslations[status] || status || 'غير محدد';

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'pending': return 'default'; 
    case 'processing': return 'secondary';
    case 'shipped': return 'outline'; 
    case 'delivered': return 'default'; 
    case 'cancelled': return 'destructive';
    default: return 'default';
  }
};

export const getStatusBadgeColor = (status) => {
  const info = getStatusInfo(status);
  return info.color;
};