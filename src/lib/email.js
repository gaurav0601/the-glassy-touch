import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendOrderConfirmationEmail(order) {
  const mailer = getTransporter();

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-family: 'Inter', sans-serif;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-family: 'Inter', sans-serif;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-family: 'Inter', sans-serif;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f6f3; font-family: 'Inter', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0a1628 0%, #1a2744 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #d4a853; margin: 0; font-family: 'Playfair Display', serif; font-size: 28px; letter-spacing: 2px;">
            ✨ The Glassy Touch
          </h1>
          <p style="color: rgba(255,255,255,0.7); margin-top: 8px; font-size: 14px;">Elegance in Every Piece</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #0a1628; margin: 0 0 10px; font-family: 'Playfair Display', serif; font-size: 22px;">
            Thank You for Your Order! 🎉
          </h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Dear <strong>${order.customer_name}</strong>, your order has been placed successfully. We are now working on preparing your order with utmost care.
          </p>

          <!-- Order Details -->
          <div style="background: #faf8f5; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #0a1628; margin: 0 0 15px; font-size: 16px;">📦 Order Details</h3>
            <p style="margin: 5px 0; color: #444;"><strong>Order ID:</strong> ${order.order_id}</p>
            <p style="margin: 5px 0; color: #444;"><strong>Payment ID:</strong> ${order.razorpay_payment_id || 'N/A'}</p>
            <p style="margin: 5px 0; color: #444;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background: #0a1628;">
                <th style="padding: 12px; text-align: left; color: #d4a853; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                <th style="padding: 12px; text-align: center; color: #d4a853; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                <th style="padding: 12px; text-align: right; color: #d4a853; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 15px 12px; font-weight: 700; font-size: 16px; color: #0a1628;">Total</td>
                <td style="padding: 15px 12px; text-align: right; font-weight: 700; font-size: 16px; color: #d4a853;">₹${order.total_amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Shipping Address -->
          <div style="background: #faf8f5; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #0a1628; margin: 0 0 10px; font-size: 16px;">📍 Shipping Address</h3>
            <p style="color: #444; line-height: 1.6; margin: 0;">${order.customer_address}</p>
          </div>

          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If you have any questions about your order, feel free to reach out to us at
            <a href="mailto:${process.env.STORE_EMAIL}" style="color: #d4a853; text-decoration: none;">${process.env.STORE_EMAIL}</a>
            or call us at <strong>${process.env.STORE_PHONE}</strong>.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #0a1628; padding: 30px; text-align: center;">
          <p style="color: #d4a853; margin: 0 0 8px; font-family: 'Playfair Display', serif; font-size: 16px;">The Glassy Touch</p>
          <p style="color: rgba(255,255,255,0.5); margin: 0; font-size: 12px;">${process.env.STORE_ADDRESS || ''}</p>
          <p style="color: rgba(255,255,255,0.3); margin-top: 15px; font-size: 11px;">
            © ${new Date().getFullYear()} The Glassy Touch. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: order.customer_email,
      subject: `✨ Order Confirmed - ${order.order_id} | The Glassy Touch`,
      html: htmlContent,
    });
    console.log(`Order confirmation email sent to ${order.customer_email}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendEnquiryNotification(enquiry) {
  const mailer = getTransporter();
  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.STORE_EMAIL || process.env.SMTP_USER,
      subject: `New Enquiry from ${enquiry.name} | The Glassy Touch`,
      html: `
        <h2>New Enquiry Received</h2>
        <p><strong>Name:</strong> ${enquiry.name}</p>
        <p><strong>Email:</strong> ${enquiry.email}</p>
        <p><strong>Phone:</strong> ${enquiry.phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${enquiry.message}</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send enquiry notification:', error);
    return false;
  }
}
