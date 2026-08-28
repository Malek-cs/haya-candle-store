'use client'

import { useEffect } from 'react'
import styles from './error-page.module.css'

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>🕯️</div>
        <h1 className={styles.title}>An Unexpected Error Occurred</h1>
        <p className={styles.text}>
          Something went wrong on our end, we apologize!
          <br />
          Please try again, and if the issue persists, feel free to contact us.
        </p>
        <div className={styles.actions}>
          <button onClick={() => reset()} className={styles.btn}>Try Again</button>
          <a href="/" className={styles.btn}>Back to Shop →</a>
        </div>
      </div>
    </main>
  )
}