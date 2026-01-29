import { wpFetch } from './wpFetch';

export type WpCategory = {
  id: number;
  name: string;
  slug: string;
  count?: number;
};

export async function getWpCategories(options?: { perPage?: number; hideEmpty?: boolean; revalidateSeconds?: number }): Promise<WpCategory[]> {
  const qs = new URLSearchParams();
  qs.set('per_page', String(options?.perPage ?? 100));
  qs.set('orderby', 'count');
  qs.set('order', 'desc');
  if (options?.hideEmpty ?? true) qs.set('hide_empty', 'true');

  const { data } = await wpFetch<WpCategory[]>(`/wp/v2/categories?${qs.toString()}`, {
    next: { revalidate: options?.revalidateSeconds ?? 300 },
  });

  return Array.isArray(data) ? data : [];
}
