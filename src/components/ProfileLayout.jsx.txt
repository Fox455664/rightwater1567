// src/components/ProfileLayout.jsx

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { User, List, Lock } from 'lucide-react';

const ProfileLayout = () => {
  const navLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 rounded-lg transition-colors text-slate-700 dark:text-slate-300 ${
      isActive
        ? 'bg-slate-200 dark:bg-slate-700 font-semibold'
        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* الشريط الجانبي للملف الشخصي */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">لوحة التحكم</h2>
          <nav className="flex flex-col gap-2">
            <NavLink to="/profile" end className={navLinkClass}>
              <User className="mr-3 rtl:ml-3" size={20} /> الملف الشخصي
            </NavLink>
            <NavLink to="/profile/orders" className={navLinkClass}>
              <List className="mr-3 rtl:ml-3" size={20} /> طلباتي
            </NavLink>
            <NavLink to="/profile/change-password" className={navLinkClass}>
              <Lock className="mr-3 rtl:ml-3" size={20} /> تغيير كلمة المرور
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* المحتوى الرئيسي المتغير */}
      <main className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        {/* هنا سيتم عرض صفحات الملف الشخصي الفرعية */}
        <Outlet />
      </main>
    </div>
  );
};

export default ProfileLayout;
