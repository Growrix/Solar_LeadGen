function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const wpEnv = {
  baseUrl: () => requireEnv('WP_BASE_URL').replace(/\/$/, ''),
  jwtUsername: () => requireEnv('WP_JWT_USERNAME'),
  jwtPassword: () => requireEnv('WP_JWT_PASSWORD'),
  tokenCacheSeconds: () => {
    const raw = process.env.WP_JWT_TOKEN_CACHE_SECONDS;
    if (!raw) return 50 * 60; // default: 50 minutes
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return 50 * 60;
    return Math.floor(n);
  },
};
