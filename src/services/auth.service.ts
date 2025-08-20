import { api } from '@/lib/api';

export type LoginDto = { email: string; password: string };
export type UserType = {
  id: number;
  username: string;
  email: string;
  bio?: string;
  image?: string;
};
export type IUserResponse = { user: UserType & { token: string } };

function saveUserToLocalStorage(user: UserType & { token: string }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('current_user', JSON.stringify(user));
    window.dispatchEvent(new Event('auth:user'));
  } catch {}
}

export function getUserFromLocalStorage():
  | (UserType & { token?: string })
  | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('current_user');
    return raw ? (JSON.parse(raw) as UserType & { token?: string }) : null;
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

export const AuthService = {
  // IMPORTANT: backend expects { user: { email, password } }
  login: (dto: LoginDto) =>
    api.post('/login', { user: dto }).then((r) => {
      // Support both { user } and { data: { user } }
      const payload: any = r.data;
      const user = payload?.user ?? payload?.data?.user;
      if (user) {
        saveUserToLocalStorage(user);
        try {
          const expires = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toUTCString();
          if (user.token) {
            document.cookie = `access_token=${user.token}; path=/; expires=${expires}`;
          }
        } catch {}
      }
      return r.data as any;
    }),
  logout: () =>
    api.post('/logout', {}, { withCredentials: true }).finally(() => {
      // Clear any client-side user cache
      clearUserFromLocalStorage();
      try {
        // Remove non-httpOnly cookie if present
        document.cookie =
          'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } catch {}
    })
};
