// Client-side helpers for reading/writing the current user

export type AuthClientUser = {
  id: number;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  role?: string;
  lastLogin?: string;
  token?: string;
};

export function saveUserToLocalStorage(user: AuthClientUser) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('current_user', JSON.stringify(user));
    window.dispatchEvent(new Event('auth:user'));
  } catch {}
}

export function getUserFromLocalStorage(): AuthClientUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('current_user');
    return raw ? (JSON.parse(raw) as AuthClientUser) : null;
  } catch {
    return null;
  }
}

export function clearUserFromLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('current_user');
    window.dispatchEvent(new Event('auth:user'));
  } catch {}
}
