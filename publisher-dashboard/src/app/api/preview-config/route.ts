import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const configuredUrl = process.env.FRONTEND_PREVIEW_URL;

  // Production fallback: same-origin /preview-site proxy (host injects
  // X-Frame-Options: SAMEORIGIN on all domains, so the CMS must iframe its
  // own origin, which reverse-proxies the frontend).
  const fallback = `${req.nextUrl.origin}/preview-site`;

  try {
    const url = new URL(configuredUrl || fallback);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
      throw new Error('Unsupported frontend preview URL');
    }

    const pathname = url.pathname.replace(/\/+$/, '');
    return NextResponse.json({ frontendUrl: `${url.origin}${pathname}` });
  } catch (error) {
    console.error('[preview-config] Invalid FRONTEND_PREVIEW_URL:', error);
    return NextResponse.json(
      { error: 'Frontend preview URL is not configured correctly.' },
      { status: 500 },
    );
  }
}
