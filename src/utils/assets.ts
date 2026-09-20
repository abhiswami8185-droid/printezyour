/**
 * Resolves static assets (images, logos, icons) cleanly across all deployment targets:
 * - Root domains (e.g. https://printezyour.com)
 * - Sub-path deployments (e.g. https://username.github.io/printezyour/)
 * - Cloudflare Pages, Netlify, Vercel
 * - Node.js fullstack hosting (Hostinger, VPS, Cloud Run)
 */
export function getAssetUrl(path: string | undefined | null): string {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';

  // Return external or inline protocols directly
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Remove leading slash to resolve cleanly against base URL
  const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;

  // import.meta.env.BASE_URL is provided by Vite (e.g. './' or '/printezyour/' or '/')
  let base = import.meta.env.BASE_URL || './';
  if (!base.endsWith('/')) {
    base = `${base}/`;
  }

  return `${base}${cleanPath}`;
}
