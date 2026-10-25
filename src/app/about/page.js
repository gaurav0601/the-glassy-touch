export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <h1>About <span style={{ color: 'var(--accent)' }}>The Glassy Touch</span></h1>
        <p>Our story of bringing elegance to every home</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-content">
            <h2>Our Story ✨</h2>
            <p>
              Welcome to <strong>The Glassy Touch</strong> — your one-stop destination for premium crockery 
              and unique gifts. What started as a small retail store born out of a passion for beautiful 
              tableware has now grown into a beloved brand trusted by thousands of customers.
            </p>
            <p>
              We believe that every meal deserves to be served on beautiful crockery, and every occasion 
              deserves a thoughtful gift. That&apos;s why we hand-pick every single item in our collection, 
              ensuring that only the finest pieces make it to our shelves — and now, to your doorstep.
            </p>

            <h2>Our Mission 🎯</h2>
            <p>
              To bring elegance, quality, and joy to every home through our carefully curated collection 
              of crockery and gifts. We strive to make premium tableware and gifting accessible to everyone 
              — without compromising on quality or style.
            </p>

            <h2>What Sets Us Apart 💎</h2>
            <p>
              With years of experience in the crockery and gifting business, we understand what our 
              customers need. Our offline store has been the go-to place for fine dining essentials 
              and thoughtful presents. Now, we&apos;re bringing that same experience online — with the 
              same warmth, quality, and personal touch.
            </p>

            <div className="about-values">
              <div className="about-value-card">
                <div className="icon">🏆</div>
                <h3>Quality First</h3>
                <p>Every product passes our strict quality standards before reaching you.</p>
              </div>
              <div className="about-value-card">
                <div className="icon">🤝</div>
                <h3>Customer Love</h3>
                <p>Your satisfaction drives everything we do. We treat every customer like family.</p>
              </div>
              <div className="about-value-card">
                <div className="icon">📦</div>
                <h3>Safe Delivery</h3>
                <p>Expert packaging to ensure your fragile items arrive in perfect condition.</p>
              </div>
              <div className="about-value-card">
                <div className="icon">💰</div>
                <h3>Fair Pricing</h3>
                <p>Premium products at prices that won&apos;t break the bank.</p>
              </div>
              <div className="about-value-card">
                <div className="icon">🌟</div>
                <h3>Curated Selection</h3>
                <p>Each item is carefully chosen for its design, durability, and charm.</p>
              </div>
              <div className="about-value-card">
                <div className="icon">🏪</div>
                <h3>Trusted Store</h3>
                <p>An established retail presence with a growing community of loyal customers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
