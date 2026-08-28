"use client";

export default function ConfirmDialog({ open, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card-lux"
        style={{ maxWidth: "360px", textAlign: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ color: "var(--admin-text)", marginBottom: "24px", fontSize: "0.95rem" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="btn-danger"
            style={{ flex: 1, padding: "12px" }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px",
              background: "var(--admin-surface2)",
              color: "var(--admin-text)",
              border: "1px solid var(--admin-border2)",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
