import { wpEnv } from './env';
import { getWpJwtToken } from './jwt';

type NextFetchOptions = {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

export type WpFetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
} & NextFetchOptions;

export async function wpFetch<T>(
  wpJsonPath: string,
  options: WpFetchOptions = {}
): Promise<{ data: T; response: Response }> {
  const token = await getWpJwtToken();

  const url = `${wpEnv.baseUrl()}/wp-json${wpJsonPath.startsWith('/') ? '' : '/'}${wpJsonPath}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
    ...(options.cache ? { cache: options.cache } : {}),
    ...(options.next ? { next: options.next } : {}),
    ...(options.cache || options.next ? {} : { cache: 'no-store' }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`WP fetch failed (${res.status}) ${url}: ${text}`);
  }

  const data = JSON.parse(text) as T;
  return { data, response: res };
}
