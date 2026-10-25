import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// POST /api/upload — upload a file (admin only)
export async function POST(request) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}`
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 });
    }

    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Generate safe filename
    const ext = path.extname(file.name).toLowerCase();
    const safeName = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/${safeName}`;

    return NextResponse.json({
      success: true,
      url,
      filename: safeName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
