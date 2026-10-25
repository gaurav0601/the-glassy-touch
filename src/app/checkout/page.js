'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import Script from 'next/script';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotal, clearCart, isLoaded } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoaded && cart.length === 0) {
      router.push('/cart');
    }
  }, [isLoaded, cart, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Please enter your name';
    if (!formData.email.trim()) return 'Please enter your email';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email';
    if (!formData.phone.trim()) return 'Please enter your phone number';
    if (formData.phone.replace(/\D/g, '').length < 10) return 'Please enter a valid phone number';
    if (!formData.address.trim()) return 'Please enter your delivery address';
    return null;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create Razorpay order on backend
      const createRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_address: formData.address,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total_amount: getTotal(),
        }),
      });

      const createData = await createRes.json();

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create order');
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: createData.key_id,
        amount: createData.amount,
        currency: createData.currency,
        name: 'The Glassy Touch',
        description: 'Order Payment',
        order_id: createData.razorpay_order_id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#d4a853',
        },
        handler: async function (response) {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: createData.order_id,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              clearCart();
              router.push(`/thank-you?order_id=${createData.order_id}`);
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
          }
          setProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });
      razorpay.open();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  const total = getTotal();

  if (!isLoaded) {
    return (
      <>
        <section className="page-hero"><h1>Checkout</h1></section>
        <div className="loading-container"><div className="loading-spinner"></div></div>
      </>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <section className="page-hero">
        <h1>Secure <span style={{ color: 'var(--accent)' }}>Checkout</span></h1>
        <p>Complete your order details below</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="checkout-container">
            <form className="checkout-form" onSubmit={handlePayment}>
              <h2>📋 Your Details</h2>
              
              <div className="form-group">
                <label htmlFor="checkout-name">Full Name *</label>
                <input
                  id="checkout-name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkout-email">Email Address *</label>
                <input
                  id="checkout-email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkout-phone">Phone Number *</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  name="phone"
                  placeholder="+91-XXXXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkout-address">Delivery Address *</label>
                <textarea
                  id="checkout-address"
                  name="address"
                  placeholder="Enter your full delivery address with pincode"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {/* Order Summary */}
              <div className="checkout-order-summary">
                <h3>📦 Order Summary</h3>
                {cart.map(item => (
                  <div key={item.id} className="checkout-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="checkout-total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {error && (
                <p style={{ color: 'var(--error)', textAlign: 'center', marginTop: '16px', padding: '10px', background: 'rgba(231,76,60,0.08)', borderRadius: '8px', fontSize: '0.9rem' }}>
                  {error}
                </p>
              )}

              <button type="submit" className="btn-pay" disabled={processing}>
                {processing ? (
                  <><span className="spinner"></span> Processing...</>
                ) : (
                  <>🔒 Pay ₹{total.toLocaleString('en-IN')} Securely</>
                )}
              </button>

              <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                🔐 Secured by Razorpay — 256-bit SSL encryption
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
