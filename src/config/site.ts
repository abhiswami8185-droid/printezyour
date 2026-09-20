export interface ClientSiteConfig {
  publicSiteUrl: string;
  adminSiteUrl: string;
  isDifferentDomain: boolean;
  isAdminDomain: boolean;
}

/**
 * Resolves the public storefront URL for the client.
 * Priority:
 * 1. import.meta.env.VITE_PUBLIC_SITE_URL (if provided at build/deploy time)
 * 2. Current browser window location (safely adapting to development, preview, or production host)
 * 3. Fallback http://localhost:3000
 */
export function getPublicSiteUrl(): string {
  // Check build-time environment variable if configured with a real domain (ignoring non-existent placeholders)
  const envUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (!trimmed.includes('.ai.studio') && !trimmed.includes('example.com')) {
      return trimmed;
    }
  }

  // Safe browser runtime resolution in dev/preview
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, host, hostname } = window.location;
    if (hostname.toLowerCase().startsWith('admin.')) {
      const publicHost = host.replace(/^admin\./i, '');
      return `${protocol}//${publicHost}`;
    }
    const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
    const cleanBase = (base === '.' || base === './') ? '' : base;
    return `${window.location.origin}${cleanBase}`;
  }

  return 'http://localhost:3000';
}

/**
 * Resolves the admin back-office URL for the client.
 * Priority:
 * 1. import.meta.env.VITE_ADMIN_SITE_URL (if provided with a real production domain)
 * 2. Current window origin if already on an admin subdomain
 * 3. Safe development/subpath fallback: /#/admin on the current origin
 */
export function getAdminSiteUrl(): string {
  // Check build-time environment variable if configured with a real domain
  const envUrl = import.meta.env.VITE_ADMIN_SITE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (!trimmed.includes('.ai.studio') && !trimmed.includes('example.com')) {
      return trimmed;
    }
  }

  // Safe browser runtime resolution
  if (typeof window !== 'undefined' && window.location) {
    const { origin, hostname } = window.location;
    if (hostname.toLowerCase().startsWith('admin.')) {
      return origin;
    }
    const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
    const cleanBase = (base === '.' || base === './') ? '' : base;
    return `${origin}${cleanBase}/#/admin`;
  }

  return 'http://localhost:3000/#/admin';
}

/**
 * Determines if the current window is loaded on an admin domain.
 */
export function isCurrentlyAdminDomain(): boolean {
  if (typeof window === 'undefined' || !window.location) {
    return false;
  }
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.startsWith('admin.')) {
    return true;
  }

  const configuredAdmin = import.meta.env.VITE_ADMIN_SITE_URL;
  if (configuredAdmin && !configuredAdmin.includes('.ai.studio')) {
    try {
      const adminUrl = new URL(configuredAdmin);
      if (adminUrl.hostname.toLowerCase() === hostname) {
        return true;
      }
    } catch {
      // ignore invalid URL
    }
  }

  return false;
}

/**
 * Determines whether the admin site lives on a distinct external domain
 * compared to the current window origin.
 */
export function hasDistinctAdminDomain(): boolean {
  try {
    const adminUrl = new URL(getAdminSiteUrl());
    if (typeof window !== 'undefined' && window.location) {
      return adminUrl.origin !== window.location.origin;
    }
  } catch {
    // If not a full URL or same origin
  }
  return false;
}

/**
 * Smart navigation to Admin:
 * - If on a distinct domain in production, redirects to the admin domain.
 * - In development/preview or single-origin, calls the local SPA navigation handler.
 */
export function navigateToAdmin(localNavigate?: () => void): void {
  const adminUrl = getAdminSiteUrl();
  try {
    const targetOrigin = new URL(adminUrl).origin;
    if (typeof window !== 'undefined' && targetOrigin !== window.location.origin) {
      window.location.href = adminUrl;
      return;
    }
  } catch {
    // Fallback to local navigation
  }

  if (localNavigate) {
    localNavigate();
  } else if (typeof window !== 'undefined') {
    window.location.hash = '#/admin';
  }
}

/**
 * Smart navigation to Storefront:
 * - If currently on an admin subdomain with distinct origin, redirects to the storefront domain.
 * - In development/preview or single-origin, calls the local SPA navigation handler.
 */
export function navigateToStorefront(localNavigate?: () => void): void {
  const publicUrl = getPublicSiteUrl();
  try {
    const targetOrigin = new URL(publicUrl).origin;
    if (typeof window !== 'undefined' && targetOrigin !== window.location.origin) {
      window.location.href = publicUrl;
      return;
    }
  } catch {
    // Fallback to local navigation
  }

  if (localNavigate) {
    localNavigate();
  } else if (typeof window !== 'undefined') {
    window.location.hash = '#/home';
  }
}
