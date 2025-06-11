// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/firebase';
import { collection, addDoc, Timestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Lock, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

// دالة التحقق من صحة المدخلات
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

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: '', paymentMethod: 'cod'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setIsLoadingData(true);
    const source = location.state;

    if (source?.cartItems?.length && source.fromCart) {
      setCartItems(source.cartItems);
      setSubtotal(source.subtotal || 0);
      setShippingCost(source.shippingCost || 0);
      setTotal(source.total || 0);
    } else {
      toast({
        title: "سلة التسوق فارغة",
        description: "يتم توجيهك لصفحة المنتجات.",
        duration: 3000,
      });
      setTimeout(() => navigate('/products'), 1500);
    }
    setIsLoadingData(false);
  }, [location.state, navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({
        title: "بيانات غير مكتملة أو غير صحيحة",
        description: "يرجى مراجعة الحقول التي تحتوي على أخطاء.",
        variant: "destructive",
      });
      return;
    }

    if (!cartItems.length) {
      toast({ title: "السلة فارغة", variant: "destructive" });
      return navigate('/products');
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        userId: currentUser ? currentUser.uid : null,
        shipping: {
          fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: 'Egypt'
        },
        userEmail: formData.email,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.image || null
        })),
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      for (const item of cartItems) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const currentStock = productSnap.data().stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          await updateDoc(productRef, { stock: newStock });
        }
      }

      const orderItemsHtml = cartItems.map(item => `
        <tr>
          <td style="padding:8px; border:1px solid #ddd;">${item.name}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.quantity}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:right;">
            ${(item.price * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
          </td>
        </tr>
      `).join('');
      
      const baseEmailParams = {
        to_name: `${formData.firstName} ${formData.lastName}`,
        order_id: docRef.id,
        order_subtotal: subtotal.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' }),
        order_shipping_cost: shippingCost.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' }),
        order_total: total.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' }),
        order_address: `${formData.address}, ${formData.city}, ${formData.postalCode}, مصر`,
        order_items_html: orderItemsHtml,
        customer_phone: formData.phone,
        payment_method: formData.paymentMethod === 'cod' ? "الدفع عند الاستلام" : formData.paymentMethod,
      };

      try {
          const clientParams = { ...baseEmailParams, to_email: formData.email, reply_to: "rightwater156@gmail.com" };
          await emailjs.send('service_0p2k5ih', 'template_bu792mf', clientParams, 'xpSKf6d4h11LzEOLz');
      } catch (emailError) {
          console.error("فشل إرسال إيميل العميل:", emailError);
      }

      try {
          const merchantParams = { ...baseEmailParams, to_email: "rightwater156@gmail.com", client_email: formData.email, reply_to: formData.email };
          await emailjs.send('service_0p2k5ih', 'template_tboeo2t', merchantParams, 'xpSKf6d4h11LzEOLz');
      } catch (emailError) {
          console.error("فشل إرسال إيميل التاجر:", emailError);
      }

      clearCart();
      toast({
        title: "🎉 تم إرسال طلبك بنجاح!",
        description: `شكراً لك. رقم طلبك هو: ${docRef.id}`,
        className: "bg-green-500 text-white",
        duration: 7000,
      });

      const createdOrder = { id: docRef.id, ...orderData };
      navigate(`/order-success/${docRef.id}`, {
        state: { orderData: createdOrder }
      });

    } catch (error) {
      console.error("Error placing order: ", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إتمام طلبك. يرجى المحاولة لاحقاً.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تجهيز صفحة الدفع...</p>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="mx-auto h-20 w-20 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">سلة التسوق فارغة</h2>
        <Button onClick={() => navigate('/products')}><ArrowRight className="ml-2" /> العودة للمنتجات</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-center mb-8 text-primary"
      >
        إتمام عملية الدفع
      </motion.h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6 bg-card p-6 rounded-xl shadow-xl"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="firstName">الاسم الأول</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className={formErrors.firstName ? 'border-red-500' : ''} />
                {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
            </div>
            <div>
                <Label htmlFor="lastName">الاسم الأخير</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className={formErrors.lastName ? 'border-red-500' : ''} />
                {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
            </div>
            <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={formErrors.email ? 'border-red-500' : ''} />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>
            <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className={formErrors.phone ? 'border-red-500' : ''} />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="address">العنوان</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} required className={formErrors.address ? 'border-red-500' : ''} />
                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
            </div>
            <div>
                <Label htmlFor="city">المدينة</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} required className={formErrors.city ? 'border-red-500' : ''} />
                {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
            </div>
            <div>
                <Label htmlFor="postalCode">الرمز البريدي</Label>
                <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} required className={formErrors.postalCode ? 'border-red-500' : ''} />
                {formErrors.postalCode && <p className="text-red-500 text-xs mt-1">{formErrors.postalCode}</p>}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">طريقة الدفع</Label>
            <Label className="flex items-center gap-2 cursor-pointer"><Input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} />الدفع عند الاستلام</Label>
          </div>
          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            {isSubmitting ? "جاري تنفيذ الطلب..." : "تأكيد الطلب"}
          </Button>
        </motion.form>
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="sticky top-24"
        >
          <Card className="p-6 shadow-xl rounded-xl bg-card">
              <CardHeader className="p-0 mb-4"><CardTitle className="text-center text-lg font-semibold text-primary">ملخص الطلب</CardTitle></CardHeader>
              <CardContent className="p-0">
                  <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-3">
                      {cartItems.map(item => (
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
                      <div className="flex justify-between text-muted-foreground"><span>المجموع الفرعي:</span><span>{subtotal.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>
                      {shippingCost > 0 && (<div className="flex justify-between text-muted-foreground"><span>تكلفة الشحن:</span><span>{shippingCost.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>)}
                      <div className="flex justify-between pt-2 border-t font-semibold text-lg"><span>الإجمالي الكلي:</span><span>{total.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>
                  </div>
              </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
