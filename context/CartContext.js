'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { computeTotals, DISCOUNT_THRESHOLD, DISCOUNT_RATE } from '@/lib/pricing'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'haya_cart'

// unique key per product+scent combo
const itemKey = (product) => `${product.id || product._id}__${product.selectedScent || ''}`

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isCartLoaded, setIsCartLoaded] = useState(false)

  // تحميل السلة المحفوظة من المتصفح عند فتح الموقع (عشان ما تروح الكمية بالريفرش)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      if (saved) setCart(JSON.parse(saved))
    } catch {
      // localStorage غير متاح أو البيانات تالفة - نتجاهل ونبدأ بسلة فارغة
    }
    setIsCartLoaded(true)
  }, [])

  // حفظ أي تغيير على السلة، بس بعد ما ننتهي من التحميل الأولي
  // (عشان ما نكتب فوق السلة المحفوظة بمصفوفة فارغة قبل ما تنحمل)
  useEffect(() => {
    if (!isCartLoaded) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // تجاهل (مثلاً وضع تصفح خفي بيرفض localStorage)
    }
  }, [cart, isCartLoaded])

  // 👈 إضافة حالة لتخزين المناطق القادمة من الداتا بيس
  const [deliveryZones, setDeliveryZones] = useState([])
  const [selectedZone, setSelectedZone] = useState(null)

  // 👈 كود جلب المناطق من الـ API
  useEffect(() => {
    async function fetchZones() {
      try {
        const res = await fetch('/api/delivery')
        const data = await res.json()
        if (Array.isArray(data)) {
          setDeliveryZones(data)
        }
      } catch (err) {
        console.error("Failed to fetch delivery zones:", err)
      }
    }
    fetchZones()
  }, [])

  const addToCart = (product) => {
    const key = itemKey(product)
    setCart((prev) => {
      const existing = prev.find((i) => itemKey(i.product) === key)
      if (existing)
        return prev.map((i) => itemKey(i.product) === key ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, qty: 1 }]
    })
  }

  const removeFromCart = (key) =>
    setCart((prev) => prev.filter((i) => itemKey(i.product) !== key))

  const updateQty = (key, qty) => {
    if (qty < 1) return removeFromCart(key)
    setCart((prev) => prev.map((i) => itemKey(i.product) === key ? { ...i, qty } : i))
  }

  const clearCart = () => { setCart([]); setSelectedZone(null) }

  const totalItems  = cart.reduce((s, i) => s + i.qty, 0)
  const deliveryFee = totalItems > 0 && selectedZone ? selectedZone.fee : 0

  const items = cart.map((i) => ({ price: i.product.price, qty: i.qty }))
  const totals = computeTotals({ items, deliveryFee })
  const hasDiscount    = selectedZone !== null && totals.hasDiscount
  const totalPrice     = totals.totalPrice
  const discountAmount = hasDiscount ? totals.discountAmount : 0
  const grandTotal      = totals.totalPrice + deliveryFee - discountAmount

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      itemKey,
      totalItems, totalPrice,
      deliveryZones, // 👈 ضروري جداً نمررها هون عشان صفحة الـ Checkout تشوفها
      selectedZone, setSelectedZone,
      deliveryFee,
      DISCOUNT_THRESHOLD, DISCOUNT_RATE,
      hasDiscount, discountAmount,
      grandTotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}