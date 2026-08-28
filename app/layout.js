import { CartProvider } from '@/context/CartContext'
import EmberCursor from '@/components/EmberCursor'
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans'
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif'
})

export const metadata = {
  title: 'Haya Store | Handcrafted Luxury Candles in Jordan 🕯️',
  description: 'Discover the world of luxury handcrafted scented candles at Haya Store. Premium curated sets and natural candles with enchanting fragrances and fast delivery across Amman, Jordan.',
  metadataBase: new URL('https://haya-one.vercel.app'),
  keywords: ['Haya Store', 'Handcrafted Candles', 'Jordan Candles', 'Candle Gifts', 'Scented Candles Jordan'],
  openGraph: {
    title: 'Haya Store | Luxury Handcrafted Candles',
    description: 'Exquisite handcrafted candles with unique designs and captivating scents.',
    url: 'https://haya-one.vercel.app',
    siteName: 'Haya Store',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/products/icon.png',
        width: 1200,
        height: 630,
        alt: 'Haya Store - Luxury Handcrafted Candles',
      },
    ],
  },
  icons: {
    icon: '/products/icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" className={`${plusJakarta.variable} ${playfair.variable}`}>
      <head>
        <meta name="google-site-verification" content="rCCZ8ScKFmlVUEDKI6ZR77edjB6XQ-O3hppwTkANBaQ" />
      </head>
      <body style={{
        fontFamily: 'var(--font-sans), sans-serif',
        backgroundColor: '#F4EFE4',
        margin: 0
      }}>
        <CartProvider>
          {children}
          <EmberCursor />
        </CartProvider>
      </body>
    </html>
  )
}