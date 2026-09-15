export interface FaqItem { question: string; answer: string }
export function parseFaq(value: unknown): FaqItem[] {
  try {
    const parsed: unknown = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is FaqItem => !!item && typeof item === 'object' && typeof item.question === 'string' && typeof item.answer === 'string');
  } catch { return []; }
}

export function safeHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

const routes = new Set(['home','schedule','hosts','podcasts','about','faq']);
export function navigationTarget(value: string): { tab?: string; href?: string } | null {
  if (value.startsWith('#')) {
    const tab = value.replace(/^#\/?/, '') || 'home';
    return routes.has(tab) ? { tab } : null;
  }
  const href = safeHttpsUrl(value);
  return href ? { href } : null;
}
