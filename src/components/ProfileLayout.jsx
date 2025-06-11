// src/components/auth/ProtectedRoute.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * مكون حماية المسارات الذي يعتمد كلياً على AuthContext كمصدر وحيد للحقيقة.
 * @param {object} props
 * @param {React.ReactNode} props.children - المكون الذي سيتم عرضه إذا تم التحقق بنجاح.
 * @param {boolean} [props.adminOnly=false] - هل هذا المسار مخصص للأدمن فقط؟
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  // --- الخطوة 1: استدعاء كل ما نحتاجه من مصدر الحقيقة الوحيد ---
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  // --- الخطوة 2: حالة تحميل واحدة فقط، قادمة من الـ Context ---
  // لا يوجد داعي لوجود checkingAdmin بعد الآن.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 rtl:mr-4 text-xl text-foreground">جاري التحقق من صلاحيات الدخول...</p>
      </div>
    );
  }

  // --- الخطوة 3: التحقق من وجود مستخدم مسجل ---
  // إذا لم يكن هناك مستخدم، يتم توجيهه لصفحة الدخول مع حفظ الصفحة الحالية للعودة إليها.
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // --- الخطوة 4: التحقق من صلاحيات الأدمن (إذا كان المسار يتطلب ذلك) ---
  // نعتمد على `isAdmin` من الـ Context مباشرةً.
  if (adminOnly && !isAdmin) {
    // إذا كان المستخدم ليس أدمن ويحاول الوصول لصفحة أدمن، يتم توجيهه للصفحة الرئيسية.
    return <Navigate to="/" replace />;
  }

  // --- إذا نجحت كل الاختبارات، يتم عرض المكون المحمي ---
  return <>{children}</>;
};

export default ProtectedRoute;
