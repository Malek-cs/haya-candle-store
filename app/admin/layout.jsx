"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import "./admin.css";
import ConfirmDialog from "./ConfirmDialog";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // دالة تسجيل الخروج: تمسح كوكي الجلسة من السيرفر (httpOnly، ما فيها تنمسح من الفرونت إند مباشرة)
  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin";
  };

  // إذا كنا في صفحة اللوجن، اعرضها مباشرة بدون السايدبار
  // (التحقق من الصلاحيات صار عبر middleware.js قبل ما توصل الصفحة أصلاً)
  if (pathname === "/admin") return <>{children}</>;

  const navItems = [
    { href: "/admin/dashboard", label: "الرئيسية", icon: "📊" },
    { href: "/admin/products", label: "المنتجات", icon: "🕯️" },
    { href: "/admin/orders", label: "الطلبات", icon: "📦" },
  ];

  return (
    <div className="admin-app">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span style={{ fontSize: "2rem" }}>🕯️</span>
          <h2>Haya Store</h2>
          <p>لوحة الإدارة</p>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${pathname === item.href ? "admin-nav-active" : ""}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* زر تسجيل الخروج صار شغال 100% */}
        <button className="admin-logout-btn" onClick={() => setShowLogoutConfirm(true)}>
          🚪 تسجيل الخروج
        </button>
      </aside>

      {/* MAIN */}
      <main className="admin-main">{children}</main>

      <ConfirmDialog
        open={showLogoutConfirm}
        message="هل أنت متأكد من تسجيل الخروج؟"
        confirmLabel="تسجيل الخروج"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}