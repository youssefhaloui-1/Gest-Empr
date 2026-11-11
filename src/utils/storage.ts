export const STORAGE_KEYS = {
  authEmail: "athenaeum.authEmail",
  authRole: "athenaeum.authRole",
  authMode: "athenaeum.authMode",
  rememberSession: "athenaeum.rememberSession",
  books: "athenaeum.books",
  loans: "athenaeum.loans",
  reservations: "athenaeum.reservations",
  favorites: "athenaeum.favorites",
  returnHistory: "athenaeum.returnHistory",
} as const;

export type UserRole = "manager" | "consultant";
export type AuthMode = "email" | "demo";

export function readStorage<T>(key: string, fallback: T): T {
  return readFrom(localStorage, key, fallback);
}

export function readSession<T>(key: string, fallback: T): T {
  return readFrom(sessionStorage, key, fallback);
}

function readFrom<T>(storage: Storage, key: string, fallback: T): T {
  const value = storage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    storage.removeItem(key);
    console.warn(`Storage data for "${key}" is invalid and was removed.`);
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  writeTo(localStorage, key, value);
}

export function writeSession<T>(key: string, value: T): void {
  writeTo(sessionStorage, key, value);
}

function writeTo<T>(storage: Storage, key: string, value: T): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`Storage data for "${key}" could not be saved.`);
  }
}

