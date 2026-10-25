import { NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/db';
import { authenticateAdmin } from '@/lib/auth';

// GET /api/orders — fetch all orders (admin only)
export async function GET(request) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const orders = getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}
