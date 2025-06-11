// src/pages/UserProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, where, onSnapshot, orderBy, doc, updateDoc } from '@/firebase';
import { updateProfile } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, Settings, LogOut, ShoppingCart, KeyRound } from 'lucide-react';

// --- دوال مساعدة (يفضل وضعها في ملف منفصل مثل lib/utils.js) ---
const formatPrice = (price) => {
  if (typeof price !== 'number') return 'N/A';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
};

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return 'تاريخ غير معروف';
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(timestamp.toDate());
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
// --- نهاية الدوال المساعدة ---

const UserProfilePage = () => {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  // جلب بيانات المستخدم والطلبات
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // تعبئة النموذج ببيانات المستخدم الحالية
    setFormData({
      name: currentUser.displayName || '',
      phone: currentUser.phoneNumber || '', // افترض أن رقم الهاتف قد يكون في Auth
    });

    // جلب طلبات المستخدم
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
  }, [currentUser, authLoading, navigate, toast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // دالة تحديث بيانات المستخدم
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // تحديث اسم العرض في Firebase Auth
      if (currentUser.displayName !== formData.name) {
        await updateProfile(currentUser, { displayName: formData.name });
      }

      // تحديث البيانات في collection 'users' (أفضل ممارسة)
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: formData.name,
        phone: formData.phone,
      }, { merge: true }); // merge: true لإنشاء المستند إذا لم يكن موجوداً

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
      navigate('/');
    } catch (error) {
      toast({ title: "خطأ", description: "فشل تسجيل الخروج.", variant: "destructive" });
    }
  };

  if (authLoading || !currentUser) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* --- العمود الأيسر: معلومات المستخدم وتعديلها --- */}
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold">{currentUser.displayName || 'مستخدم جديد'}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                <div className="w-full space-y-2 mt-6">
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link to="/profile"><ShoppingCart className="mr-2 rtl:ml-2 h-4 w-4" /> طلباتي</Link>
                  </Button>
                   <Button asChild variant="ghost" className="w-full justify-start">
                    <Link to="/change-password"><KeyRound className="mr-2 rtl:ml-2 h-4 w-4" /> تغيير كلمة المرور</Link>
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 rtl:ml-2 h-4 w-4" /> تسجيل الخروج
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المعلومات الشخصية</CardTitle>
                <CardDescription>قم بتحديث اسمك ورقم هاتفك.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="name">الاسم</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" value={currentUser.email} disabled />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                    {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* --- العمود الأيمن: قائمة الطلبات --- */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>طلباتي السابقة</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusInfo = getStatusInfo(order.status);
                      return (
                        <div key={order.id} className="p-4 border dark:border-slate-700 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className='flex-grow'>
                                <p className="font-bold">طلب #{order.id.slice(0, 8)}...</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">بتاريخ: {formatDate(order.createdAt)}</p>
                                <Badge className={`mt-2 ${statusInfo.color} ${statusInfo.textColor}`}>{statusInfo.label}</Badge>
                            </div>
                            <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                                <p className="font-semibold text-lg">{formatPrice(order.total)}</p>
                                <Button asChild variant="outline" size="sm" className="mt-2">
                                    <Link to={`/order/${order.id}`}>عرض التفاصيل</Link>
                                </Button>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                    لم تقم بأي طلبات بعد.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfilePage;
