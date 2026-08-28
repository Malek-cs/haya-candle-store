'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from './success.module.css'

export default function SuccessPage() {
  const [order, setOrder] = useState(null)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('haya_last_order')
      if (saved) setOrder(JSON.parse(saved))
    } catch {
      // No saved summary found
    }
  }, [])

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>✅</div>
        <h1 className={styles.title}>Order Received!</h1>
        <p className={styles.text}>
          Thank you for ordering from Haya Store 🕯️
          <br />
          We will contact you shortly to confirm your delivery details.
        </p>
        <span className={styles.note}>💵 Cash on Delivery</span>

        {order && (
          <motion.div
            className={styles.invoice}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className={styles.invoiceHeader}>
              <span>HAYA CANDLE STORE</span>
              <span className={styles.receiptTag}>RECEIPT</span>
            </div>

            <div className={styles.invoiceDivider} />

            <motion.ul
              className={styles.invoiceList}
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            >
              {order.items.map((item, i) => (
                <motion.li
                  key={i}
                  className={styles.invoiceItem}
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    show: { opacity: 1, x: 0 },
                  }}
                >
                  <div className={styles.itemMain}>
                    <span className={styles.itemName}>{item.name}</span>
                    {item.scent && <span className={styles.itemScent}>🌸 {item.scent}</span>}
                  </div>
                  <span className={styles.itemQty}>× {item.qty}</span>
                </motion.li>
              ))}
            </motion.ul>

            <div className={styles.invoiceDivider} />

            {order.hasDiscount && (
              <div className={styles.invoiceDiscount}>
                <span>15% Discount Applied</span>
                <span>🎉</span>
              </div>
            )}

            <div className={styles.invoiceTotalRow}>
              <span>Total Amount</span>
              <span className={styles.invoiceTotal}>{order.grandTotal.toFixed(3)} JOD</span>
            </div>

            <p className={styles.invoiceFooterNote}>📸 Take a screenshot of your invoice!</p>
          </motion.div>
        )}

        <Link href="/" className={styles.btn}>Back to Shop →</Link>
      </div>
    </main>
  )
}