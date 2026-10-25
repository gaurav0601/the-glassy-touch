'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { getItemCount, isLoaded } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navLinksLeft = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/crockery', label: 'Crockery' },
  ];

  const navLinksRight = [
    { href: '/gifts', label: 'Gifts' },
    { href: '/faq', label: 'FAQ' },
    { href: '/terms', label: 'Terms' },
  ];

  const allNavLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/about', label: 'About Us', icon: '✨' },
    { href: '/crockery', label: 'Crockery', icon: '🍽️' },
    { href: '/gifts', label: 'Gifts', icon: '🎁' },
    { href: '/faq', label: 'FAQ', icon: '❓' },
    { href: '/terms', label: 'Terms', icon: '📋' },
  ];

  const itemCount = isLoaded ? getItemCount() : 0;

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''} ${pathname === '/' ? 'transparent-header' : ''}`}>
        <div className="header-container centered-layout">
          {/* Left Desktop Nav */}
          <nav className="header-nav-left" aria-label="Main Navigation Left">
            {navLinksLeft.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Top-Center Logo */}
          <Link href="/" className="header-logo-center" aria-label="The Glassy Touch - Home">
            <div className="header-logo-badge">
              <img src="/logo.png" alt="The Glassy Touch" className="header-logo-img" />
            </div>
          </Link>

          {/* Right Section: Nav Right + Cart + Hamburger */}
          <div className="header-right-group">
            <nav className="header-nav-right" aria-label="Main Navigation Right">
              {navLinksRight.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="header-actions">
              <Link href="/cart" className="cart-icon-btn" aria-label="Shopping Cart">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {itemCount > 0 && (
                  <span className="cart-badge" key={itemCount}>{itemCount}</span>
                )}
              </Link>

              {/* Hamburger Button for Mobile */}
              <button
                className={`hamburger-btn ${isMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <div className="header-logo-badge mobile-menu-badge">
              <img src="/logo.png" alt="The Glassy Touch" className="header-logo-img" />
            </div>
            <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
              ✕
            </button>
          </div>
          <div className="mobile-menu-links">
            {allNavLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-link ${pathname === link.href ? 'active' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="mobile-nav-icon">{link.icon}</span>
                <span>{link.label}</span>
                <span className="mobile-nav-arrow">→</span>
              </Link>
            ))}
            <Link
              href="/cart"
              className={`mobile-nav-link ${pathname === '/cart' ? 'active' : ''}`}
              style={{ animationDelay: `${allNavLinks.length * 0.05}s` }}
            >
              <span className="mobile-nav-icon">🛒</span>
              <span>Cart {itemCount > 0 && `(${itemCount})`}</span>
              <span className="mobile-nav-arrow">→</span>
            </Link>
          </div>
          <div className="mobile-menu-footer">
            <p>📞 Call us: {process.env.NEXT_PUBLIC_STORE_PHONE || '+91-XXXXXXXXXX'}</p>
            <p>📧 {process.env.NEXT_PUBLIC_STORE_EMAIL || 'info@theglassytouch.com'}</p>
          </div>
        </nav>
      </div>
    </>
  );
}
