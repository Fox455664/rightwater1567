// src/app/profile/page.jsx

"use client"; // <--- مهم جداً في Next.js App Router

import React, { useState, useEffect } from 'react';
// السطر الصحيح
import { Link } from 'react-router-dom';
import { useRouter } from 'next/navigation'; // <-- التغيير الأول: استخدام useRouter من Next.js
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase'; // <-- افترض أن ملف firebase.js مُهيأ بشكل صحيح
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

// --- استيراد مكونات الواجهة والأيقونات ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, KeyRound, LogOut, ShoppingCart } from 'lucide-react';

// --- دوال مساعدة (ممتاز أنها موجودة) ---
const formatPrice = (price) => {
  if (typeof price !== 'number') return 'N/A';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
};

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return 'تاريخ غير معروف';
  return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(timestamp.toDate());
};

const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: "قيد المراجعة", color: "bg-yellow-100 dark:bg-yellow-900/50", textColor: "text-yellow-800 dark:text-yellow-300" },
      processing: { label: "قيد المعالجة", color: "bg-blue-100 dark:bg-blue-900/50", textColor: "text-blue-800 dark:text-blue-300" },
      shipped: { label: "تم الشحن", color: "bg-sky-100 dark:bg-sky-900/50", textColor: "text-sky-800 dark:text-sky-300" },
      completed: { label: "مكتمل", color: "bg-green-100 dark:bg-green-900/50", textColor: "text-green-800 dark:text-green-300" },
      cancelled: { label: "ملغي", color: "bg-red-100 dark:bg-red-900/50", textColor: "text-red-800 dark:text-red-300" },
      'on-hold': { label: "في الانتظار", color: "bg-orange-100 dark:bg-orange-900/50", textColor: "text-orange-800 dark:text-orange-300" },
    };
    return statuses[status] || { label: status, color: "bg-slate-100 dark:bg-slate-700", textColor: "text-slate-800 dark:text-slate-300" };
};

// --- المكون الرئيسي ---
const UserProfilePage = () => {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const router = useRouter(); // <-- التغيير الثاني: تعريف router
  const { toast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push('/login'); // <-- التغيير الثالث: استخدام router.push
      return;
    }

    setFormData({
      name: currentUser.displayName || '',
      phone: currentUser.phoneNumber || '',
    });

    setLoadingOrders(true);
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(userOrders);
      setLoadingOrders(false);
    }, (error) => {
      console.error("Error fetching user orders: ", error);
      toast({ title: "خطأ", description: "فشل في تحميل الطلبات.", variant: "destructive" });
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [currentUser, authLoading, router, toast]); // <-- إضافة router إلى مصفوفة الاعتماديات

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: "خطأ", description: "حقل الاسم لا يمكن أن يكون فارغاً.", variant: "destructive" });
      return;
    }
    setIsUpdating(true);
    try {
      if (currentUser.displayName !== formData.name) {
        await updateProfile(currentUser, { displayName: formData.name });
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: formData.name,
        phone: formData.phone,
      }, { merge: true });

      toast({ title: "تم التحديث", description: "تم حفظ معلوماتك بنجاح." });
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({ title: "خطأ", description: "فشل تحديث المعلومات.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/'); // <-- التغيير الرابع: استخدام router.push
    } catch (error) {
      toast({ title: "خطأ", description: "فشل تسجيل الخروج.", variant: "destructive" });
    }
  };

  if (authLoading || !currentUser) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* العمود الأيسر: تم إبقاء الكود كما هو لأنه يستخدم Link بشكل صحيح */}
          <div className="lg:col-span-1 space-y-8">
            <Card>
              {/* ... باقي الكود لم يتغير ... */}
            </Card>
            <Card>
              {/* ... باقي الكود لم يتغير ... */}
            </Card>
          </div>
          {/* العمود الأيمن: تم إبقاء الكود كما هو */}
          <div className="lg:col-span-2">
            <Card>
              {/* ... باقي الكود لم يتغير ... */}
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfilePage;
