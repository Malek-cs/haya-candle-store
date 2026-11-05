import { CartProvider } from '@/context/CartContext'
import EmberCursor from '@/components/EmberCursor'
import './globals.css'

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
    <html lang="en" dir="ltr">
      <head>
        <meta name="google-site-verification" content="rCCZ8ScKFmlVUEDKI6ZR77edjB6XQ-O3hppwTkANBaQ" />
        {/* استيراد الخطوط مباشرة من Google Fonts لمنع أخطاء الـ Build في Turbopack */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-sans: 'Plus Jakarta Sans', sans-serif;
            --font-serif: 'Playfair Display', serif;
          }
        `}} />
      </head>
      <body style={{
        fontFamily: 'var(--font-sans)',
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