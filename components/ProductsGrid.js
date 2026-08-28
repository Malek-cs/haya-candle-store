'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { handleTiltMove, handleTiltLeave } from '@/lib/tilt'
import SparkBurst from './SparkBurst'
import CandleProgress from './CandleProgress'
import styles from './ProductsGrid.module.css'

export default function ProductsGrid({ products }) {
  const { addToCart, totalItems, totalPrice, grandTotal, hasDiscount } = useCart()
  const [filter, setFilter] = useState('All')

  const categories = ['All', 'Packages', 'Single Candle']
  const filtered = filter === 'All' 
    ? products 
    : products.filter((p) => {
        if (filter === 'Packages') return p.category === 'بكجات' || p.category === 'Packages' || p.category === 'Package'
        if (filter === 'Single Candle') return p.category === 'شمع فردي' || p.category === 'Single Candle' || p.category === 'Single'
        return p.category === filter
      })

  const [selectedScents, setSelectedScents] = useState({})
  const [added, setAdded]   = useState({})
  const [errors, setErrors] = useState({})

  const isMulti = (product) => product.scentsCount > 1
  const getScents = (productId) => selectedScents[productId] || []

  const handleScentToggle = (product, scent) => {
    setErrors((prev) => ({ ...prev, [product.id]: null }))
    if (isMulti(product)) {
      setSelectedScents((prev) => {
        const current = prev[product.id] || []
        if (current.includes(scent)) {
          return { ...prev, [product.id]: current.filter((s) => s !== scent) }
        }
        return { ...prev, [product.id]: [...current, scent] }
      })
    } else {
      setSelectedScents((prev) => ({ ...prev, [product.id]: scent }))
    }
  }

  const handleAdd = (product) => {
    if (isMulti(product)) {
      const chosen = getScents(product.id)
      if (chosen.length === 0) {
        setErrors((prev) => ({ ...prev, [product.id]: 'Please select at least one fragrance' }))
        return
      }
      addToCart({ ...product, selectedScent: chosen.join(' / ') })
    } else {
      const scent = selectedScents[product.id]
      if (!scent) {
        setErrors((prev) => ({ ...prev, [product.id]: 'Please choose a fragrance first' }))
        return
      }
      addToCart({ ...product, selectedScent: scent })
    }
    setAdded((prev) => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAdded((prev) => ({ ...prev, [product.id]: false })), 1400)
  }

  return (
    <div className={styles.container}>
      {/* 1. Category Filter Tabs */}
      <div className={styles.tabs}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.tab} ${filter === cat ? styles.tabActive : ''}`}
            onClick={() => setFilter(cat)}
            style={{ position: 'relative' }}
          >
            <span style={{ position: 'relative', zIndex: 2 }}>
              {cat === 'All' && '✨ '}
              {cat === 'Packages' && '🎁 '}
              {cat === 'Single Candle' && '🕯️ '}
              {cat}
            </span>
            {filter === cat && (
              <motion.div
                layoutId="activeTab"
                className={styles.activeBg}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* 2. Sticky Cart Header Bar */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={styles.cartBarSticky}
          >
            <div className={styles.discountProgressWrapper}>
              <div className={styles.progressText}>
                {totalPrice < 13 ? (
                  <>Add <span className={styles.bold}>{(13 - totalPrice).toFixed(3)} JOD</span> more to get 15% OFF! 🎁</>
                ) : (
                  <span className={styles.successText}>🎉 Congratulations! 15% discount applied to your order</span>
                )}
              </div>
              <CandleProgress progress={totalPrice / 13} />
            </div>

            <div className={styles.cartBar}>
              <div className={styles.cartInfo}>
                <span className={styles.cartCount}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                <span className={styles.cartTotal}>
                  {hasDiscount ? (
                    <><span className={styles.oldPrice}>{totalPrice.toFixed(3)}</span> {grandTotal.toFixed(3)} JOD</>
                  ) : (
                    `${totalPrice.toFixed(3)} JOD`
                  )}
                </span>
              </div>
              <Link href="/checkout" className={styles.cartBtn}>Checkout →</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Products Grid */}
      <motion.div layout className={styles.grid}>
        <AnimatePresence mode='popLayout'>
          {filtered.map((product) => {
            const multi   = isMulti(product)
            const chosen  = multi ? getScents(product.id) : []
            const single  = !multi ? selectedScents[product.id] : null
            const err     = errors[product.id]
            const isAdded = added[product.id]

            return (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`${styles.card} ${!product.available ? styles.unavailable : ''}`}
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
              >
                <div className={styles.imgWrapper}>
                  <Image
                    src={
                      product.image && product.image.includes('http')
                        ? product.image.substring(product.image.indexOf('http'))
                        : (product.image || '/placeholder.png')
                    }
                    alt={product.name || 'Candle Product'}
                    fill
                    sizes="(max-width: 600px) 100vw, 300px"
                    className={styles.img}
                    style={{ objectFit: 'cover' }}
                  />
                  {!product.available && <div className={styles.soldOut}>Out of Stock</div>}
                </div>

                <div className={styles.info}>
                  <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h2 className={styles.name}>{product.name}</h2>
                  </Link>
                  <p className={styles.desc}>{product.desc}</p>

                  {product.available && product.scents?.length > 0 && (
                    <div className={styles.scentSection}>
                      <p className={`${styles.scentLabel} ${err ? styles.scentLabelError : ''}`}>
                        {err ? `⚠️ ${err}` : multi ? `🌸 Choose Fragrances — ${chosen.length} selected` : '🌸 Choose Fragrance'}
                      </p>
                      <div className={styles.scentGrid}>
                        {product.scents.map((s) => {
                          const active = multi ? chosen.includes(s) : single === s
                          return (
                            <button
                              key={s}
                              className={`${styles.scentBtn} ${active ? styles.scentActive : ''} ${err && !active ? styles.scentError : ''}`}
                              onClick={() => handleScentToggle(product, s)}
                              type="button"
                            >
                              {active && multi && <span className={styles.scentCheck}>✓</span>}
                              {s}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className={styles.footer}>
                    <span className={styles.price}>{Number(product.price).toFixed(3)} JOD</span>
                    <div style={{ position: 'relative' }}>
                      <button
                        className={`${styles.addBtn} ${isAdded ? styles.addedFlash : ''}`}
                        onClick={() => handleAdd(product)}
                        disabled={!product.available}
                      >
                        {isAdded ? '✓ Added!' : '+ Add to Cart'}
                      </button>
                      <SparkBurst trigger={isAdded} />
                    </div>
                  </div>
                </div>
                <div className={styles.sheen} />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}