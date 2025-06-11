// src/pages/SignupPage.jsx (النسخة النهائية مع خانة الشروط والأحكام)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { UserPlus, Mail, KeyRound, User as UserIcon } from 'lucide-react';

// --- استيراد الـ Checkbox واللينك ---
import { Checkbox } from "@/components/ui/checkbox"; // <<<--- 1. استيراد مكون الـ Checkbox

import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

const SignupPage = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false); // <<<--- 2. إضافة حالة للـ Checkbox
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e) => {
    e.preventDefault();

    // <<<--- 3. التحقق من الموافقة على الشروط أولاً ---
    if (!agreedToTerms) {
      toast({
        title: "الموافقة على الشروط",
        description: "يجب عليك الموافقة على الشروط والأحكام للمتابعة.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({ title: "كلمة المرور ضعيفة", description: "يجب أن تكون 6 أحرف على الأقل.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "خطأ في كلمة المرور", description: "كلمتا المرور غير متطابقتين.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: displayName,
        email: email,
        createdAt: Timestamp.now(),
        role: 'user'
      });
      toast({ title: "تم إنشاء الحساب بنجاح!", description: `مرحباً بك ${displayName || email}!` });
      navigate('/');
    } catch (error) {
      let errorMessage = "حدث خطأ غير متوقع.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "هذا البريد الإلكتروني مسجل بالفعل. حاول تسجيل الدخول.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "البريد الإلكتروني الذي أدخلته غير صالح.";
      }
      toast({ title: "فشل إنشاء الحساب", description: errorMessage, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-water-blue/10 to-water-green/5 p-4"
    >
      <Card className="w-full max-w-md shadow-2xl glassmorphism-card">
        <CardHeader className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }} className="mx-auto bg-gradient-to-r from-primary to-secondary text-white rounded-full p-3 w-fit mb-4">
            <UserPlus size={32} />
          </motion.div>
          <CardTitle className="text-3xl font-bold text-primary">إنشاء حساب جديد</CardTitle>
          <CardDescription>انضم إلينا للاستمتاع بأفضل حلول المياه النقية.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {/* ... حقول الاسم والإيميل وكلمة المرور كما هي ... */}
            <div className="space-y-1">
              <Label htmlFor="displayName">الاسم الكامل</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="displayName" type="text" placeholder="مثال: أحمد محمد" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="6 أحرف على الأقل" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            
            {/* <<<--- 4. إضافة خانة الموافقة على الشروط هنا --- */}
            <div className="items-top flex space-x-2 space-x-reverse pt-2">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms} 
                onCheckedChange={setAgreedToTerms}
                aria-label="الموافقة على الشروط والأحكام"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  أوافق على
                  <Link to="/terms-conditions" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80 mx-1">
                    الشروط والأحكام
                  </Link>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg" disabled={loading}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              سجل الدخول
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SignupPage;
