export default function TermsPage() {
  return (
    <>
      <section className="page-hero">
        <h1>Terms & <span style={{ color: 'var(--accent)' }}>Conditions</span></h1>
        <p>Please read these terms carefully before using our services.</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="terms-content">
            <h2>1. General Terms</h2>
            <p>
              By accessing and using the website of The Glassy Touch, you accept and agree to be bound 
              by these Terms and Conditions. If you do not agree to these terms, please do not use our website.
            </p>

            <h2>2. Products & Pricing</h2>
            <p>
              All product images on our website are for representation purposes. Actual colors may vary 
              slightly due to screen settings. Prices are listed in Indian Rupees (INR) and are inclusive 
              of applicable taxes unless stated otherwise.
            </p>
            <p>
              We reserve the right to change prices at any time without prior notice. The price applicable 
              to your order will be the price displayed at the time of purchase.
            </p>

            <h2>3. Orders & Payment</h2>
            <ul>
              <li>All orders are subject to product availability.</li>
              <li>We accept payments through Razorpay (UPI, credit/debit cards, net banking, wallets).</li>
              <li>Once an order is placed and payment is confirmed, you will receive an order confirmation email.</li>
              <li>We reserve the right to cancel an order if there is a pricing error or stock issue.</li>
            </ul>

            <h2>4. Shipping & Delivery</h2>
            <p>
              We aim to deliver within 2-7 business days depending on your location. Delivery times may 
              vary due to unforeseen circumstances. All fragile items are carefully packed with multiple 
              layers of protection.
            </p>

            <h2>5. Returns & Refunds</h2>
            <ul>
              <li>If you receive a damaged or defective product, contact us within 48 hours with photographs.</li>
              <li>We will either replace the product or issue a refund after verification.</li>
              <li>Returns due to change of mind are not applicable for fragile or personalized items.</li>
              <li>Refunds, if approved, will be processed within 7-10 business days to the original payment method.</li>
            </ul>

            <h2>6. Privacy Policy</h2>
            <p>
              We collect personal information (name, email, phone, address) solely for order processing 
              and communication. Your information is never sold to third parties. Payment details are 
              handled securely by Razorpay and are never stored on our servers.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              All content on this website, including text, images, logos, and design, is the property 
              of The Glassy Touch and is protected by copyright laws. Unauthorized use or reproduction 
              is prohibited.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              The Glassy Touch shall not be liable for any indirect, incidental, or consequential damages 
              arising from the use of our website or products. Our total liability is limited to the 
              purchase price of the product in question.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              For any queries, concerns, or disputes regarding these terms, please contact us at:<br />
              📧 info@theglassytouch.com<br />
              📞 +91-XXXXXXXXXX
            </p>

            <p style={{ marginTop: '40px', color: 'var(--text-light)', fontStyle: 'italic' }}>
              Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
