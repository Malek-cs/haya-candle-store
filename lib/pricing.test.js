import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTotals, isValidJordanPhone, escapeHtml } from "./pricing.js";

test("computeTotals: no discount below threshold", () => {
  const totals = computeTotals({ items: [{ price: 2, qty: 2 }], deliveryFee: 1 });
  assert.equal(totals.totalPrice, 4);
  assert.equal(totals.hasDiscount, false);
  assert.equal(totals.discountAmount, 0);
  assert.equal(totals.grandTotal, 5);
});

test("computeTotals: applies 15% discount above threshold", () => {
  const totals = computeTotals({ items: [{ price: 10, qty: 2 }], deliveryFee: 2 });
  // beforeDiscount = 22, threshold = 13, so discount applies
  assert.equal(totals.totalPrice, 20);
  assert.equal(totals.hasDiscount, true);
  assert.equal(totals.discountAmount, 22 * 0.15);
  assert.equal(totals.grandTotal, 22 - 22 * 0.15);
});

test("computeTotals: exactly at threshold does not trigger discount", () => {
  const totals = computeTotals({ items: [{ price: 13, qty: 1 }], deliveryFee: 0 });
  assert.equal(totals.hasDiscount, false);
});

test("isValidJordanPhone accepts valid Zain/Orange/Umniah prefixes", () => {
  assert.equal(isValidJordanPhone("0791234567"), true);
  assert.equal(isValidJordanPhone("0771234567"), true);
  assert.equal(isValidJordanPhone("0781234567"), true);
});

test("isValidJordanPhone rejects invalid numbers", () => {
  assert.equal(isValidJordanPhone("123456"), false);
  assert.equal(isValidJordanPhone("0721234567"), false);
  assert.equal(isValidJordanPhone(""), false);
  assert.equal(isValidJordanPhone(undefined), false);
});

test("escapeHtml neutralizes HTML-special characters", () => {
  assert.equal(escapeHtml('<script>alert("x")</script>'), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  assert.equal(escapeHtml("a & b"), "a &amp; b");
  assert.equal(escapeHtml(null), "");
});
