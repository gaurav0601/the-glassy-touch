import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminByUsername } from '@/lib/db';
import { generateToken } from '@/lib/auth';

// Rate limiting (in-memory, simple)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  if (!attempts) return { allowed: true };
  
  // Clean up expired entries
  if (now - attempts.firstAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    const remainingMs = LOCKOUT_DURATION - (now - attempts.firstAttempt);
    return { allowed: false, remainingMs };
  }

  return { allowed: true };
}

function recordAttempt(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, firstAttempt: now };
  attempts.count++;
  loginAttempts.set(ip, attempts);
}

function clearAttempts(ip) {
  loginAttempts.delete(ip);
}

// POST /api/auth/login
export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      const minutes = Math.ceil(rateCheck.remainingMs / 60000);
      return NextResponse.json({
        success: false,
        error: `Too many login attempts. Please try again in ${minutes} minutes.`
      }, { status: 429 });
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
    }

    const admin = getAdminByUsername(username);
    if (!admin) {
      recordAttempt(ip);
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      recordAttempt(ip);
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Clear rate limit on success
    clearAttempts(ip);

    const token = generateToken({ id: admin.id, username: admin.username });

    const response = NextResponse.json({
      success: true,
      token,
      admin: { id: admin.id, username: admin.username },
    });

    // Set HTTP-only cookie as well
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
