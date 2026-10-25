'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';

export default function CrockeryPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?category=crockery');
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (error) {
      console.error('Failed to fetch crockery:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];
    if (filterBy === 'in-stock') {
      list = list.filter(p => p.in_stock !== 0);
    } else if (filterBy === 'discount') {
      list = list.filter(p => p.original_price && p.original_price > p.price);
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [products, sortBy, filterBy]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-inner">
            <div>
              <div className="breadcrumbs">
                <Link href="/">Home</Link> <span>›</span> <span>Crockery</span>
              </div>
              <h1 className="page-title">Crockery</h1>
              <p className="page-subtitle">Fine dinner sets, tea sets, mugs, bowls & more for your elegant table setting.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Controls Bar */}
          <div className="products-controls-bar">
            <div className="controls-group">
              <label htmlFor="sort-select">Sort by</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="custom-select"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            <div className="controls-group">
              <label htmlFor="filter-select">Filter by</label>
              <select
                id="filter-select"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="custom-select"
              >
                <option value="all">All Products</option>
                <option value="in-stock">In Stock Only</option>
                <option value="discount">Special Offers</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="products-grid">
              {filteredAndSortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="cart-empty">
              <div className="cart-empty-icon">🍽️</div>
              <h2>No products found</h2>
              <p>Try adjusting your filter or check back later for our newest pieces.</p>
            </div>
          )}
        </div>
      </section>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  );
}
