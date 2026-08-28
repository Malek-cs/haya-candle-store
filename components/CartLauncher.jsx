'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import CartDrawer from './CartDrawer'
import styles from './CartLauncher.module.css'

export default function CartLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const { totalItems } = useCart()
  const pathname = usePathname()

  // No floating cart button needed on admin or checkout pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null

  return (
    <>
      <button
        className={styles.launcher}
        onClick={() => setIsOpen(true)}
        aria-label="Open shopping cart"
      >
        🛒
        {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
      </button>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}