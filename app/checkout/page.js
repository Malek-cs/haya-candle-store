'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import styles from './checkout.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus, faTrashCan } from '@fortawesome/free-solid-svg-icons'

export default function CheckoutPage() {
  const router = useRouter()
  const {
    cart, totalPrice, deliveryFee,
    deliveryZones,
    selectedZone, setSelectedZone,
    hasDiscount, discountAmount, DISCOUNT_THRESHOLD,
    grandTotal, clearCart, updateQty, removeFromCart, itemKey,
  } = useCart()

  const [form, setForm] = useState({ name: '', street: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateField = (name, value) => {
    if (name === 'name') return value.trim().length >= 2 ? '' : 'Name must be at least 2 characters'
    if (name === 'street') return value.trim().length >= 3 ? '' : 'Please enter a clear address'
    if (name === 'phone') return /^07[789]\d{7}$/.test(value) ? '' : 'Valid Jordanian number required (e.g. 079xxxxxxx)'
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleZoneChange = (e) => {
    if (!deliveryZones) return;
    const zone = deliveryZones.find((z) => z.name === e.target.value)
    setSelectedZone(zone || null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, street, phone } = form

    const newFieldErrors = {
      name: validateField('name', name),
      street: validateField('street', street),
      phone: validateField('phone', phone),
    }
    setFieldErrors(newFieldErrors)
    setTouched({ name: true, street: true, phone: true })
    if (Object.values(newFieldErrors).some(Boolean)) { setError('Please correct the highlighted fields'); return }

    if (!selectedZone) { setError('Please select a delivery zone'); return }
    if (cart.length === 0) { setError('Your cart is empty'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          zone: selectedZone.name,
          cart,
          totalPrice,
          deliveryFee,
          grandTotal,
        }),
      })
      if (!res.ok) throw new Error()

      try {
        sessionStorage.setItem('haya_last_order', JSON.stringify({
          items: cart.map(({ product, qty }) => ({
            name: product.name,
            scent: product.selectedScent || '',
            qty,
          })),
          grandTotal,
          hasDiscount,
        }))
      } catch {
        // Ignore session storage error
      }

      clearCart()
      router.push('/checkout/success')
    } catch {
      setError('An error occurred, please try again')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '3rem 2rem', margin: 'auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ color: '#f5d98a', marginBottom: '0.75rem' }}>Your Cart is Empty</h2>
          <a href="/" className={styles.returnBtn}>← Back to Shop</a>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page} style={{ direction: 'ltr', textAlign: 'left' }}>
      <div className={styles.checkoutWrapper}>
        
        {/* Left Column: Form & Information */}
        <div className={styles.formSection}>
          <div className={styles.header}>
            <span className={styles.flame}></span>
            <h1 className={styles.title}>Checkout</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label}>Delivery Zone</label>
              <select className={styles.select} value={selectedZone?.name || ''} onChange={handleZoneChange} dir="ltr">
                <option value="">— Select your area in Amman —</option>
                {deliveryZones?.map((zone) => (
                  <option key={zone._id} value={zone.name}>{zone.name} — {zone.fee} JOD</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                className={`${styles.input} ${touched.name && fieldErrors.name ? styles.inputError : ''}`}
                type="text" name="name" value={form.name}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="John Doe"
              />
              {touched.name && fieldErrors.name && <p className={styles.fieldError}>{fieldErrors.name}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Detailed Address / Street</label>
              <input
                className={`${styles.input} ${touched.street && fieldErrors.street ? styles.inputError : ''}`}
                type="text" name="street" value={form.street}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="e.g. Building 5, Apt 2"
              />
              {touched.street && fieldErrors.street && <p className={styles.fieldError}>{fieldErrors.street}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Phone Number</label>
              <input
                className={`${styles.input} ${touched.phone && fieldErrors.phone ? styles.inputError : ''}`}
                type="tel" name="phone" value={form.phone}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="07xxxxxxxx"
              />
              {touched.phone && fieldErrors.phone && <p className={styles.fieldError}>{fieldErrors.phone}</p>}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.submitBtn} type="submit" disabled={loading || !selectedZone}>
              {loading ? 'Confirming...' : `Confirm Order — ${grandTotal.toFixed(3)} JOD →`}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary (Like Reference Image) */}
        <div className={styles.summarySection}>
          <h2 className={styles.summaryTitle}>ORDER SUMMARY</h2>
          
          <div className={styles.cartSummary}>
            {cart.map(({ product, qty }) => (
              <div key={itemKey(product)} className={styles.cartItem}>
                <div className={styles.cartItemInfo}>
                  <span className={styles.cartItemName}>{product.name}</span>
                  {product.selectedScent && (
                    <span className={styles.cartItemScent}>🌸 {product.selectedScent}</span>
                  )}
                  <span className={styles.cartItemPrice}>{(product.price * qty).toFixed(3)} JOD</span>
                </div>
                
                <div className={styles.qtyControls}>
                  <button 
                    className={styles.qtyBtnIcon} 
                    onClick={() => updateQty(itemKey(product), qty - 1)}
                    aria-label="Decrease quantity"
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  
                  <span className={styles.qtyNumber}>{qty}</span>
                  
                  <button 
                    className={styles.qtyBtnIcon} 
                    onClick={() => updateQty(itemKey(product), qty + 1)}
                    aria-label="Increase quantity"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                  
                  <button 
                    className={styles.removeBtnIcon} 
                    onClick={() => removeFromCart(itemKey(product))}
                    aria-label="Remove item"
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                  </button>
                </div>
              </div>
            ))}

            <div className={styles.cartTotal}>
              <span>Subtotal</span>
              <span>{totalPrice.toFixed(3)} JOD</span>
            </div>
            <div className={styles.cartDelivery}>
              <span>Delivery</span>
              <span>{selectedZone ? `${deliveryFee.toFixed(3)} JOD` : '—'}</span>
            </div>
            <div className={styles.cartGrand}>
              <span>Total</span>
              <span>{selectedZone ? `${grandTotal.toFixed(3)} JOD` : '—'}</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}