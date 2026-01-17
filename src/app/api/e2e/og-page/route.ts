import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/e2e/og-page
// Dev-only helper endpoint that returns HTML with an og:image meta tag.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta property="og:image" content="/api/e2e/test-image" />
    <meta name="twitter:image" content="/api/e2e/test-image" />
    <title>E2E OG Image Page</title>
  </head>
  <body>
    <h1>E2E OG Image Page</h1>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
