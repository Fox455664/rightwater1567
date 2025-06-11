import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { db, collection, onSnapshot, query as firestoreQuery, orderBy, doc, updateDoc, deleteDoc, writeBatch, where } from '@/firebase';
import { Loader2, PackageSearch, Search, MoreHorizontal, Eye, Trash2, Printer, UploadCloud, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ListFilter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { OrderDetailsModalContent } from '@/components/admin/OrderDetailsModalContent';
import { OrderTable } from '@/components/admin/OrderTable';
import { OrderFilters } from '@/components/admin/OrderFilters';
import { OrderPagination } from '@/components/admin/OrderPagination';
import { formatPrice, formatDate, getStatusInfo, statusOptions } from '@/lib/orderUtils';

const ITEMS_PER_PAGE = 10;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentOrderDetails, setCurrentOrderDetails] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    let q = firestoreQuery(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    if (statusFilter !== 'all') {
      q = firestoreQuery(collection(db, 'orders'), where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching orders: ", err);
      setError("فشل في تحميل الطلبات. يرجى المحاولة مرة أخرى.");
      setLoading(false);
      toast({ title: "خطأ", description: "فشل في تحميل الطلبات.", variant: "destructive" });
    });

    return () => unsubscribe();
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      (order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.shipping?.fullName && order.shipping.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [orders, searchTerm]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });
      toast({ title: "تم التحديث", description: `تم تحديث حالة الطلب #${orderId.slice(0, 5)}... إلى ${getStatusInfo(newStatus).label}.` });
    } catch (err) {
      console.error("Error updating order status: ", err);
      toast({ title: "خطأ", description: "فشل تحديث حالة الطلب.", variant: "destructive" });
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0 || newStatus === 'all') {
      toast({ title: "تنبيه", description: "يرجى تحديد طلب واحد على الأقل وحالة صالحة للتحديث.", variant: "default" });
      return;
    }
    const batch = writeBatch(db);
    selectedOrders.forEach(orderId => {
      const orderRef = doc(db, 'orders', orderId);
      batch.update(orderRef, { status: newStatus, updatedAt: new Date() });
    });
    try {
      await batch.commit();
      toast({ title: "تم التحديث الجماعي", description: `تم تحديث حالة ${selectedOrders.length} طلبات إلى ${getStatusInfo(newStatus).label}.` });
      setSelectedOrders([]);
    } catch (err) {
      console.error("Error bulk updating statuses: ", err);
      toast({ title: "خطأ", description: "فشل التحديث الجماعي للحالات.", variant: "destructive" });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast({ title: "تم الحذف", description: `تم حذف الطلب #${orderId.slice(0, 5)}... بنجاح.` });
    } catch (err) {
      console.error("Error deleting order: ", err);
      toast({ title: "خطأ", description: "فشل حذف الطلب.", variant: "destructive" });
    }
  };

  const handleSelectOrder = (orderId, checked) => {
    setSelectedOrders(prev =>
      checked ? [...prev, orderId] : prev.filter(id => id !== orderId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedOrders(checked ? paginatedOrders.map(o => o.id) : []);
  };

  const openDetailsModal = (order) => {
    setCurrentOrderDetails(order);
    setIsDetailsModalOpen(true);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      toast({ title: "ملف غير صالح", description: "يرجى اختيار ملف صورة.", variant: "destructive" });
    }
  };

  const changePage = (newPage) => {
    setCurrentPage(newPage);
    setSelectedOrders([]); 
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-16 w-16 text-sky-500 animate-spin" /></div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 md:px-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400 flex items-center">
          <ListFilter className="mr-3 rtl:ml-3 rtl:mr-0" size={32} />
          إدارة الطلبات
        </h1>
      </div>

      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusOptions={statusOptions}
        selectedOrders={selectedOrders}
        handleBulkStatusUpdate={handleBulkStatusUpdate}
        setSelectedOrders={setSelectedOrders}
        setCurrentPage={setCurrentPage}
      />

      {paginatedOrders.length === 0 && !loading ? (
        <div className="text-center py-12">
          <PackageSearch className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
          <p className="text-xl text-slate-600 dark:text-slate-400">لم يتم العثور على طلبات تطابق بحثك أو الفلتر.</p>
        </div>
      ) : (
        <>
          <OrderTable
            orders={paginatedOrders}
            selectedOrders={selectedOrders}
            handleSelectOrder={handleSelectOrder}
            handleSelectAll={handleSelectAll}
            openDetailsModal={openDetailsModal}
            handleStatusChange={handleStatusChange}
            handleDeleteOrder={handleDeleteOrder}
            formatDate={formatDate}
            formatPrice={formatPrice}
            getStatusInfo={getStatusInfo}
            statusOptions={statusOptions}
          />
          {totalPages > 1 && (
            <OrderPagination
              currentPage={currentPage}
              totalPages={totalPages}
              changePage={changePage}
              totalItems={filteredOrders.length}
            />
          )}
        </>
      )}

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <OrderDetailsModalContent
          order={currentOrderDetails}
          logoPreview={logoPreview}
          handleLogoUpload={handleLogoUpload}
          formatDate={formatDate}
          formatPrice={formatPrice}
          getStatusInfo={getStatusInfo}
        />
      </Dialog>
    </motion.div>
  );
};

export default OrderManagement;
