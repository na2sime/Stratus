import type { StorageService as IStorageService } from '../types';

/**
 * Storage service for client-side data persistence
 */
export class LocalStorageService implements IStorageService {
  readonly name = 'LocalStorageService';
  private prefix: string;

  constructor(prefix = 'stratus_') {
    this.prefix = prefix;
  }

  get<T = any>(key: string): T | null {
    if (typeof window === 'undefined') {
      return null; // SSR safety
    }

    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set<T = any>(key: string, value: T): void {
    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  remove(key: string): void {
    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    localStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    // Only clear items with our prefix
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  has(key: string): boolean {
    if (typeof window === 'undefined') {
      return false; // SSR safety
    }

    return localStorage.getItem(this.getKey(key)) !== null;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

/**
 * Session storage service
 */
export class SessionStorageService implements IStorageService {
  readonly name = 'SessionStorageService';
  private prefix: string;

  constructor(prefix = 'stratus_') {
    this.prefix = prefix;
  }

  get<T = any>(key: string): T | null {
    if (typeof window === 'undefined') {
      return null; // SSR safety
    }

    try {
      const item = sessionStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set<T = any>(key: string, value: T): void {
    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    try {
      sessionStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
    }
  }

  remove(key: string): void {
    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    sessionStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    // Only clear items with our prefix
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        sessionStorage.removeItem(key);
      }
    });
  }

  has(key: string): boolean {
    if (typeof window === 'undefined') {
      return false; // SSR safety
    }

    return sessionStorage.getItem(this.getKey(key)) !== null;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

/**
 * In-memory storage service (for SSR or when storage is not available)
 */
export class MemoryStorageService implements IStorageService {
  readonly name = 'MemoryStorageService';
  private storage = new Map<string, any>();

  get<T = any>(key: string): T | null {
    return this.storage.get(key) || null;
  }

  set<T = any>(key: string, value: T): void {
    this.storage.set(key, value);
  }

  remove(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  has(key: string): boolean {
    return this.storage.has(key);
  }
}