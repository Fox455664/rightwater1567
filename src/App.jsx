// src/App.jsx (النسخة النهائية والمعدلة لكل المسارات)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- استيراد الموفرات والمكونات الأساسية ---
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Layout from '@/components/Layout'; // Layout الموقع العام
import ProtectedRoute from '@/components/ProtectedRoute'; // تأكد من أنه الإصدار الذكي الذي يحتوي على Outlet
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

// --- استيراد الهياكل (Layouts) ---
import AdminLayout from '@/components/admin/AdminLayout.jsx';
import ProfileLayout from '@/components/ProfileLayout.jsx';

// --- استيراد كل الصفحات ---
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailsPage from '@/pages/ProductDetailsPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import CartPage from '@/pages/CartPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import UserProfilePage from '@/pages/UserProfilePage';
import ChangePasswordPage from '@/pages/ChangePasswordPage.jsx';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import OrderDetailsPage from '@/pages/OrderDetailsPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import OrderManagement from '@/components/admin/OrderManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import AdminSettings from '@/components/admin/AdminSettings';
import UserManagement from '@/components/admin/UserManagement';

// --- مكونات مساعدة ---
const AnimatedPage = ({ children }) => ( <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}> {children} </motion.div> );
const NotFoundPage = () => ( /* ... الكود كما هو ... */ );

// --- المكون الرئيسي للتطبيق ---
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* ======================= الهيكل الرئيسي للموقع العام ======================= */}
            <Route path="/" element={<Layout />}>
              {/* --- 1. المسارات العامة (متاحة للجميع) --- */}
              <Route index element={<AnimatedPage><HomePage /></AnimatedPage>} />
              <Route path="products" element={<AnimatedPage><ProductsPage /></AnimatedPage>} />
              <Route path="product/:productId" element={<AnimatedPage><ProductDetailsPage /></AnimatedPage>} />
              <Route path="cart" element={<AnimatedPage><CartPage /></AnimatedPage>} />
              <Route path="about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
              <Route path="contact" element={<AnimatedPage><ContactPage /></AnimatedPage>} />
              <Route path="login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
              <Route path="signup" element={<AnimatedPage><SignupPage /></AnimatedPage>} />
              <Route path="forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
              <Route path="order-success/:orderId" element={<AnimatedPage><OrderSuccessPage /></AnimatedPage>} />

              {/* --- 2. بوابة الحماية (كل ما بداخلها يتطلب تسجيل دخول) --- */}
              <Route element={<ProtectedRoute />}>
                {/* صفحات محمية تستخدم الهيكل العام */}
                <Route path="checkout" element={<AnimatedPage><CheckoutPage /></AnimatedPage>} />
                <Route path="order/:orderId" element={<AnimatedPage><OrderDetailsPage /></AnimatedPage>} />
                
                {/* قسم الملف الشخصي (يستخدم هيكله الخاص المتداخل) */}
                <Route path="profile" element={<ProfileLayout />}>
                  <Route index element={<UserProfilePage />} />
                  <Route path="orders" element={<div>هنا صفحة طلباتي</div>} />
                  <Route path="change-password" element={<ChangePasswordPage />} />
                </Route>
              </Route>

              {/* صفحة 404 يجب أن تكون آخر شيء داخل الهيكل العام */}
              <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
            </Route>
            
            {/* ======================= مسارات لوحة التحكم (منفصلة تماماً) ======================= */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/AdminDashboard" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

          </Routes>
          <Toaster />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
