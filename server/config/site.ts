import type { Request } from 'express';

export interface SiteConfig {
  publicSiteUrl: string;
  adminSiteUrl: string;
  isProduction: boolean;
  isCustomDomainConfigured: boolean;
}

/**
 * Returns the public storefront URL.
 * Priority:
 * 1. Explicit environment variable PUBLIC_SITE_URL
 * 2. Cloud Run / AI Studio preview environment variable APP_URL
 * 3. Incoming request host header (if available)
 * 4. Safe development fallback (http://localhost:3000)
 */
export function getServerPublicSiteUrl(req?: Request): string {
  // If explicitly provided via environment
  if (process.env.PUBLIC_SITE_URL && process.env.PUBLIC_SITE_URL.trim() !== '') {
    return process.env.PUBLIC_SITE_URL.trim().replace(/\/+$/, '');
  }

  // AI Studio automatically provides APP_URL in preview/dev
  if (process.env.APP_URL && process.env.APP_URL.trim() !== '') {
    return process.env.APP_URL.trim().replace(/\/+$/, '');
  }

  // Derive dynamically from request header in development/preview
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    if (host) {
      // If request came to an admin subdomain, strip admin. to get public site
      const publicHost = String(host).replace(/^admin\./i, '');
      return `${proto}://${publicHost}`;
    }
  }

  return 'http://localhost:3000';
}

/**
 * Returns the back-office admin URL.
 * Priority:
 * 1. Explicit environment variable ADMIN_SITE_URL
 * 2. If host on incoming request already starts with admin., use that host
 * 3. Safe development fallback: points to hash/path on public site (${publicSiteUrl}/#/admin)
 */
export function getServerAdminSiteUrl(req?: Request): string {
  // If explicitly provided via environment
  if (process.env.ADMIN_SITE_URL && process.env.ADMIN_SITE_URL.trim() !== '') {
    return process.env.ADMIN_SITE_URL.trim().replace(/\/+$/, '');
  }

  // Check if incoming request is already hitting an admin subdomain
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    if (host && String(host).toLowerCase().startsWith('admin.')) {
      return `${proto}://${host}`;
    }
  }

  // In development/preview or single-domain environments, safely route via hash
  const publicUrl = getServerPublicSiteUrl(req);
  return `${publicUrl}/#/admin`;
}

export function getSiteConfig(req?: Request): SiteConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasPublicEnv = Boolean(process.env.PUBLIC_SITE_URL && process.env.PUBLIC_SITE_URL.trim() !== '');
  const hasAdminEnv = Boolean(process.env.ADMIN_SITE_URL && process.env.ADMIN_SITE_URL.trim() !== '');

  return {
    publicSiteUrl: getServerPublicSiteUrl(req),
    adminSiteUrl: getServerAdminSiteUrl(req),
    isProduction,
    isCustomDomainConfigured: hasPublicEnv && hasAdminEnv
  };
}
