'use client';

import { useCart } from './CartProvider';
import { useState } from 'react';

export default function ProductModal({ product, onClose }) {
  const { addToCart, isInCart } = useCart();
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const outOfStock = product.in_stock === 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart(product);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addToCart(product);
    window.location.href = '/cart';
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="modal-content">
          {/* Left: Image */}
          <div className="modal-image-section">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className={`modal-product-image ${outOfStock ? 'oos-image' : ''}`} />
            ) : (
              <div className="modal-placeholder">
                <span>{product.category === 'crockery' ? '🍽️' : '🎁'}</span>
              </div>
            )}

            {/* Out of Stock Banner on modal image */}
            {outOfStock && (
              <div className="oos-banner modal-oos-banner">
                <span>OUT OF STOCK</span>
              </div>
            )}

            {/* Discount badge — only show if in stock */}
            {!outOfStock && product.original_price && product.original_price > product.price && (
              <span className="modal-discount-badge">
                {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Right: Details */}
          <div className="modal-details-section">
            <span className="modal-category-tag">{product.category}</span>
            <h2 className="modal-product-name">{product.name}</h2>
            
            <div className="modal-price-section">
              <span className="modal-price">₹{product.price?.toLocaleString('en-IN')}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="modal-original-price">₹{product.original_price?.toLocaleString('en-IN')}</span>
              )}
            </div>

            <div className="modal-divider"></div>

            <div className="modal-description">
              <h4>Description</h4>
              <p>{product.description || 'A beautiful piece from The Glassy Touch collection. Perfect for gifting or adding elegance to your home.'}</p>
            </div>

            <div className="modal-features">
              <div className="feature-item">
                <span className="feature-icon">📦</span>
                <span>Safe Packaging</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚚</span>
                <span>Fast Delivery</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💯</span>
                <span>Quality Assured</span>
              </div>
            </div>

            {/* Stock status */}
            <p className="modal-stock-info">
              {!outOfStock ? (
                <><span className="stock-dot green"></span> In Stock — Ready to ship</>
              ) : (
                <><span className="stock-dot red"></span> Currently out of stock</>
              )}
            </p>

            {/* Buttons — disabled when out of stock */}
            <div className="modal-actions">
              {outOfStock ? (
                <>
                  <button className="btn-modal-cart btn-disabled" disabled>
                    🚫 Out of Stock
                  </button>
                  <button className="btn-modal-buy btn-disabled" disabled>
                    Unavailable
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`btn-modal-cart ${addedAnimation ? 'added' : ''} ${isInCart(product.id) ? 'in-cart' : ''}`}
                    onClick={handleAddToCart}
                  >
                    {addedAnimation ? '✓ Added to Cart!' : isInCart(product.id) ? '✓ In Cart — Add More' : '🛒 Add to Cart'}
                  </button>
                  <button className="btn-modal-buy" onClick={handleBuyNow}>
                    ⚡ Buy Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
