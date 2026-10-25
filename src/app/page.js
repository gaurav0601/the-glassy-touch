'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import EnquiryForm from '@/components/EnquiryForm';
import GoogleMap from '@/components/GoogleMap';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
    setupScrollReveal();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const res = await fetch('/api/products?featured=true');
      const data = await res.json();
      if (data.success) {
        setFeaturedProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupScrollReveal = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  };

  return (
    <>
      {/* ========== HERO SECTION ========== */}
      <section className="hero">
        <div className="container hero-container">
          {/* Hero Content (Headline, Subtitle, CTA buttons) */}
          <div className="hero-content">
            <span className="hero-badge">✦ PREMIUM COLLECTION 2024 ✦</span>
            <h1 className="hero-title">
              Elegance in<br />
              <span className="highlight">Every Piece</span>
            </h1>
            <p className="hero-subtitle">
              Discover our exquisite range of premium crockery and handpicked gifts 
              that transform every moment into a celebration of style and taste.
            </p>
            <div className="hero-buttons">
              <Link href="/crockery" className="btn-hero-primary">
                Shop Crockery →
              </Link>
              <Link href="/gifts" className="btn-hero-secondary">
                Explore Gifts
              </Link>
            </div>
          </div>

          {/* Hero Visual (Crockery Image Card) */}
          <div className="hero-visual">
            <div className="hero-image-card">
              <img
                src="/hero_crockery.jpg"
                alt="Exquisite Crockery and Gifts"
                className="hero-main-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== OUR COLLECTIONS SECTION ========== */}
      <section className="section collections-section">
        <div className="container">
          <h2 className="section-title reveal">Our <span className="accent-text">Collections</span></h2>
          <p className="section-subtitle reveal">From elegant dinner sets to unique gift items — we have something special for everyone.</p>
          
          <div className="categories-grid reveal">
            <Link href="/crockery" className="category-card crockery">
              <div className="category-card-img-wrap">
                <img src="/collection_crockery.jpg" alt="Crockery Collection" />
              </div>
              <div className="category-card-content">
                <h3>Crockery</h3>
                <p>Fine dinner sets, tea sets, mugs, bowls & more for your elegant table setting.</p>
                <div className="category-card-footer">
                  <span className="category-card-link">Browse Collection →</span>
                  <span className="category-arrow-btn">›</span>
                </div>
              </div>
            </Link>
            <Link href="/gifts" className="category-card gifts">
              <div className="category-card-img-wrap">
                <img src="/collection_gifts.jpg" alt="Gifts Collection" />
              </div>
              <div className="category-card-content">
                <h3>Gifts</h3>
                <p>Handpicked gift items, decorative pieces & keepsakes for every special occasion.</p>
                <div className="category-card-footer">
                  <span className="category-card-link">Browse Collection →</span>
                  <span className="category-arrow-btn">›</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FEATURED PRODUCTS ========== */}
      <section className="section featured-section">
        <div className="container">
          <h2 className="section-title reveal">Featured <span className="accent-text">Products</span></h2>
          <p className="section-subtitle reveal">Our most loved pieces, handpicked for your delight.</p>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="products-grid reveal">
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '40px 0' }}>
              Products coming soon! Check back later for our amazing collection. ✨
            </p>
          )}
        </div>
      </section>

      {/* ========== WHY CHOOSE US ========== */}
      <section className="section why-choose-section">
        <div className="container">
          <h2 className="section-title reveal">Why Choose <span className="accent-text">Us</span></h2>
          <p className="section-subtitle reveal">What makes The Glassy Touch special</p>
          
          <div className="why-choose-grid reveal">
            <div className="why-card">
              <div className="why-card-icon">🏆</div>
              <h3>Premium Quality</h3>
              <p>Every piece is carefully curated and quality-checked before it reaches you.</p>
            </div>
            <div className="why-card">
              <div className="why-card-icon">📦</div>
              <h3>Safe Packaging</h3>
              <p>Expert bubble-wrap packaging ensures your delicate items arrive in perfect condition.</p>
            </div>
            <div className="why-card">
              <div className="why-card-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Competitive pricing with regular offers and discounts you won&apos;t find elsewhere.</p>
            </div>
            <div className="why-card">
              <div className="why-card-icon">❤️</div>
              <h3>Happy Customers</h3>
              <p>Thousands of satisfied customers and counting. Your happiness is our priority.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ENQUIRY SECTION ========== */}
      <section className="section enquiry-section" id="enquiry">
        <div className="container">
          <h2 className="section-title reveal">Have a <span className="accent-text">Question?</span></h2>
          <p className="section-subtitle reveal">Drop us a message and we&apos;ll get back to you within 24 hours.</p>
          
          <div className="reveal">
            <EnquiryForm />
          </div>
        </div>
      </section>

      {/* ========== MAP & CONTACT ========== */}
      <section className="section map-section">
        <div className="container">
          <h2 className="section-title reveal">Visit Our <span className="accent-text">Store</span></h2>
          <p className="section-subtitle reveal">Come experience the magic in person at our retail store.</p>
          
          <div className="reveal">
            <GoogleMap />
          </div>

          <div className="contact-info-row reveal">
            <div className="contact-info-card">
              <div className="contact-icon">📍</div>
              <div>
                <h4>Store Address</h4>
                <p>Your Store Address Here</p>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="contact-icon">📞</div>
              <div>
                <h4>Phone</h4>
                <p>+91-XXXXXXXXXX</p>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="contact-icon">📧</div>
              <div>
                <h4>Email</h4>
                <p>info@theglassytouch.com</p>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="contact-icon">🕐</div>
              <div>
                <h4>Hours</h4>
                <p>Mon-Sun: 10AM - 9PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  );
}
