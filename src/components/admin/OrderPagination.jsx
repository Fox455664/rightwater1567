import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const OrderPagination = ({ currentPage, totalPages, changePage, totalItems }) => {
  return (
    <div className="flex items-center justify-between mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <span className="text-sm text-slate-700 dark:text-slate-300">
        صفحة {currentPage} من {totalPages} (إجمالي {totalItems} طلبات)
      </span>
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <Button variant="outline" size="icon" onClick={() => changePage(1)} disabled={currentPage === 1} aria-label="الصفحة الأولى">
          <ChevronsRight className="h-4 w-4 rtl:hidden" />
          <ChevronsLeft className="h-4 w-4 ltr:hidden" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} aria-label="الصفحة السابقة">
          <ChevronRight className="h-4 w-4 rtl:hidden" />
          <ChevronLeft className="h-4 w-4 ltr:hidden" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="الصفحة التالية">
          <ChevronLeft className="h-4 w-4 rtl:hidden" />
          <ChevronRight className="h-4 w-4 ltr:hidden" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => changePage(totalPages)} disabled={currentPage === totalPages} aria-label="الصفحة الأخيرة">
          <ChevronsLeft className="h-4 w-4 rtl:hidden" />
          <ChevronsRight className="h-4 w-4 ltr:hidden" />
        </Button>
      </div>
    </div>
  );
};