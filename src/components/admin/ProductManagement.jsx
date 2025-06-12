// src/components/admin/ProductManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase'; // لم نعد بحاجة لـ storage
import { collection, doc, updateDoc, addDoc, deleteDoc, runTransaction, onSnapshot } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx";
import { PlusCircle, Edit, Trash2, PackagePlus, Loader2, AlertTriangle, Search, FilterX, Image, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

// --- تم إزالة كل ما يتعلق بالصور والرفع ---

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({ name: '', category: '', price: 0, description: '', image: '', stock: 0, originalPrice: null });
  
  const [stockUpdate, setStockUpdate] = useState({ amount: 0, type: 'add' });
  const [searchTerm, setSearchTerm] = useState('');

  // onSnapshot يبقى كما هو
  useEffect(() => {
    setLoading(true);
    const productsCollectionRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching products: ", err);
      setError("حدث خطأ أثناء تحميل المنتجات.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setProductFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productFormData.name || productFormData.price <= 0) {
      toast({ title: "بيانات غير كاملة", description: "يرجى إدخال اسم المنتج وسعره.", variant: "destructive" });
      return;
    }

    try {
      // لا يوجد رفع، نستخدم الرابط مباشرة
      const newProductData = {
        ...productFormData,
        price: Number(productFormData.price),
        stock: Number(productFormData.stock),
        originalPrice: productFormData.originalPrice ? Number(productFormData.originalPrice) : null,
      };

      await addDoc(collection(db, 'products'), newProductData);
      toast({ title: "✅ تم إضافة المنتج", description: `تم إضافة "${productFormData.name}" بنجاح.`, className: "bg-green-500 text-white" });
      setIsAddModalOpen(false);
    } catch (err) {
      toast({ title: "❌ خطأ في الإضافة", description: err.message, variant: "destructive" });
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!currentProduct) return;
    
    try {
      const productRef = doc(db, 'products', currentProduct.id);
      await updateDoc(productRef, {
        ...productFormData, // البيانات الجديدة من النموذج
        price: Number(productFormData.price),
        stock: Number(productFormData.stock),
        originalPrice: productFormData.originalPrice ? Number(productFormData.originalPrice) : null,
      });
      
      toast({ title: "✅ تم تعديل المنتج", description: `تم تعديل "${productFormData.name}" بنجاح.`, className: "bg-green-500 text-white" });
      setIsEditModalOpen(false);
      setCurrentProduct(null);
    } catch (err) {
      toast({ title: "❌ خطأ في التعديل", description: err.message, variant: "destructive" });
    }
  };

  // ... (handleDeleteProduct و handleUpdateStock كما هما)

  const openAddModal = () => {
    setProductFormData({ name: '', category: '', price: 0, description: '', image: '', stock: 0, originalPrice: null });
    setIsAddModalOpen(true);
  };
  
  const openEditModal = (product) => {
    setCurrentProduct(product);
    setProductFormData({ ...product });
    setIsEditModalOpen(true);
  };
    // ... (باقي الدوال كما هي)
  
  // 🔥🔥🔥 --- بداية التعديل الجذري على النموذج --- 🔥🔥🔥
  const renderProductForm = (handleSubmit) => (
    <form onSubmit={handleSubmit} className="space-y-4 text-right max-h-[70vh] overflow-y-auto p-1">
        <div><Label htmlFor="name">اسم المنتج</Label><Input id="name" name="name" value={productFormData.name} onChange={handleInputChange} required /></div>
        <div><Label htmlFor="category">الفئة</Label><Input id="category" name="category" value={productFormData.category} onChange={handleInputChange} /></div>
        <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="price">السعر (ج.م)</Label><Input id="price" name="price" type="number" value={productFormData.price} onChange={handleInputChange} required min="0" step="0.01" /></div>
            <div><Label htmlFor="originalPrice">السعر الأصلي (اختياري)</Label><Input id="originalPrice" name="originalPrice" type="number" value={productFormData.originalPrice || ''} onChange={handleInputChange} min="0" step="0.01" /></div>
        </div>
        <div><Label htmlFor="stock">المخزون</Label><Input id="stock" name="stock" type="number" value={productFormData.stock} onChange={handleInputChange} required min="0" /></div>
        <div><Label htmlFor="description">الوصف</Label><Textarea id="description" name="description" value={productFormData.description} onChange={handleInputChange} /></div>

        {/* --- حقل رابط الصورة الجديد --- */}
        <div>
            <Label htmlFor="image">رابط الصورة</Label>
            <div className="flex items-center space-x-2 space-x-reverse">
                <Link2 className="h-5 w-5 text-slate-400" />
                <Input id="image" name="image" placeholder="https://example.com/image.jpg" value={productFormData.image} onChange={handleInputChange} />
            </div>
        </div>

        {/* --- المعاينة الفورية --- */}
        {productFormData.image && (
            <div>
                <Label>معاينة الصورة</Label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-input p-4">
                    <img 
                        src={productFormData.image} 
                        alt="معاينة" 
                        className="max-h-40 w-auto object-contain rounded-md" 
                        // معالجة الخطأ في حالة أن الرابط غير صالح
                        onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/150?text=Invalid+Link'; }}
                    />
                </div>
            </div>
        )}
        
        <DialogFooter className="pt-4">
            <Button type="submit">حفظ</Button>
            <DialogClose asChild>
                <Button type="button" variant="outline">إلغاء</Button>
            </DialogClose>
        </DialogFooter>
    </form>
  );
  // 🔥🔥🔥 --- نهاية التعديل الجذري على النموذج --- 🔥🔥🔥

  // ... (باقي الكود للعرض كما هو)
  return (
      <motion.div /*...*/ >
          {/* ... */}
          {/* تعديل استدعاء renderProductForm */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild><Button onClick={openAddModal}><PlusCircle className="mr-2 h-5 w-5" /> إضافة منتج جديد</Button></DialogTrigger>
              <DialogContent className="sm:max-w-lg text-right"><DialogHeader><DialogTitle className="text-primary">إضافة منتج جديد</DialogTitle></DialogHeader>{renderProductForm(handleAddProduct)}</DialogContent>
          </Dialog>

          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="sm:max-w-lg text-right"><DialogHeader><DialogTitle className="text-primary">تعديل المنتج: {currentProduct?.name}</DialogTitle></DialogHeader>{currentProduct && renderProductForm(handleEditProduct)}</DialogContent>
          </Dialog>
          {/* ... */}
      </motion.div>
  );
};

export default ProductManagement;
