'use client';

import { useCart } from './CartProvider';
import { useState } from 'react';

export default function ProductCard({ product, onView }) {
  const { addToCart, isInCart } = useCart();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const outOfStock = product.in_stock === 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1000);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product);
    window.location.href = '/cart';
  };

  return (
    <div className={`product-card ${outOfStock ? 'product-oos' : ''}`} data-category={product.category}>
      <div className="product-card-image" onClick={() => onView(product)}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="product-placeholder">
            <span>{product.category === 'crockery' ? '🍽️' : '🎁'}</span>
          </div>
        )}

        {/* Out of Stock Banner — directly on the image */}
        {outOfStock && (
          <div className="oos-banner">
            <span>OUT OF STOCK</span>
          </div>
        )}

        {/* Discount badge — only show if in stock */}
        {!outOfStock && product.original_price && product.original_price > product.price && (
          <span className="product-discount-badge">
            {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
          </span>
        )}

        <div className="product-image-overlay">
          <button className="view-btn" onClick={(e) => { e.stopPropagation(); onView(product); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View
          </button>
        </div>
      </div>
      <div className="product-card-body">
        <span className="product-category-tag">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description?.substring(0, 60)}{product.description?.length > 60 ? '...' : ''}</p>
        <div className="product-price-row">
          <div className="product-prices">
            <span className="product-price">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="product-original-price">₹{product.original_price?.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
        <div className="product-card-actions">
          <button
            className={`btn-add-cart ${addedAnimation ? 'added' : ''} ${isInCart(product.id) ? 'in-cart' : ''} ${outOfStock ? 'btn-disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={outOfStock}
          >
            {outOfStock ? '🚫 Out of Stock' : addedAnimation ? '✓ Added!' : isInCart(product.id) ? '✓ In Cart' : '🛒 Add to Cart'}
          </button>
          <button
            className={`btn-buy-now ${outOfStock ? 'btn-disabled' : ''}`}
            onClick={handleBuyNow}
            disabled={outOfStock}
          >
            {outOfStock ? 'Unavailable' : '⚡ Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
