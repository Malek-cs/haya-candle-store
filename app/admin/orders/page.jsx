"use client";
import { useEffect, useState } from "react";
import "../admin.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch orders from the database
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Update order status (PATCH)
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        // Optimistically update status locally
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "جديد":
        return "New";
      case "قيد التجهيز":
        return "Processing";
      case "تم التوصيل":
        return "Delivered";
      case "ملغي":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (loading) return <div className="admin-loading">Loading orders... 📦</div>;

  return (
    <div className="dashboard-content">
      <h1 className="dashboard-title">Orders Management 📦</h1>

      <div className="orders-container">
        {orders.length === 0 ? (
          <p className="dashboard-empty">No orders found.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Ordered Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  {/* Customer and Contact Info */}
                  <td>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#f5d98a",
                        fontSize: "1rem",
                      }}
                    >
                      {order.name}
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <a
                        href={`tel:${order.phone}`}
                        style={{
                          color: "#d4af37",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        📞 {order.phone}
                      </a>
                    </div>
                    <small
                      style={{
                        color: "#999",
                        display: "block",
                        marginTop: "6px",
                      }}
                    >
                      📍 {order.zone || "Unspecified Area"}
                    </small>
                  </td>

                  {/* Cart Details */}
                  <td style={{ minWidth: "220px" }}>
                    {order.cart &&
                      order.cart.map((item, idx) => {
                        const scent =
                          item.selectedScent ||
                          (item.product && item.product.selectedScent) ||
                          item.scent;

                        return (
                          <div
                            key={idx}
                            style={{
                              padding: "10px 0",
                              borderBottom:
                                idx !== order.cart.length - 1
                                  ? "1px solid #333"
                                  : "none",
                            }}
                          >
                            <div
                              style={{ color: "#fff", marginBottom: "2px" }}
                            >
                              <span
                                style={{
                                  color: "#c8861e",
                                  fontWeight: "bold",
                                }}
                              >
                                x{item.qty}
                              </span>{" "}
                              {item.product?.name || item.name}
                            </div>
                            <small
                              style={{
                                color: "#d4af37",
                                fontStyle: "italic",
                                fontSize: "0.8rem",
                              }}
                            >
                              🌸 {scent ? scent : "No scent specified"}
                            </small>
                          </div>
                        );
                      })}
                  </td>

                  {/* Grand Total */}
                  <td
                    style={{
                      fontWeight: "bold",
                      color: "#f0c060",
                      fontSize: "1rem",
                    }}
                  >
                    {parseFloat(order.grandTotal || 0).toFixed(3)} JOD
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span
                      className={`status-badge ${order.status}`}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        background:
                          order.status === "جديد" || order.status === "New"
                            ? "#c8861e22"
                            : "#4ade8022",
                        color:
                          order.status === "جديد" || order.status === "New"
                            ? "#f5d98a"
                            : "#4ade80",
                        border: `1px solid ${
                          order.status === "جديد" || order.status === "New"
                            ? "#c8861e"
                            : "#4ade80"
                        }`,
                      }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>

                  {/* Action Selector */}
                  <td>
                    <select
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      value={order.status}
                      className="status-select"
                      style={{
                        background: "#1a1208",
                        color: "#f5d98a",
                        border: "1px solid #d4af37",
                        padding: "8px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      <option value="جديد">New</option>
                      <option value="قيد التجهيز">Processing</option>
                      <option value="تم التوصيل">Delivered</option>
                      <option value="ملغي">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}