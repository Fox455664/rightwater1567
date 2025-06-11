// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- استيراد الموفرات (Providers) والمكونات الأساسية ---
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

// --- استيراد صفحات الموقع العامة ---
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailsPage from '@/pages/ProductDetailsPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import CartPage from '@/pages/CartPage';

// --- استيراد صفحات المصادقة والمستخدم ---
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import UserProfilePage from '@/pages/UserProfilePage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';

// --- استيراد صفحات عملية الشراء ---
import CheckoutPage from '@/pages/CheckoutPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import OrderDetailsPage from '@/pages/OrderDetailsPage';

// --- استيراد صفحات ومكونات لوحة التحكم ---
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import OrderManagement from '@/components/admin/OrderManagement';
import OrderDetailsView from '@/components/admin/OrderDetailsView';
import ProductManagement from '@/components/admin/ProductManagement';
import AdminSettings from '@/components/admin/AdminSettings';

// --- مكونات مساعدة (Helper Components) ---
const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const NotFoundPage = () => (
  <div className="text-center py-20 flex flex-col items-center">
    <motion.h1 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring' }}
      className="text-6xl font-bold text-primary mb-4"
    >
      404
    </motion.h1>
    <p className="text-2xl text-foreground mb-8">عفواً، الصفحة التي تبحث عنها غير موجودة.</p>
    <motion.img
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      alt="شخص تائه"
      className="mx-auto w-full max-w-sm mb-8 rounded-lg shadow-lg"
      src="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b"
    />
    <Link to="/">
      <Button size="lg">العودة إلى الصفحة الرئيسية</Button>
    </Link>
  </div>
);

// --- المكون الرئيسي للتطبيق ---
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* المسار الرئيسي الذي يحتوي على الـ Layout (لكل الصفحات) */}
            <Route path="/" element={<Layout />}>
              {/* --- الصفحات العامة المتاحة للجميع --- */}
              <Route index element={<AnimatedPage><HomePage /></AnimatedPage>} />
              <Route path="products" element={<AnimatedPage><ProductsPage /></AnimatedPage>} />
              <Route path="product/:productId" element={<AnimatedPage><ProductDetailsPage /></AnimatedPage>} />
              <Route path="cart" element={<AnimatedPage><CartPage /></AnimatedPage>} />
              <Route path="about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
              <Route path="contact" element={<AnimatedPage><ContactPage /></AnimatedPage>} />
              <Route path="login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
              <Route path="signup" element={<AnimatedPage><SignupPage /></AnimatedPage>} />
              <Route path="forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />

              {/* --- مسارات محمية تتطلب تسجيل الدخول --- */}
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<AnimatedPage><UserProfilePage /></AnimatedPage>} />
                <Route path="change-password" element={<AnimatedPage><ChangePasswordPage /></AnimatedPage>} />
                <Route path="checkout" element={<AnimatedPage><CheckoutPage /></AnimatedPage>} />
                <Route path="order-success/:orderId" element={<AnimatedPage><OrderSuccessPage /></AnimatedPage>} />
                <Route path="order/:orderId" element={<AnimatedPage><OrderDetailsPage /></AnimatedPage>} />
              </Route>

              {/* --- مسار لوحة التحكم المحمي للمسؤولين فقط --- */}
              {/* ملاحظة: مسار لوحة التحكم نفسه محمي، وكل ما بداخله محمي تلقائياً */}
              <Route path="AdminDashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>}>
                  <Route index element={<OrderManagement />} /> {/* يعرض الطلبات كصفحة افتراضية */}
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="orders/:orderId" element={<OrderDetailsView />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* مسار الصفحة غير الموجودة (يجب أن يكون الأخير) */}
              <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
