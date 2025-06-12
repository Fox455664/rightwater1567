// src/pages/CheckoutPage.jsx (النسخة النهائية والمعدّلة)

import React, { useState, useEffect } from 'react';
// استخدام next/navigation بدلاً من react-router-dom إذا كان المشروع Next.js
// سأبقيها react-router-dom كما في الكود الأصلي
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { 
    db, 
    collection, 
    addDoc, 
    Timestamp, 
    doc, 
    updateDoc, 
    increment // <-- 🔥🔥🔥 تم استيراد increment 🔥🔥🔥
} from '@/firebase';
import emailjs from '@emailjs/browser'; // تأكد من أن هذه المكتبة مثبتة ومهيأة
import { useCart } from '@/contexts/CartContext';
import { Loader2, Lock, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

// دالة التحقق من صحة المدخلات (تبقى كما هي)
const validateForm = (formData) => {
  const errors = {};
  if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(formData.firstName.trim())) errors.firstName = "الاسم الأول يجب أن يحتوي على حروف فقط.";
  if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(formData.lastName.trim())) errors.lastName = "الاسم الأخير يجب أن يحتوي على حروف فقط.";
  if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "صيغة البريد الإلكتروني غير صحيحة.";
  if (!/^01[0-2,5]\d{8}$/.test(formData.phone)) errors.phone = "رقم الهاتف المصري يجب أن يكون 11 رقماً ويبدأ بـ 010, 011, 012, أو 015.";
  if (formData.address.trim().length < 10) errors.address = "العنوان يجب ألا يقل عن 10 أحرف.";
  if (formData.city.trim().length < 3) errors.city = "اسم المدينة يجب ألا يقل عن 3 أحرف.";
  if (!/^\d{5,9}$/.test(formData.postalCode)) errors.postalCode = "الرمز البريدي يجب أن يكون من 5 إلى 9 أرقام.";
  return errors;
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const { currentUser } = useAuth();

  const [cartData, setCartData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: '', paymentMethod: 'cod'
  });
  const [formErrors, setFormErrors] = useState({});

  // التأكد من البيانات عند تحميل الصفحة (يبقى كما هو)
  useEffect(() => {
    const sourceState = location.state;
    if (sourceState && sourceState.fromCart && sourceState.cartItems?.length > 0) {
      setCartData(sourceState);
    } else {
      toast({
        title: "خطأ في الوصول",
        description: "يجب الوصول لهذه الصفحة من خلال سلة التسوق.",
        variant: "destructive",
      });
      navigate('/cart');
    }
  }, [location.state, navigate, toast]);
  
  // تحديث بيانات الفورم تلقائيا عند توفر بيانات المستخدم (يبقى كما هو)
  useEffect(() => {
    if (currentUser) {
        const nameParts = currentUser.displayName?.split(' ') || ['', ''];
        setFormData(prev => ({
            ...prev,
            email: currentUser.email || '',
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
        }));
    }
  }, [currentUser]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cartData) return;

    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({ title: "بيانات غير مكتملة", description: "يرجى مراجعة الحقول.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const orderData = {
        userId: currentUser ? currentUser.uid : null,
        shipping: { fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`, phone: formData.phone, address: formData.address, city: formData.city, postalCode: formData.postalCode, country: 'Egypt' },
        userEmail: formData.email,
        items: cartData.cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price, imageUrl: item.image || null })),
        subtotal: cartData.subtotal,
        shippingCost: cartData.shippingCost,
        total: cartData.total,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        createdAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // 🔥🔥🔥 --- بداية الإصلاح الجذري لمنطق تحديث المخزون --- 🔥🔥🔥
      const stockUpdatePromises = cartData.cartItems.map(item => {
        const productRef = doc(db, "products", item.id);
        // نستخدم increment لضمان عملية طرح ذرية وآمنة من المخزون
        // هذا يمنع تماماً حدوث "حالة السباق"
        return updateDoc(productRef, { 
            stock: increment(-item.quantity) 
        });
      });
      
      // ننتظر اكتمال جميع عمليات تحديث المخزون
      await Promise.all(stockUpdatePromises);
      // 🔥🔥🔥 --- نهاية الإصلاح الجذري --- 🔥🔥🔥
      
      // كود إرسال الإيميلات (يبقى كما هو، تأكد من صحة بياناتك)
      /*
      emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY')
        .then((response) => {
          console.log('SUCCESS!', response.status, response.text);
        }, (err) => {
          console.log('FAILED...', err);
        });
      */

      clearCart();
      toast({ title: "🎉 تم إرسال طلبك بنجاح!", description: `رقم طلبك هو: ${docRef.id}`, className: "bg-green-500 text-white", duration: 7000, });
      navigate(`/order-success/${docRef.id}`, { state: { orderData: { id: docRef.id, ...orderData } } });

    } catch (error) {
      console.error("Error placing order: ", error);
      toast({ title: "حدث خطأ", description: "لم نتمكن من إتمام طلبك. قد يكون هناك مشكلة في المخزون.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cartData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري التحقق من السلة...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold text-center mb-8 text-primary">إتمام عملية الدفع</motion.h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6 bg-card p-6 rounded-xl shadow-xl">
           <div className="grid md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="firstName">الاسم الأول</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className={formErrors.firstName ? 'border-destructive' : ''} />
                {formErrors.firstName && <p className="text-destructive text-xs mt-1">{formErrors.firstName}</p>}
            </div>
            <div>
                <Label htmlFor="lastName">الاسم الأخير</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className={formErrors.lastName ? 'border-destructive' : ''} />
                {formErrors.lastName && <p className="text-destructive text-xs mt-1">{formErrors.lastName}</p>}
            </div>
            <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={formErrors.email ? 'border-destructive' : ''} />
                {formErrors.email && <p className="text-destructive text-xs mt-1">{formErrors.email}</p>}
            </div>
            <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className={formErrors.phone ? 'border-destructive' : ''} />
                {formErrors.phone && <p className="text-destructive text-xs mt-1">{formErrors.phone}</p>}
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="address">العنوان</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} required className={formErrors.address ? 'border-destructive' : ''} />
                {formErrors.address && <p className="text-destructive text-xs mt-1">{formErrors.address}</p>}
            </div>
            <div>
                <Label htmlFor="city">المدينة</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} required className={formErrors.city ? 'border-destructive' : ''} />
                {formErrors.city && <p className="text-destructive text-xs mt-1">{formErrors.city}</p>}
            </div>
            <div>
                <Label htmlFor="postalCode">الرمز البريدي</Label>
                <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} required className={formErrors.postalCode ? 'border-destructive' : ''} />
                {formErrors.postalCode && <p className="text-destructive text-xs mt-1">{formErrors.postalCode}</p>}
            </div>
          </div>
          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            {isSubmitting ? "جاري تنفيذ الطلب..." : "تأكيد الطلب"}
          </Button>
        </motion.form>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24">
          <Card className="p-6 shadow-xl rounded-xl bg-card">
             <CardHeader className="p-0 mb-4"><CardTitle className="text-center text-lg font-semibold text-primary">ملخص الطلب</CardTitle></CardHeader>
              <CardContent className="p-0">
                  <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-3">
                      {cartData.cartItems.map(item => (
                          <div key={item.id} className="flex justify-between items-center border-b pb-2">
                              <div className="text-sm">
                                  <p className="font-semibold">{item.name}</p>
                                  <p className="text-muted-foreground">الكمية: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-medium">{(item.price * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
                          </div>
                      ))}
                  </div>
                  <div className="pt-3 border-t space-y-2">
                      <div className="flex justify-between text-muted-foreground"><span>المجموع الفرعي:</span><span>{cartData.subtotal.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>
                      {cartData.shippingCost > 0 && (<div className="flex justify-between text-muted-foreground"><span>تكلفة الشحن:</span><span>{cartData.shippingCost.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>)}
                      <div className="flex justify-between pt-2 border-t font-semibold text-lg"><span>الإجمالي الكلي:</span><span>{cartData.total.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>
                  </div>
              </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
