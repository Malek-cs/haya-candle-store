'use client'

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './SparkBurst.module.css'

export default function SparkBurst({ trigger, count = 9 }) {
  const sparks = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
      const distance = 22 + Math.random() * 22
      return {
        id: `${i}-${Math.random()}`,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, count])

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <AnimatePresence>
        {trigger &&
          sparks.map((s) => (
            <motion.span
              key={s.id}
              className={styles.spark}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            />
          ))}
      </AnimatePresence>
    </div>
  )
}
