/**
 * Safe browser storage utilities that work during SSR
 * These utilities check if code is running in a browser environment
 * before accessing localStorage or sessionStorage
 */

export const isBrowser = typeof window !== 'undefined';

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
    }
  },
  clear: (): void => {
    if (!isBrowser) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('localStorage.clear failed:', error);
    }
  }
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('sessionStorage.getItem failed:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn('sessionStorage.setItem failed:', error);
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('sessionStorage.removeItem failed:', error);
    }
  },
  clear: (): void => {
    if (!isBrowser) return;
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('sessionStorage.clear failed:', error);
    }
  }
};

/**
 * Safe JSON storage utilities
 */
export const safeJsonStorage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    const item = safeLocalStorage.getItem(key);
    if (!item) return defaultValue;
    try {
      return JSON.parse(item);
    } catch (error) {
      console.warn('JSON.parse failed for key:', key, error);
      return defaultValue;
    }
  },
  setItem: <T>(key: string, value: T): void => {
    try {
      safeLocalStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('JSON.stringify failed for key:', key, error);
    }
  }
};

export const safeJsonSessionStorage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    const item = safeSessionStorage.getItem(key);
    if (!item) return defaultValue;
    try {
      return JSON.parse(item);
    } catch (error) {
      console.warn('JSON.parse failed for key:', key, error);
      return defaultValue;
    }
  },
  setItem: <T>(key: string, value: T): void => {
    try {
      safeSessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('JSON.stringify failed for key:', key, error);
    }
  }
};

