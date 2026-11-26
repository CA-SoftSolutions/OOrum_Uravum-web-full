import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UPSTREAM = (process.env.FRONTEND_PREVIEW_UPSTREAM || 'https://oorumuravum.com').replace(/\/+$/, '');
const PREFIX = '/preview-site';

const SKIP_REQUEST_HEADERS = new Set([
  'host', 'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'accept-encoding', 'content-length',
]);
const SKIP_RESPONSE_HEADERS = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'content-encoding',
  'content-length', 'x-frame-options', 'content-security-policy',
  'content-security-policy-report-only',
]);

/**
 * Rewrites root-relative URLs in the proxied HTML so every asset, link and
 * RSC payload reference stays inside the /preview-site proxy prefix.
 */
function rewriteHtml(html: string): string {
  return html.replace(
    /((?:href|src|srcset|action|poster|data-src)=["'])\/(?!\/|preview-site\/)/g,
    `$1${PREFIX}/`,
  );
}

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  try {
    const { path } = await ctx.params;
    const segments = path ?? [];
    const upstreamUrl = `${UPSTREAM}/${segments.join('/')}${req.nextUrl.search}`;

    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (!SKIP_REQUEST_HEADERS.has(key.toLowerCase())) headers.set(key, value);
    });
    headers.set('accept-encoding', 'identity');
    headers.set('user-agent', 'OorumPreviewProxy/1.0');

    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      redirect: 'manual',
    });

    const outHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!SKIP_RESPONSE_HEADERS.has(key.toLowerCase())) outHeaders.set(key, value);
    });

    const location = upstream.headers.get('location');
    if (location && location.startsWith(UPSTREAM)) {
      outHeaders.set('location', `${PREFIX}${location.slice(UPSTREAM.length)}`);
    }

    const contentType = upstream.headers.get('content-type') || '';
    const body = await upstream.arrayBuffer();

    if (contentType.includes('text/html')) {
      const html = new TextDecoder().decode(body);
      outHeaders.delete('content-length');
      return new NextResponse(rewriteHtml(html), { status: upstream.status, headers: outHeaders });
    }

    return new NextResponse(body, { status: upstream.status, headers: outHeaders });
  } catch (error) {
    console.error('[preview-site] proxy error:', error);
    return NextResponse.json({ error: 'Preview upstream unavailable.' }, { status: 502 });
  }
}

export { proxy as GET, proxy as HEAD };
