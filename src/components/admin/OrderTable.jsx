
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';

export const OrderTable = ({
  orders,
  selectedOrders,
  handleSelectOrder,
  handleSelectAll,
  openDetailsModal,
  handleStatusChange,
  handleDeleteOrder,
  formatDate,
  formatPrice,
  getStatusInfo,
  statusOptions
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-700/50">
          <TableRow>
            <TableHead className="px-3 py-3.5 w-10 text-center">
              <Checkbox
                checked={selectedOrders.length === orders.length && orders.length > 0}
                onCheckedChange={(checked) => handleSelectAll(checked)}
                aria-label="تحديد الكل"
              />
            </TableHead>
            <TableHead className="text-right px-3 py-3.5">رقم الطلب</TableHead>
            <TableHead className="text-right px-3 py-3.5">العميل</TableHead>
            <TableHead className="text-right px-3 py-3.5">التاريخ</TableHead>
            <TableHead className="text-right px-3 py-3.5">الإجمالي</TableHead>
            <TableHead className="text-right px-3 py-3.5">الحالة</TableHead>
            <TableHead className="text-center px-3 py-3.5">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const customerInfo = order.customerInfo || {};
            const shippingInfo = order.shipping || {};
            const displayName = customerInfo.name || shippingInfo.fullName || 'غير متوفر';
            const displayEmail = customerInfo.email || order.userEmail || 'غير متوفر';
            
            // Ensure totalAmount is used, fallback if necessary
            const totalToDisplay = typeof order.totalAmount !== 'undefined' ? order.totalAmount : 
                                   (typeof order.total !== 'undefined' ? order.total : 0);

            return (
              <TableRow key={order.id} data-state={selectedOrders.includes(order.id) ? "selected" : ""} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <TableCell className="px-3 py-4 text-center">
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={(checked) => handleSelectOrder(order.id, checked)}
                    aria-label={`تحديد الطلب ${order.id.slice(0, 8)}`}
                  />
                </TableCell>
                <TableCell className="font-medium text-sky-600 dark:text-sky-400 px-3 py-4">
                  <span onClick={() => openDetailsModal(order)} className="hover:underline cursor-pointer">
                    #{order.id.slice(0, 8)}...
                  </span>
                </TableCell>
                <TableCell className="px-3 py-4">
                  <div>{displayName}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{displayEmail}</div>
                </TableCell>
                <TableCell className="px-3 py-4">{formatDate(order.createdAt)}</TableCell>
                <TableCell className="px-3 py-4">{formatPrice(totalToDisplay)}</TableCell>
                <TableCell className="px-3 py-4">
                  <Select value={order.status || ''} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                    <SelectTrigger className={`w-full text-xs h-8 px-2 py-1 rounded-md border-0 focus:ring-0 focus:ring-offset-0 ${statusInfo.color} ${statusInfo.textColor}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.filter(s => s.value !== 'all').map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-center px-3 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDetailsModal(order)}>
                        <Eye className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> عرض التفاصيل
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 dark:focus:text-red-400">
                            <Trash2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> حذف الطلب
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد أنك تريد حذف الطلب رقم #{order.id.slice(0,8)}...؟ هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
