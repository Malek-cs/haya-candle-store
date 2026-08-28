'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './EmberCursor.module.css'

const HOVER_SELECTOR = 'button, a, input, select, textarea, [role="button"]'

export default function EmberCursor() {
  const pathname = usePathname()
  const [enabled, setEnabled] = useState(false)
  const dotRef = useRef(null)
  const glowRef = useRef(null)
  const pos = useRef({ x: -100, y: -100 })
  const glowPos = useRef({ x: -100, y: -100 })

  useEffect(() => {
    // بس على أجهزة فيها ماوس حقيقي (مش تاتش)، وبدون تفضيل تقليل الحركة
    const hasFineCursor = window.matchMedia('(pointer: fine)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(hasFineCursor && !prefersReducedMotion)
  }, [])

  const isActive = enabled && !pathname.startsWith('/admin')

  useEffect(() => {
    document.body.style.cursor = isActive ? 'none' : ''
    return () => { document.body.style.cursor = '' }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return

    const handleMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      }
      const target = e.target.closest?.(HOVER_SELECTOR)
      dotRef.current?.classList.toggle(styles.hoverActive, Boolean(target))
      glowRef.current?.classList.toggle(styles.hoverActive, Boolean(target))
    }

    let rafId
    const animateGlow = () => {
      glowPos.current.x += (pos.current.x - glowPos.current.x) * 0.15
      glowPos.current.y += (pos.current.y - glowPos.current.y) * 0.15
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${glowPos.current.x}px, ${glowPos.current.y}px)`
      }
      rafId = requestAnimationFrame(animateGlow)
    }
    rafId = requestAnimationFrame(animateGlow)

    window.addEventListener('mousemove', handleMove)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(rafId)
    }
  }, [isActive])

  // ما منحتاج مؤشر مخصص بلوحة الإدارة (فيها عناصر دقيقة كثير - جداول، فورمات)
  if (!isActive) return null

  return (
    <>
      <div ref={glowRef} className={styles.glow} />
      <div ref={dotRef} className={styles.dot} />
    </>
  )
}
