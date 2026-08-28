"use client";
import { useEffect, useState } from "react";
import "../admin.css"; 

export default function DashboardPage() {
  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Fetch products count
        const resProd = await fetch("/api/products");
        const dataProd = await resProd.json();
        setProductsCount(Array.isArray(dataProd) ? dataProd.length : 0);

        // 2. Fetch orders
        const resOrders = await fetch("/api/orders"); 
        const dataOrders = await resOrders.json();
        setOrders(Array.isArray(dataOrders) ? dataOrders : []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Calculate stats from live data
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalPrice || o.grandTotal) || 0), 0);
  const newOrdersCount = orders.filter(o => o.status === "new" || o.status === "جديد" || o.status === "New").length;

  const statusMap = {
    new: { label: "New", className: "badge-new" },
    جديد: { label: "New", className: "badge-new" },
    New: { label: "New", className: "badge-new" },
    pending: { label: "Processing", className: "badge-pending" },
    "قيد التجهيز": { label: "Processing", className: "badge-pending" },
    Processing: { label: "Processing", className: "badge-pending" },
    done: { label: "Delivered", className: "badge-done" },
    "تم التوصيل": { label: "Delivered", className: "badge-done" },
    Delivered: { label: "Delivered", className: "badge-done" },
    cancelled: { label: "Cancelled", className: "badge-cancelled" },
    "ملغي": { label: "Cancelled", className: "badge-cancelled" },
    Cancelled: { label: "Cancelled", className: "badge-cancelled" },
  };

  if (loading) return <div className="admin-loading">Updating dashboard analytics... 🕯️</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-topbar">
        <h1 className="dashboard-title">Dashboard</h1>
      </div>
      <div className="dashboard-content">

        {/* STATS */}
        <div className="dashboard-grid">
          <StatCard icon="🕯️" label="Total Products" value={productsCount} sub="items in store" />
          <StatCard icon="📦" label="New Orders" value={newOrdersCount} sub="awaiting dispatch" />
          <StatCard icon="✅" label="Total Orders" value={orders.length} sub="all-time orders" />
          <StatCard icon="💰" label="Total Revenue" value={totalRevenue.toFixed(3)} sub="JOD" />
        </div>

        {/* LATEST ORDERS */}
        <h2 className="dashboard-section-title">Recent Orders</h2>
        <div className="dashboard-card">
          {orders.slice(0, 5).map(o => {
            const s = statusMap[o.status] || statusMap.new;
            return (
              <div key={o._id} className="order-row">
                <div>
                  <div className="order-name">{o.name || o.customerName || o.customer?.fullName || "Guest Customer"}</div>
                  <div className="order-sub">{o.productName || (o.cart && o.cart.length ? `${o.cart.length} item(s)` : "Store Order")}</div>
                </div>
                <div className="order-actions">
                  <span className="order-price">{(parseFloat(o.totalPrice || o.grandTotal) || 0).toFixed(3)} JOD</span>
                  <span className={`order-badge ${s.className}`}>{s.label}</span>
                </div>
              </div>
            );
          })}
          {orders.length === 0 && <p className="dashboard-empty">No orders found in the database yet.</p>}
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}