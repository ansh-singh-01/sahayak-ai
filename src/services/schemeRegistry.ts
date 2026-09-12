import { Scheme } from '../types/scheme';
import { REAL_MOSJE_SCHEMES } from '../data/schemesData';

const LOCAL_STORAGE_KEY = 'sahayak_custom_channel_schemes';
const LISTENERS: Set<() => void> = new Set();

export class SchemeRegistryService {
  private static customSchemesCache: Scheme[] | null = null;

  /**
   * Get all custom schemes registered by SCAs and Banks
   */
  public static getCustomSchemes(): Scheme[] {
    if (this.customSchemesCache !== null) {
      return this.customSchemesCache;
    }

    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.customSchemesCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load custom schemes from localStorage:', e);
    }

    this.customSchemesCache = [];
    return [];
  }

  /**
   * Get all schemes (Base MoSJE Apex schemes + Custom Channel Provider schemes)
   */
  public static getAllSchemes(): Scheme[] {
    const custom = this.getCustomSchemes();
    // Return custom schemes at the front so newly added ones are immediately prominent
    return [...custom, ...REAL_MOSJE_SCHEMES];
  }

  /**
   * Register a new scheme submitted by an SCA or Bank Channel Provider
   */
  public static addScheme(scheme: Scheme): Scheme {
    const custom = this.getCustomSchemes();
    
    // Ensure unique ID
    const existsIndex = custom.findIndex(s => s.id === scheme.id || s.code === scheme.code);
    let updated: Scheme[];
    if (existsIndex >= 0) {
      updated = [...custom];
      updated[existsIndex] = scheme;
    } else {
      updated = [scheme, ...custom];
    }

    this.customSchemesCache = updated;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save scheme to localStorage:', e);
      }
    }

    // Try background sync with backend API
    this.syncSchemeToBackend(scheme).catch(() => {});

    // Notify all subscribed components
    this.notifyListeners();

    return scheme;
  }

  /**
   * Delete a custom scheme
   */
  public static deleteScheme(schemeId: string): boolean {
    const custom = this.getCustomSchemes();
    const updated = custom.filter(s => s.id !== schemeId);

    if (updated.length === custom.length) return false;

    this.customSchemesCache = updated;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update localStorage after deletion:', e);
      }
    }

    this.notifyListeners();
    return true;
  }

  /**
   * Subscribe to scheme registry updates
   */
  public static subscribe(listener: () => void): () => void {
    LISTENERS.add(listener);
    return () => {
      LISTENERS.delete(listener);
    };
  }

  private static notifyListeners() {
    LISTENERS.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error('Error notifying scheme registry listener:', e);
      }
    });
  }

  /**
   * Background POST to server if available
   */
  private static async syncSchemeToBackend(scheme: Scheme): Promise<void> {
    const API_BASE_URL = typeof window !== 'undefined' 
      ? (window.location.origin.includes(':3000') ? 'http://127.0.0.1:5000/api' : '/api') 
      : 'http://127.0.0.1:5000/api';

    try {
      await fetch(`${API_BASE_URL}/schemes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheme)
      });
    } catch (e) {
      // Backend may be offline or unreachable; localStorage is our reliable source of truth
    }
  }
}
