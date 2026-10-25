import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateOrderPayment, getOrderById } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';

// POST /api/payment/verify — verify Razorpay payment signature
export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return NextResponse.json({ success: false, error: 'Missing payment details' }, { status: 400 });
    }

    // ========================
    // CRITICAL SECURITY CHECK
    // Verify payment signature using HMAC SHA256
    // This ensures the payment response hasn't been tampered with
    // ========================
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error('Payment signature verification failed!', {
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
      });

      await updateOrderPayment(order_id, {
        razorpay_payment_id,
        razorpay_signature,
        status: 'cancelled',
      });

      return NextResponse.json({
        success: false,
        error: 'Payment verification failed. The payment signature is invalid.'
      }, { status: 400 });
    }

    // Payment is authentic — update order status
    const order = await updateOrderPayment(order_id, {
      razorpay_payment_id,
      razorpay_signature,
      status: 'paid',
    });

    // Send confirmation email (async, don't block response)
    const fullOrder = getOrderById(order_id);
    if (fullOrder) {
      sendOrderConfirmationEmail(fullOrder).catch(err =>
        console.error('Failed to send confirmation email:', err)
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order_id: order_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 500 });
  }
}
