"use client";
import { useState, useEffect } from "react";
import { CldUploadWidget } from 'next-cloudinary';
import styles from "./AdminProducts.module.css";
import "../admin.css";
import Toast from "../Toast";
import ConfirmDialog from "../ConfirmDialog";

const ALL_SCENTS = [
  'Lavender 💜', 'Rose 🌹', 'Vanilla 🤍', 'Oud 🪵', 'Musk 🌿',
  'Cinnamon 🍂', 'Apple 🍏', 'Berry 🍒', 'Coffee ☕️', 'Orange 🍊',
];

const EMPTY = { name: "", price: "", image: "", desc: "", category: "Single", inStock: true, scents: [], scentsCount: 1 };

export default function AdminProducts() {
  const [products, setProducts]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [toast, setToast]         = useState("");
  const [deleteId, setDeleteId]   = useState(null);

  const fetchProducts = async () => {
    try {
      const res  = await fetch("/api/products", { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleScent = (scent) => {
    setForm(prev => {
      const exists = prev.scents.includes(scent);
      return { ...prev, scents: exists ? prev.scents.filter(s => s !== scent) : [...prev.scents, scent] };
    });
  };

  const openAdd = () => { setEditId(null); setForm(EMPTY); setShowModal(true); };

  const openEdit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name, price: p.price, image: p.image,
      desc: p.desc || "", category: p.category === 'فردي' ? 'Single' : p.category === 'بكج' ? 'Package' : p.category, inStock: p.inStock,
      scents: p.flavors || [], scentsCount: p.scentsCount || 1,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name, 
        price: form.price, 
        desc: form.desc,
        image: form.image,
        category: form.category, 
        inStock: form.inStock,
        flavors: form.scents,
        scentsCount: form.category === 'Package' || form.category === 'بكج' ? parseInt(form.scentsCount) : 1,
      };

      const res = await fetch(
        editId ? `/api/products?id=${editId}` : "/api/products",
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setShowModal(false); setForm(EMPTY); setEditId(null); fetchProducts();
      } else { setToast("⚠️ Error saving product"); }
    } catch { setToast("⚠️ Error saving product"); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    const id = deleteId;
    setDeleteId(null);
    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      fetchProducts();
    } catch { setToast("⚠️ Error deleting product"); }
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <div className="admin-container">
        <div className="products-header">
          <h1 className="dashboard-title">Product Management 🕯️</h1>
          <button className="add-btn-lux" onClick={openAdd}>
            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i>
            Add New Product
          </button>
        </div>

        <div className="products-grid-lux">
          {products.map((p) => (
            <div key={p._id} className={`product-card-lux ${!p.inStock ? 'out-of-stock' : ''}`}>
              <div className="card-badge">
                {p.category === 'فردي' ? 'Single' : p.category === 'بكج' ? 'Package' : p.category}
              </div>
              <img src={p.image} alt={p.name} onError={(e) => e.target.src = "/placeholder.png"} />
              <div className="card-info">
                <h3>{p.name}</h3>
                <div className="card-footer">
                  <span className="price">{parseFloat(p.price).toFixed(3)} JOD</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="edit-icon" onClick={() => openEdit(p)}>
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button className="del-icon" onClick={() => setDeleteId(p._id)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-card-lux">
              <div className="modal-header">
                <h2>{editId ? '✏️ Edit Product' : '🕯️ New Product'}</h2>
                <button onClick={() => setShowModal(false)} className="close-x">×</button>
              </div>

              <form onSubmit={handleSubmit} className="lux-form">
                <div className="input-group">
                  <label>Product Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Jasmine Breeze" />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Price (JOD)</label>
                    <input type="number" step="0.001" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.000" />
                  </div>
                  <div className="input-group">
                    <label>Product Image</label>
                    <div className={styles.imageInputWrapper}>
                      <input 
                        required 
                        value={form.image} 
                        onChange={e => setForm({...form, image: e.target.value})} 
                        placeholder="Image URL" 
                        style={{ flex: 1 }}
                      />
                      <CldUploadWidget 
                        uploadPreset="ml_default"
                        onSuccess={(result) => setForm(prev => ({ ...prev, image: result.info.secure_url }))}
                      >
                        {({ open }) => (
                          <button type="button" onClick={() => open()} className={styles.uploadSmallBtn}>
                            <i className="fa-solid fa-camera"></i>
                          </button>
                        )}
                      </CldUploadWidget>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="Single">🕯️ Single Candle</option>
                      <option value="Package">🎁 Gift Package</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Stock Status</label>
                    <select value={form.inStock.toString()} onChange={e => setForm({...form, inStock: e.target.value === "true"})}>
                      <option value="true">✅ In Stock</option>
                      <option value="false">❌ Out of Stock</option>
                    </select>
                  </div>
                </div>

                {(form.category === 'Package' || form.category === 'بكج') && (
                  <div className="input-group">
                    <label>Required Scents Selection Count</label>
                    <input type="number" min="1" max="10" value={form.scentsCount} onChange={e => setForm({...form, scentsCount: e.target.value})} />
                  </div>
                )}

                <div className="input-group">
                  <label>Available Scents ({form.scents.length} selected)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {ALL_SCENTS.map(scent => {
                      const active = form.scents.includes(scent);
                      return (
                        <button 
                          key={scent} 
                          type="button" 
                          onClick={() => toggleScent(scent)} 
                          className={`${styles.scentBtn} ${active ? styles.scentBtnActive : ''}`}
                        >
                          {active && <i className="fa-solid fa-check" style={{ marginRight: '5px', fontSize: '0.7rem' }}></i>}
                          {scent}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea rows="2" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Short description..." />
                </div>

                <button type="submit" className="save-btn-lux" disabled={loading}>
                  {loading ? "Saving..." : editId ? "💾 Save Changes" : "Create Product"}
                </button>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={Boolean(deleteId)}
          message="Are you sure you want to delete this product?"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
        <Toast message={toast} onClose={() => setToast("")} />
      </div>
    </>
  );
}