// store/cartStore.js
import { create } from 'zustand';

export const useCartStore = create((set) => ({
  cart: [], // مصفوفة فارغة تبدأ بها السلة
  
  // دالة إضافة منتج للسلة
  addToCart: (product) => set((state) => {
    // التحقق مما إذا كان المنتج موجوداً مسبقاً في السلة
    const existingItem = state.cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      // إذا كان موجوداً، نزيد الكمية فقط
      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    // إذا كان جديداً، نضيفه مع كمية = 1
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),

  // دالة لحذف منتج تماماً من السلة
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== productId),
  })),

  // دالة لتفريغ السلة بالكامل (بعد الدفع مثلاً)
  clearCart: () => set({ cart: [] }),
}));