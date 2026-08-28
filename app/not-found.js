import Link from 'next/link'
import styles from './error-page.module.css'

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>🕯️</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.text}>
          It seems like this page doesn&apos;t exist or has been moved.
          <br />
          Don&apos;t worry, we have plenty of lovely candles waiting in the shop!
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.btn}>Back to Shop →</Link>
        </div>
      </div>
    </main>
  )
}