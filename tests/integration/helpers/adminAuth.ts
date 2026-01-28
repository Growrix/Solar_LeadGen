const ADMIN_CREDENTIALS = {
  email: 'admin@solarmatch.com',
  password: 'Admin123!Secure',
};

export function getIntegrationOrigin(): string {
  return process.env.INTEGRATION_BASE_URL || process.env.E2E_BASE_URL || 'http://localhost:3000';
}

function getSetCookieValues(response: Response): string[] {
  const headersAny = response.headers as unknown as { getSetCookie?: () => string[] };
  if (typeof headersAny.getSetCookie === 'function') {
    return headersAny.getSetCookie();
  }

  const single = response.headers.get('set-cookie');
  return single ? [single] : [];
}

function mergeCookiePairs(pairs: string[]): string {
  const byName = new Map<string, string>();
  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const name = trimmed.slice(0, eq);
    byName.set(name, trimmed);
  }
  return Array.from(byName.values()).join('; ');
}

function extractCookiePairs(response: Response): string[] {
  return getSetCookieValues(response)
    .map((c) => c.split(';')[0])
    .filter(Boolean);
}

export async function loginAdminAndGetCookieHeader(origin: string): Promise<string> {
  await fetch(`${origin}/api/fix-admin`, { method: 'POST' });

  const csrfResp = await fetch(`${origin}/api/auth/csrf`);
  if (!csrfResp.ok) throw new Error(`Failed to fetch CSRF token: ${csrfResp.status}`);
  const csrfJson = (await csrfResp.json()) as { csrfToken?: string };
  if (!csrfJson.csrfToken) throw new Error('Missing csrfToken');

  const csrfCookiePairs = extractCookiePairs(csrfResp);
  const csrfCookieHeader = mergeCookiePairs(csrfCookiePairs);

  const form = new URLSearchParams();
  form.set('csrfToken', csrfJson.csrfToken);
  form.set('email', ADMIN_CREDENTIALS.email);
  form.set('password', ADMIN_CREDENTIALS.password);
  form.set('role', 'ADMIN');
  form.set('callbackUrl', '/admin/dashboard');
  form.set('json', 'true');

  const callbackResp = await fetch(`${origin}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      ...(csrfCookieHeader ? { cookie: csrfCookieHeader } : {}),
    },
    body: form.toString(),
    redirect: 'manual',
  });

  if (callbackResp.status >= 400) {
    throw new Error(`Admin login failed: ${callbackResp.status}`);
  }

  const callbackCookiePairs = extractCookiePairs(callbackResp);
  let cookieHeader = mergeCookiePairs([...csrfCookiePairs, ...callbackCookiePairs]);

  // NextAuth sometimes sets additional cookies on the redirect target.
  const redirectTo = callbackResp.headers.get('location');
  if (redirectTo) {
    const redirectUrl = redirectTo.startsWith('http') ? redirectTo : `${origin}${redirectTo}`;
    const followResp = await fetch(redirectUrl, {
      method: 'GET',
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      redirect: 'manual',
    });

    const followCookiePairs = extractCookiePairs(followResp);
    if (followCookiePairs.length > 0) {
      cookieHeader = mergeCookiePairs([...csrfCookiePairs, ...callbackCookiePairs, ...followCookiePairs]);
    }
  }

  if (!cookieHeader) {
    throw new Error('No session cookies returned from login');
  }

  const sessionResp = await fetch(`${origin}/api/auth/session`, {
    headers: { cookie: cookieHeader },
  });

  if (!sessionResp.ok) {
    throw new Error(`Failed to validate session: ${sessionResp.status}`);
  }

  const session = (await sessionResp.json()) as any;
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Session does not have ADMIN role');
  }

  return cookieHeader;
}
