import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export const OrderFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  statusOptions,
  selectedOrders,
  handleBulkStatusUpdate,
  setSelectedOrders,
  setCurrentPage
}) => {
  return (
    <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="relative">
          <Input
            type="text"
            placeholder="ابحث برقم الطلب، اسم العميل..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 focus:ring-sky-500 focus:border-sky-500 pl-10 rtl:pr-10 rtl:pl-3"
          />
          <Search className="absolute left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        </div>
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">فلترة بالحالة</label>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
            <SelectTrigger className="w-full dark:bg-slate-700 dark:text-slate-200">
              <SelectValue placeholder="اختر حالة..." />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {selectedOrders.length > 0 && (
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center mt-2 md:mt-0">
            <Select onValueChange={(value) => handleBulkStatusUpdate(value)}>
              <SelectTrigger className="w-full dark:bg-slate-700 dark:text-slate-200">
                <SelectValue placeholder="تحديث حالة المحدد..." />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.filter(s => s.value !== 'all').map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setSelectedOrders([])} className="w-full">
              إلغاء تحديد ({selectedOrders.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};