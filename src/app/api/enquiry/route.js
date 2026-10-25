import { NextResponse } from 'next/server';
import { createEnquiry } from '@/lib/db';
import { sendEnquiryNotification } from '@/lib/email';

// POST /api/enquiry
export async function POST(request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and message are required'
      }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    const enquiry = createEnquiry({ name, email, phone, message });

    // Send notification to store (async, don't block response)
    sendEnquiryNotification(enquiry).catch(err => console.error('Enquiry email failed:', err));

    return NextResponse.json({
      success: true,
      message: 'Enquiry submitted successfully! We will get back to you soon.'
    }, { status: 201 });
  } catch (error) {
    console.error('Enquiry error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit enquiry' }, { status: 500 });
  }
}
