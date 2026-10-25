import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const TOKEN_EXPIRY = '24h';

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // Also check cookies
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('admin_token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1].trim();
    }
  }
  return null;
}

export function authenticateAdmin(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { authenticated: false, error: 'No token provided' };
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }
  return { authenticated: true, admin: decoded };
}
