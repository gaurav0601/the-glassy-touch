'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'What products does The Glassy Touch offer?',
    answer: 'We offer a wide range of premium crockery including dinner sets, tea sets, coffee mugs, bowls, plates, glasses, and serving ware. We also have a beautiful collection of gift items including decorative pieces, photo frames, showpieces, and personalized gifts perfect for any occasion.',
  },
  {
    question: 'Do you offer cash on delivery (COD)?',
    answer: 'Currently, we accept online payments through Razorpay which supports UPI, credit cards, debit cards, net banking, and wallets. We are working on adding COD as a payment option soon.',
  },
  {
    question: 'How do you pack fragile items?',
    answer: 'We take utmost care in packaging. Every fragile item is individually wrapped in bubble wrap, placed in thermocol, and then packed in a sturdy corrugated box. We use multiple layers of protection to ensure your products arrive in perfect condition.',
  },
  {
    question: 'What is your return/exchange policy?',
    answer: 'If you receive a damaged or defective product, please contact us within 48 hours of delivery with photos. We will arrange a replacement or refund. Please note that returns due to change of mind may not be applicable for fragile items.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Local deliveries are usually completed within 2-3 business days. For other cities, delivery takes 5-7 business days depending on the location. You will receive tracking details once your order is shipped.',
  },
  {
    question: 'Can I visit your physical store?',
    answer: 'Absolutely! We have a beautiful retail store where you can see and feel our products in person. Check our homepage for the store location and timings. We\'d love to welcome you!',
  },
  {
    question: 'Do you offer bulk/corporate orders?',
    answer: 'Yes! We offer special pricing for bulk and corporate orders. Whether it\'s for corporate gifting, events, or restaurant supplies, please reach out to us through our enquiry form or call us directly for a customized quote.',
  },
  {
    question: 'Is my payment secure?',
    answer: 'Absolutely. We use Razorpay as our payment gateway, which is PCI DSS compliant and uses bank-grade encryption. Your payment details are never stored on our servers. Every transaction is verified with a secure signature to prevent any tampering.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <section className="page-hero">
        <h1>Frequently Asked <span style={{ color: 'var(--accent)' }}>Questions</span></h1>
        <p>Got questions? We&apos;ve got answers.</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className={`faq-question ${openIndex === index ? 'active' : ''}`}
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">+</span>
                </button>
                <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
