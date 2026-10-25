'use client';

import { useCart } from '@/components/CartProvider';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotal, isLoaded } = useCart();

  if (!isLoaded) {
    return (
      <>
        <section className="page-hero">
          <h1>🛒 Shopping Cart</h1>
        </section>
        <div className="loading-container"><div className="loading-spinner"></div></div>
      </>
    );
  }

  const total = getTotal();

  return (
    <>
      <section className="page-hero">
        <h1>🛒 Shopping <span style={{ color: 'var(--accent)' }}>Cart</span></h1>
        <p>{cart.length > 0 ? `${cart.length} item(s) in your cart` : 'Your cart is empty'}</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="cart-container">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven&apos;t added any items yet. Start shopping!</p>
                <Link href="/crockery" className="btn-continue-shopping">
                  Browse Crockery →
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                            {item.category === 'crockery' ? '🍽️' : '🎁'}
                          </div>
                        )}
                      </div>
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <p className="cart-item-price">₹{item.price?.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="cart-item-controls">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span className="cart-item-qty">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <h3>Order Summary</h3>
                  {cart.map(item => (
                    <div key={item.id} className="cart-summary-row">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="cart-summary-row total">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <Link href="/checkout" className="btn-checkout" style={{ display: 'block', textAlign: 'center' }}>
                    Proceed to Checkout →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
