import { NextResponse } from 'next/server';
import { trackVisitor, getActiveVisitorCount } from '@/lib/live-store';
import { headers } from 'next/headers';

export async function POST(request: Request) {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    // Use IP as ID, falling back to a random ID if not available (local env often hides IP)
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    const body = await request.json();
    const path = body.path || '/';

    // Create a somewhat unique key for "User" based on IP and UA to distinct browsers
    // In a real app, we might use a session cookie.
    const visitorId = `${ip}-${userAgent}`;

    trackVisitor(visitorId, userAgent, path);

    return NextResponse.json({
        success: true,
        visitors: getActiveVisitorCount() // Return current count so client can see it if needed
    });
}

export async function GET() {
    return NextResponse.json({
        visitors: getActiveVisitorCount()
    });
}
