"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import ProductsGrid from '@/components/ProductsGrid';
import IntroAnimation from '@/components/IntroAnimation';
import styles from './page.module.css';

export default function HomePage() {
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getLiveProducts() {
      try {
        const res = await fetch("/api/products", { cache: 'no-store' });
        const data = await res.json();

        if (Array.isArray(data)) {
          const formattedData = data.map(p => ({
            ...p,
            id: p._id,
            available: p.inStock,
            category: p.category === 'فردي' || p.category === 'Single' ? 'Single Candle'
                    : p.category === 'بكج' || p.category === 'Package' ? 'Packages'
                    : p.category,
          }));
          setDbProducts(formattedData);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    getLiveProducts();
  }, []);

  return (
    <main className={styles.page} style={{ direction: 'ltr', textAlign: 'left' }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <IntroAnimation />

      {/* ── 1. Hero & Navbar ── */}
      <header className={styles.hero} id="home">
        <div
          className={styles.heroBg}
          style={{ backgroundImage: "url('/products/Candleengagement.png')" }}
        />
        <nav className={styles.nav}>
          <div className={styles.navLinks}>
            <a href="#home">Home</a>
            <a href="#products">Products</a>
          </div>
          <a className={styles.brand} href="#home">
            <div className={styles.brandMain}>HAYA</div>
            <div className={styles.brandSub}>CANDLE STORE</div>
          </a>
          <div className={styles.navLinks}>
            <a href="#story">Our Story</a>
            <a href="#gallery">Gallery</a>
          </div>
        </nav>

        <div className={styles.heroCopy} style={{ direction: 'ltr', textAlign: 'right', marginLeft: 'auto', marginRight: '5%' }}>
          <div className={styles.kicker} style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}>HANDCRAFTED CANDLES · AMMAN</div>
          <h1 className={styles.heroTitle} style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}>Warmth<br /><em>in Every</em> Detail</h1>
          <p style={{ direction: 'ltr', unicodeBidi: 'plaintext', textAlign: 'right' }}>
            Hand-poured natural candles with cozy scents and elegant designs, transforming every ordinary moment into a cherished memory.
          </p>
          <a className={styles.cta} href="#products" style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}>Shop Collection</a>
        </div>
      </header>

      {/* ── 2. Info Strip ── */}
      <section className={styles.infoStrip}>
        <div className={styles.infoTitle}>
          <span>Discover</span>
          <strong>The Haya Experience</strong>
        </div>
        <div className={styles.infoField}>
          <div className={styles.infoIcon}>🚚</div>
          <div><small>Delivery</small><span>Across Amman</span></div>
        </div>
        <div className={styles.infoField}>
          <div className={styles.infoIcon}>🎁</div>
          <div><small>Discount</small><span>15% Over 13 JOD</span></div>
        </div>
        <div className={styles.infoField}>
          <div className={styles.infoIcon}>🕯️</div>
          <div><small>Craftsmanship</small><span>100% Handmade</span></div>
        </div>
        <a href="#products" className={styles.bookBtn}>Shop Now</a>
      </section>

      {/* ── 3. Highlights Preview ── */}
      <section className={`${styles.section} ${styles.center}`}>
        <div className={styles.eyebrow}>Our Collection</div>
        <h2 className={styles.sectionTitle}>Featured Candles</h2>
        <div className={styles.dishes}>
          <article className={styles.dish}>
            <img src="/products/pack.jpg" alt="Natural Citrus Candle" />
            <div className={styles.dishInfo}>
              <h3>Citrus Delight</h3>
              <p>Natural soy wax, dried orange slices, invigorating fresh aroma</p>
            </div>
          </article>
          <article className={styles.dish}>
            <img src="/products/wood.jpeg" alt="Aromatic Wooden Candle" />
            <div className={styles.dishInfo}>
              <h3>Wooden Base Candle</h3>
              <p>Natural rustic wooden base, double wick, a touch of pure elegance</p>
            </div>
          </article>
          <article className={styles.dish}>
            <img src="/products/pakege.jpg" alt="Luxury Gift Package" />
            <div className={styles.dishInfo}>
              <h3>Luxury Gift Set</h3>
              <p>Exquisite gift packaging combining a signature candle and companion piece</p>
            </div>
          </article>
        </div>
      </section>

      {/* ── 4. Main Products Section ── */}
      <section id="products" className={styles.section}>
        <div className={styles.center}>
          <div className={styles.eyebrow}>Shop</div>
          <h2 className={styles.sectionTitle}>All Collections</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#A3823F', padding: '80px 0', fontSize: '1.1rem' }}>
            Preparing the luxury candle collection... 🕯️
          </div>
        ) : (
          <div className="fade-in">
            <ProductsGrid products={dbProducts} />
            {dbProducts.length === 0 && (
              <p style={{ textAlign: 'center', color: '#6E6656' }}>No products available at the moment.</p>
            )}
          </div>
        )}
      </section>

      {/* ── 5. Story Section ── */}
      <section className={styles.story} id="story" style={{ direction: 'ltr' }}>
        <div
          className={styles.storyImg}
          style={{ backgroundImage: "url('/products/CandlePalestine.png')" }}
        />
        <div className={styles.storyCopy} style={{ textAlign: 'left', direction: 'ltr' }}>
          <div className={styles.eyebrow}>Our Philosophy</div>
          <h2 className={styles.sectionTitle}>Every Candle Tells a Story</h2>
          <p>
            At Haya Store, every candle starts with a simple vision: bringing warmth to your home. We hand-pour every batch, curate captivating fragrances, and package each piece as a treasured gift for you or your loved ones.
          </p>
          <a
            className={styles.storyLink}
            href="https://www.instagram.com/natureby.haya/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow Our Journey
          </a>
        </div>
      </section>

      {/* ── 6. Why Haya Store ── */}
      <section className={styles.experience} style={{ direction: 'ltr' }}>
        <article className={styles.exp} style={{ textAlign: 'left' }}>
          <div className={styles.expNumber}>01</div>
          <h3>Handcrafted Artistry</h3>
          <p>Each candle is poured and decorated by hand with meticulous care, free from automated production lines.</p>
        </article>
        <article className={styles.exp} style={{ textAlign: 'left' }}>
          <div className={styles.expNumber}>02</div>
          <h3>Natural Ingredients</h3>
          <p>Pure soy wax and premium fragrance oils for a clean, non-toxic, and long-lasting aroma.</p>
        </article>
        <article className={styles.exp} style={{ textAlign: 'left' }}>
          <div className={styles.expNumber}>03</div>
          <h3>Gift-Ready Packaging</h3>
          <p>Elegant and refined presentation makes every order ready to delight as a gift upon arrival.</p>
        </article>
      </section>

      {/* ── 7. Gallery ── */}
      <section className={styles.section} id="gallery" style={{ paddingBottom: 0 }}>
        <div className={styles.center}>
          <div className={styles.eyebrow}>From Our Studio</div>
          <h2 className={styles.sectionTitle}>Visual Moments</h2>
        </div>
        <div className={styles.gallery}>
          <div className={styles.g1}><img src="/products/malod.jpg" alt="Handcrafted candle details" /></div>
          <div><img src="/products/ward.jpg" alt="Heart design candle" /></div>
          <div className={styles.g3}><img src="/products/gard.jpg" alt="Special occasion candle" /></div>
          <div><img src="/products/cup.jpeg" alt="Candle with wooden lid" /></div>
        </div>
      </section>

      {/* ── 8. Brand Story ── */}
      <section className={styles.brandStory} style={{ direction: 'ltr' }}>
        <div
          className={styles.brandStoryImg}
          style={{ backgroundImage: "url('/products/cup.jpeg')" }}
        />
        <div className={styles.brandStoryCopy} style={{ textAlign: 'left', direction: 'ltr' }}>
          <h3>The Brand Story</h3>
          <p>
            Haya Store started from a simple passion for candle-making at home, evolving into a haven for anyone seeking warmth, serenity, and beauty in their day. Every collection we create carries our signature touch.
          </p>
          <a className={styles.brandStoryBtn} href="#products">Shop Now</a>
        </div>
      </section>

      {/* ── 9. Final CTA (معدل ليطابق الصورة تماماً: توسيط أنيق ومريح للنظر مع زر متناسق) ── */}
      <section
        className={styles.finalCta}
        style={{ 
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1600&q=80')",
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          direction: 'ltr',
          padding: '0 20px'
        }}
      >
        <div className={styles.finalCtaContent} style={{ alignItems: 'center', textAlign: 'center', direction: 'ltr' }}>
          <div className={styles.eyebrow} style={{ letterSpacing: '2px', fontSize: '0.85rem', marginBottom: '10px' }}>DON&apos;T MISS OUT</div>
          <h2 className={styles.sectionTitle} style={{ color: '#fff', direction: 'ltr', unicodeBidi: 'plaintext', fontSize: '3rem', marginBottom: '25px' }}>Ready to Light Up Your Evening?</h2>
          <a className={styles.cta} href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Shop Now
          </a>
        </div>
      </section>

      {/* ── 10. Footer ── */}
      <footer className={styles.siteFooter} id="contact" style={{ direction: 'ltr', textAlign: 'left' }}>
        <div className={styles.footerTop} style={{ direction: 'ltr', textAlign: 'left' }}>
          <div>
            <div className={styles.footerBrand}>HAYA</div>
            <div className={styles.footerSub}>CANDLE STORE</div>
          </div>
          <div className={styles.footerCols} style={{ direction: 'ltr', textAlign: 'left' }}>
            <div>
              <h4>Location</h4>
              <p>Amman, Jordan</p>
              <p>Delivery across Amman</p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <a href="#products">Products</a>
              <a href="/checkout">Checkout</a>
              <a href="#story">Our Story</a>
            </div>
            <div>
              <h4>Follow Us</h4>
              <div className={styles.socialRow} style={{ justifyContent: 'flex-start' }}>
                <a
                  className={styles.socialIcon}
                  href="https://www.instagram.com/natureby.haya/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <i className="fa-brands fa-instagram" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.copyright} style={{ direction: 'ltr', textAlign: 'left' }}>© 2026 HAYA CANDLE STORE · All rights reserved</div>
      </footer>
    </main>
  );
}