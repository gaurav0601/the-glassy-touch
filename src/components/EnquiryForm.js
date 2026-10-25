'use client';

import { useState } from 'react';

export default function EnquiryForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, sending, sent, error
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('sent');
        setStatusMessage(data.message);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Failed to submit. Please try again.');
    }
  };

  return (
    <form className="enquiry-form" onSubmit={handleSubmit} id="enquiry">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="enquiry-name">Your Name *</label>
          <input
            id="enquiry-name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="enquiry-email">Email Address *</label>
          <input
            id="enquiry-email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="enquiry-phone">Phone Number</label>
        <input
          id="enquiry-phone"
          type="tel"
          placeholder="+91-XXXXXXXXXX"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label htmlFor="enquiry-message">Your Message *</label>
        <textarea
          id="enquiry-message"
          placeholder="Tell us what you're looking for..."
          rows="4"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
        ></textarea>
      </div>
      <button type="submit" className="btn-submit-enquiry" disabled={status === 'sending'}>
        {status === 'sending' ? (
          <><span className="spinner"></span> Sending...</>
        ) : status === 'sent' ? (
          '✓ Sent Successfully!'
        ) : (
          '✉️ Send Enquiry'
        )}
      </button>
      {statusMessage && (
        <p className={`form-status ${status}`}>{statusMessage}</p>
      )}
    </form>
  );
}
