export type ApiResponse<T> = {
  status: 'success' | 'error';
  message?: string;
  error?: string;
} & T;

const resolvedHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || `http://${resolvedHost}:5000`;

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({ status: 'error', error: 'Invalid JSON' }));
  return data as ApiResponse<T>;
}

export const AuthAPI = {
  async register(input: { username: string; email: string; password: string }) {
    return request<{}>('/api/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async login(input: { username: string; password: string }) {
    return request<{ user: { id: number; username: string; email: string } }>('/api/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async logout() {
    return request<{}>('/api/logout', { method: 'POST' });
  },
  async profile() {
    return request<{ user?: { id: number; username: string; email: string } }>('/api/profile');
  },
  async userDashboard() {
    return request<{ data: any }>('/api/user/dashboard');
  },
  async userTransactions(params?: { limit?: number; offset?: number }) {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const q = query.toString();
    return request<{ transactions: Record<string, any[]>; pagination: any }>(`/api/user/transactions${q ? `?${q}` : ''}`);
  },
  async userAccounts() {
    return request<{ accounts: any[] }>(`/api/user/accounts`);
  },
};


