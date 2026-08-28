'use client'

import { motion } from 'framer-motion'
import styles from './CandleProgress.module.css'

// progress: رقم من 0 لـ 1 - كل ما اقترب الطلب من حد الخصم، شمعة زيادة بتضوي
export default function CandleProgress({ progress, count = 5 }) {
  const clamped = Math.min(1, Math.max(0, progress))
  const litCount = Math.min(count, Math.floor(clamped * count + 0.0001))
  const nextPartial = clamped * count - litCount

  return (
    <div className={styles.row} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const isLit = i < litCount
        const isFlickering = i === litCount && nextPartial > 0.15 && !isLit
        return (
          <motion.span
            key={i}
            className={`${styles.candle} ${isLit ? styles.lit : ''} ${isFlickering ? styles.flicker : ''}`}
            animate={isLit ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            🕯️
          </motion.span>
        )
      })}
    </div>
  )
}
