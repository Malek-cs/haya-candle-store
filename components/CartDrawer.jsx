'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import styles from './CartDrawer.module.css'

export default function CartDrawer({ isOpen, onClose }) {
  const router = useRouter()
  const { cart, totalPrice, updateQty, removeFromCart, itemKey } = useCart()

  const goToCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.show : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside className={`${styles.drawer} ${isOpen ? styles.open : ''}`} aria-hidden={!isOpen}>
        <div className={styles.header}>
          <h2 className={styles.title}>🕯️ Shopping Cart</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close Cart">✕</button>
        </div>

        <div className={styles.items}>
          {cart.length === 0 ? (
            <p className={styles.empty}>Your cart is currently empty..</p>
          ) : (
            cart.map(({ product, qty }) => (
              <div key={itemKey(product)} className={styles.item}>
                <div className={styles.itemDetails}>
                  <h4>{product.name}</h4>
                  {product.selectedScent && (
                    <span className={styles.scent}>🌸 {product.selectedScent}</span>
                  )}
                  <p className={styles.itemPrice}>{(product.price * qty).toFixed(3)} JOD</p>
                  <div className={styles.qtyControls}>
                    <button onClick={() => updateQty(itemKey(product), qty - 1)} aria-label="Decrease quantity">-</button>
                    <span>{qty}</span>
                    <button onClick={() => updateQty(itemKey(product), qty + 1)} aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(itemKey(product))} className={styles.remove} aria-label="Remove item">🗑</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}>
              <span>Total:</span>
              <span>{totalPrice.toFixed(3)} JOD</span>
            </div>
            <button className={styles.checkoutBtn} onClick={goToCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  )
}