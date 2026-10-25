'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="thank-you-container">
      <div className="thank-you-card">
        <div className="thank-you-icon">🎉</div>
        <h1>Thank You for Your Order!</h1>
        <p>
          Thanks for placing the order, we are now working on your order. 
          You will receive updates on your registered email.
        </p>
        {orderId && (
          <div className="thank-you-order-id">
            Order ID: {orderId}
          </div>
        )}
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
          📧 A confirmation email has been sent to your registered email address 
          with your complete order details.
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
          For any queries, feel free to reach out to us at info@theglassytouch.com
        </p>
        <Link href="/" className="btn-back-home">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="thank-you-container">
        <div className="loading-spinner"></div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
