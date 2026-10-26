const TOKEN_KEY = 'fintrack_token';
const USER_KEY = 'fintrack_user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export const authStore = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  getUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },
  save(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Sự kiện toàn cục: khi server trả 401 thì App sẽ mở popup đăng nhập
export const AUTH_REQUIRED_EVENT = 'fintrack:auth-required';

export const authHeaders = (): Record<string, string> => {
  const token = authStore.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const handleUnauthorized = () => {
  authStore.clear();
  window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
};
