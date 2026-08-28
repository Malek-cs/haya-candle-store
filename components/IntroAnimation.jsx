'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './IntroAnimation.module.css'

const SESSION_KEY = 'haya_intro_played'

export default function IntroAnimation() {
  const [stage, setStage] = useState('idle') // idle -> strike -> flash -> done
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const alreadyPlayed = sessionStorage.getItem(SESSION_KEY)

    if (prefersReducedMotion || alreadyPlayed) {
      sessionStorage.setItem(SESSION_KEY, '1')
      return
    }

    setShouldRender(true)
    sessionStorage.setItem(SESSION_KEY, '1')

    const t1 = setTimeout(() => setStage('strike'), 250)
    const t2 = setTimeout(() => setStage('flash'), 900)
    const t3 = setTimeout(() => setStage('done'), 1500)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  if (!shouldRender) return null

  return (
    <AnimatePresence>
      {stage !== 'done' && (
        <motion.div
          className={styles.overlay}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.span
            className={styles.flame}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              stage === 'strike'
                ? { scale: [0, 1.4, 1], opacity: 1 }
                : stage === 'flash'
                ? { scale: 1.2, opacity: 1 }
                : {}
            }
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            🕯️
          </motion.span>

          {stage === 'flash' && (
            <motion.div
              className={styles.flash}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
