'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import gridStyles from '@/components/ProductsGrid.module.css'
import SparkBurst from '@/components/SparkBurst'

export default function ProductDetailActions({ product }) {
  const { addToCart } = useCart()
  const isMulti = product.scentsCount > 1
  const hasScents = product.scents?.length > 0

  const [selectedScents, setSelectedScents] = useState([])
  const [singleScent, setSingleScent] = useState('')
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  const toggleScent = (scent) => {
    setError('')
    if (isMulti) {
      setSelectedScents((prev) =>
        prev.includes(scent) ? prev.filter((s) => s !== scent) : [...prev, scent]
      )
    } else {
      setSingleScent(scent)
    }
  }

  const handleAdd = () => {
    if (hasScents) {
      if (isMulti) {
        if (selectedScents.length === 0) {
          setError('Please select at least one fragrance')
          return
        }
        addToCart({ ...product, selectedScent: selectedScents.join(' / ') })
      } else {
        if (!singleScent) {
          setError('Please choose a fragrance first')
          return
        }
        addToCart({ ...product, selectedScent: singleScent })
      }
    } else {
      addToCart(product)
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <div>
      {product.inStock && hasScents && (
        <div className={gridStyles.scentSection}>
          <p className={`${gridStyles.scentLabel} ${error ? gridStyles.scentLabelError : ''}`}>
            {error
              ? `⚠️ ${error}`
              : isMulti
              ? `🌸 Choose Fragrances — ${selectedScents.length} selected`
              : '🌸 Choose Fragrance'}
          </p>
          <div className={gridStyles.scentGrid}>
            {product.scents.map((s) => {
              const active = isMulti ? selectedScents.includes(s) : singleScent === s
              return (
                <button
                  key={s}
                  type="button"
                  className={`${gridStyles.scentBtn} ${active ? gridStyles.scentActive : ''}`}
                  onClick={() => toggleScent(s)}
                >
                  {active && isMulti && '✓ '}{s}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          className={`${gridStyles.addBtn} ${added ? gridStyles.addedFlash : ''}`}
          onClick={handleAdd}
          disabled={!product.inStock}
          style={{ fontSize: '1rem', padding: '12px 28px' }}
        >
          {!product.inStock ? 'Out of Stock' : added ? '✓ Added to Cart!' : '+ Add to Cart'}
        </button>
        <SparkBurst trigger={added} />
      </div>
    </div>
  )
}