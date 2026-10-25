import { NextResponse } from 'next/server';
import { getAllProducts, getFeaturedProducts, createProduct } from '@/lib/db';
import { authenticateAdmin } from '@/lib/auth';

// GET /api/products — fetch products (optionally filter by category or featured)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    let products;
    if (featured === 'true') {
      products = getFeaturedProducts();
    } else {
      products = getAllProducts(category);
    }

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products — create a new product (admin only)
export async function POST(request) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, original_price, category, image_url, featured } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ success: false, error: 'Name, price, and category are required' }, { status: 400 });
    }

    if (!['crockery', 'gifts'].includes(category)) {
      return NextResponse.json({ success: false, error: 'Category must be "crockery" or "gifts"' }, { status: 400 });
    }

    const product = createProduct({ name, description, price, original_price, category, image_url, featured });
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
