import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { PermissionKey, User, RoleDefinition } from '../src/types';

// Password Hashing with Scrypt and Salt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    if (!combinedHash || !combinedHash.includes(':')) return false;
    const [salt, key] = combinedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKeyBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKeyBuffer);
  } catch (err) {
    return false;
  }
}

// Session Token Manager with Persistent Storage
interface ActiveSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

class SessionManager {
  private sessions = new Map<string, ActiveSession>();

  constructor() {
    this.loadSessions();
  }

  private loadSessions() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        const list: ActiveSession[] = JSON.parse(raw);
        const now = Date.now();
        if (Array.isArray(list)) {
          for (const s of list) {
            if (s && s.token && s.userId && s.expiresAt > now) {
              this.sessions.set(s.token, s);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not load existing sessions, initializing fresh session store');
    }
  }

  private persistSessions() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const now = Date.now();
      const validSessions: ActiveSession[] = [];
      for (const s of this.sessions.values()) {
        if (s.expiresAt > now) {
          validSessions.push(s);
        }
      }
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(validSessions, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist sessions to disk', e);
    }
  }

  public createSession(userId: string): string {
    const token = `pz_sec_${crypto.randomBytes(32).toString('hex')}_${Date.now()}`;
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days expiration
    const session: ActiveSession = {
      token,
      userId,
      createdAt: now,
      expiresAt
    };
    this.sessions.set(token, session);
    this.persistSessions();
    return token;
  }

  public validateSession(token: string): string | null {
    if (!token || typeof token !== 'string') return null;

    const session = this.sessions.get(token);
    if (!session) {
      return null;
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      this.persistSessions();
      return null;
    }

    return session.userId;
  }

  public revokeSession(token: string): void {
    if (token && this.sessions.has(token)) {
      this.sessions.delete(token);
      this.persistSessions();
    }
  }
}

const sessionManager = new SessionManager();

export function generateToken(userId: string): string {
  return sessionManager.createSession(userId);
}

export function validateSessionToken(token: string): string | null {
  return sessionManager.validateSession(token);
}

export function revokeSessionToken(token: string): void {
  sessionManager.revokeSession(token);
}

// All Available System Permissions
export const ALL_PERMISSIONS: PermissionKey[] = [
  'dashboard.view',
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
  'users.activate',
  'users.deactivate',
  'roles.view',
  'roles.create',
  'roles.edit',
  'roles.delete',
  'roles.permissions',
  'products.view',
  'products.create',
  'products.edit',
  'products.delete',
  'products.pricing',
  'products.inventory',
  'products.activate',
  'products.archive',
  'orders.view',
  'orders.create',
  'orders.edit',
  'orders.status',
  'orders.cancel',
  'orders.refund',
  'inventory.view',
  'inventory.create',
  'inventory.edit',
  'inventory.adjust',
  'inventory.consume',
  'inventory.purchase',
  'purchases.view',
  'purchases.create',
  'purchases.edit',
  'purchases.receive',
  'customers.view',
  'customers.create',
  'customers.edit',
  'quotes.view',
  'quotes.create',
  'quotes.edit',
  'quotes.approve',
  'quotes.convert',
  'reports.view',
  'reports.export',
  'settings.view',
  'settings.edit',
  'content.view',
  'content.edit',
  'audit.view'
];

// Compute Effective Permissions: (RolePermissions + Granted) - Revoked
export function computeEffectivePermissions(
  user: User,
  roles: RoleDefinition[]
): PermissionKey[] {
  // Super Admin / Owner has all permissions unconditionally
  if (user.role === 'SUPER_ADMIN' || user.role.toLowerCase() === 'owner') {
    return [...ALL_PERMISSIONS];
  }

  const roleDef = roles.find(r => r.id === user.role);
  const basePermissions = roleDef ? roleDef.permissions : [];

  const granted = user.grantedPermissions || [];
  const revoked = user.revokedPermissions || [];

  const combined = new Set<PermissionKey>([...basePermissions, ...granted]);
  revoked.forEach(p => combined.delete(p));

  return Array.from(combined);
}
