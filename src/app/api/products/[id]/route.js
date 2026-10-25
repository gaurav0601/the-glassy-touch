import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db';
import { authenticateAdmin } from '@/lib/auth';

// GET /api/products/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = getProductById(parseInt(id));
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id] — update product (admin only)
export async function PUT(request, { params }) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const product = updateProduct(parseInt(id), body);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] — delete product (admin only)
export async function DELETE(request, { params }) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const product = deleteProduct(parseInt(id));
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
