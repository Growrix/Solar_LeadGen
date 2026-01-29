import { wpEnv } from './env';

type JwtTokenResponse = {
  token: string;
  user_email?: string;
  user_nicename?: string;
  user_display_name?: string;
};

let cachedToken: { token: string; expiresAtMs: number } | null = null;

export async function getWpJwtToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAtMs > now + 10_000) {
    return cachedToken.token;
  }

  const url = `${wpEnv.baseUrl()}/wp-json/jwt-auth/v1/token`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: wpEnv.jwtUsername(),
      password: wpEnv.jwtPassword(),
    }),
    cache: 'no-store',
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`WP JWT token request failed (${res.status}): ${text}`);
  }

  const data = JSON.parse(text) as JwtTokenResponse;
  if (!data?.token) {
    throw new Error('WP JWT token response missing token');
  }

  cachedToken = {
    token: data.token,
    expiresAtMs: now + wpEnv.tokenCacheSeconds() * 1000,
  };

  return data.token;
}
