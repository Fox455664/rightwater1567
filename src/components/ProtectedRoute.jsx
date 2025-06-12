// في ملف App.jsx

// ...

// --- الحالة الأولى: حماية صفحة واحدة (يعمل كغلاف) ---
<Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />


// --- الحالة الثانية: حماية قسم كامل (يعمل كهيكل) ---
// لاحظ أننا لم نعد نمرر AdminLayout كـ children
<Route path="/AdminDashboard" element={<ProtectedRoute adminOnly={true} />}>
    <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<ProductManagement />} />
        {/* ... باقي مسارات الأدمن ... */}
    </Route>
</Route>

// ...
