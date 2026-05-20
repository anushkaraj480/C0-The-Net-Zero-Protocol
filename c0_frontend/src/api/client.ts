import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

// ─── Axios Instance ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('c0_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401 — also handles stale tokens gracefully
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept refresh requests themselves — prevents infinite loop
    if (originalRequest.url?.includes('/auth/token/refresh/')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('c0_refresh_token');

      if (!refresh) {
        // No refresh token — clear everything and reject
        localStorage.removeItem('c0_access_token');
        localStorage.removeItem('c0_refresh_token');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
        localStorage.setItem('c0_access_token', data.access);
        if (data.refresh) localStorage.setItem('c0_refresh_token', data.refresh);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        processQueue(null, data.access);
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('[C0 Auth] Token refresh failed — clearing session');
        localStorage.removeItem('c0_access_token');
        localStorage.removeItem('c0_refresh_token');
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Listing {
  id: number;
  project_name: string;
  project_type: string;
  location_text: string;
  description: string;
  standard: string;
  quantity_available: number;
  price_per_credit: string;
  available: string;
  price: string;
  status: string;
  listed_at: string;
  seller_email: string;
}

export interface DashboardStats {
  total_sequestered_tco2e: number;
  total_hectares: number;
  active_listings: number;
  total_credits_available: number;
  total_transactions: number;
  active_projects: number;
  active_sensors: number;
}

export interface TrendPoint {
  month: string;
  project_type: string;
  avg_price: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
  phone: string;
  location: string;
  pincode: string;
  company_name: string;
  date_joined: string;
}

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (username: string, password: string): Promise<AuthTokens> => {
    console.log('[C0 Auth] Login attempt:', { username, passwordLength: password.length });
    try {
      const { data } = await api.post('/auth/login/', { username, password });
      console.log('[C0 Auth] Login SUCCESS — tokens received');
      localStorage.setItem('c0_access_token', data.access);
      localStorage.setItem('c0_refresh_token', data.refresh);
      return data;
    } catch (err: any) {
      console.error('[C0 Auth] Login FAILED:', err.response?.status, err.response?.data, err.message);
      throw err;
    }
  },

  register: async (payload: {
    username: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    location?: string;
    pincode?: string;
    company_name?: string;
  }): Promise<UserInfo> => {
    const { data } = await api.post('/auth/register/', payload);
    return data;
  },

  me: async (): Promise<UserInfo> => {
    const { data } = await api.get('/auth/me/');
    return data;
  },

  logout: () => {
    localStorage.removeItem('c0_access_token');
    localStorage.removeItem('c0_refresh_token');
  },

  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('c0_access_token');
  },
};

// ─── Marketplace API ─────────────────────────────────────────────────────────
export const marketplaceAPI = {
  getListings: async (params?: {
    project_type?: string;
    standard?: string;
    search?: string;
    ordering?: string;
  }): Promise<Listing[]> => {
    const { data } = await api.get('/marketplace/listings/', { params });
    // DRF pagination returns { results: [...] } or raw array
    return data.results ?? data;
  },

  getListing: async (id: number): Promise<Listing> => {
    const { data } = await api.get(`/marketplace/listings/${id}/`);
    return data;
  },

  buyCredits: async (listingId: number, quantity: number) => {
    const { data } = await api.post('/marketplace/buy/', {
      listing: listingId,
      quantity_purchased: quantity,
    });
    return data;
  },

  getMyTransactions: async () => {
    const { data } = await api.get('/marketplace/my-transactions/');
    return data.results ?? data;
  },

  getTrends: async (): Promise<TrendPoint[]> => {
    const { data } = await api.get('/marketplace/trends/');
    return data;
  },
};

// ─── Dashboard API ───────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/dashboard/stats/');
    return data;
  },
  estimateCredits: async (params: {
    land_size_hectares: number;
    activity_type: string;
    state?: string;
    project_age_years?: number;
  }) => {
    const { data } = await api.post('/dashboard/estimate/', params);
    return data;
  },
  getModelStatus: async () => {
    const { data } = await api.get('/dashboard/model-status/');
    return data;
  },
};

export default api;
