// منطق حساب الأسعار (نفس القاعدة بالفرونت إند وبالسيرفر، عشان ما نصدق أرقام جاية من المتصفح)
export const DISCOUNT_THRESHOLD = 13;
export const DISCOUNT_RATE = 0.15;

// items: [{ price, qty }]
export function computeTotals({ items, deliveryFee }) {
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const beforeDiscount = totalPrice + deliveryFee;
  const hasDiscount = beforeDiscount > DISCOUNT_THRESHOLD;
  const discountAmount = hasDiscount ? beforeDiscount * DISCOUNT_RATE : 0;
  const grandTotal = beforeDiscount - discountAmount;

  return { totalPrice, deliveryFee, hasDiscount, discountAmount, grandTotal };
}

export function isValidJordanPhone(phone) {
  return /^07[789]\d{7}$/.test(phone || "");
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}
