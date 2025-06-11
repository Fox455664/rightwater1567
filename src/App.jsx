// src/App.jsx (النسخة النهائية والمعدلة لكل المسارات)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- استيراد الموفرات والمكونات الأساسية ---
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Layout from '@/components/Layout'; // Layout الموقع العام
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

// --- استيراد الهياكل (Layouts) ---
import AdminLayout from '@/components/admin/AdminLayout.jsx';
import ProfileLayout from '@/components/ProfileLayout.jsx'; // <<<-- 1. استيراد هيكل الملف الشخصي

// --- استيراد صفحات الموقع ---
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
import OrderDetailsPage from '@/pages/OrderDetailsPage'; // صفحة تفاصيل الطلب للمستخدم

// --- استيراد صفحات لوحة التحكم ---
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import OrderManagement from '@/components/admin/OrderManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import AdminSettings from '@/components/admin/AdminSettings';
import UserManagement from '@/components/admin/UserManagement';

// --- مكونات مساعدة ---
const AnimatedPage = ({ children }) => ( <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}> {children} </motion.div> );
const NotFoundPage = () => (
  <div className="text-center py-20 flex flex-col items-center">
    <motion.h1 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring' }} className="text-6xl font-bold text-primary mb-4">404</motion.h1>
    <p className="text-2xl text-foreground mb-8">عفواً، الصفحة التي تبحث عنها غير موجودة.</p>
    <motion.img initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} alt="شخص تائه" className="mx-auto w-full max-w-sm mb-8 rounded-lg shadow-lg" src="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b" />
    <Link to="/"><Button size="lg">العودة إلى الصفحة الرئيسية</Button></Link>
  </div>
);

// --- المكون الرئيسي للتطبيق ---
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* ======================= المسارات العامة ======================= */}
            <Route path="/" element={<Layout />}>
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

              {/* ========= 2. مسارات محمية ومنفصلة (الدفع وتفاصيل الطلب) ========= */}
              <Route element={<ProtectedRoute />}>
                 <Route path="checkout" element={<AnimatedPage><CheckoutPage /></AnimatedPage>} />
                 <Route path="order/:orderId" element={<AnimatedPage><OrderDetailsPage /></AnimatedPage>} />
              </Route>
              
              {/* ========= 3. مسارات الملف الشخصي المتداخلة (محمية وتستخدم هيكلها الخاص) ========= */}
              <Route path="/profile" element={<ProtectedRoute><ProfileLayout /></ProtectedRoute>}>
                 <Route index element={<UserProfilePage />} />
                 <Route path="orders" element={<div>هنا صفحة طلباتي</div>} /> {/* استبدل هذا بمكون طلبات المستخدم */}
                 <Route path="change-password" element={<ChangePasswordPage />} />
              </Route>

              <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
            </Route>
            
            {/* ======================= مسارات لوحة التحكم ======================= */}
            <Route path="/AdminDashboard" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
// Re-deploy trigger
