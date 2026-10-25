import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createOrder } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create — create a Razorpay order
export async function POST(request) {
  try {
    const { customer_name, customer_email, customer_phone, customer_address, items, total_amount } = await request.json();

    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || !customer_address) {
      return NextResponse.json({ success: false, error: 'All customer details are required' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    if (!total_amount || total_amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total_amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `order_${uuidv4().slice(0, 8)}`,
      notes: {
        customer_name,
        customer_email,
        customer_phone,
      },
    });

    // Create order in database (status: pending)
    const order_id = `GT-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;
    const order = createOrder({
      order_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      total_amount,
      items: items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      razorpay_order_id: razorpayOrder.id,
    });

    return NextResponse.json({
      success: true,
      razorpay_order_id: razorpayOrder.id,
      order_id: order.order_id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create payment order' }, { status: 500 });
  }
}
