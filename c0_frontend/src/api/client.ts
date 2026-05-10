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

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('c0_refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
          localStorage.setItem('c0_access_token', data.access);
          if (data.refresh) localStorage.setItem('c0_refresh_token', data.refresh);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('c0_access_token');
          localStorage.removeItem('c0_refresh_token');
        }
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
  date_joined: string;
}

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (username: string, password: string): Promise<AuthTokens> => {
    const { data } = await api.post('/auth/login/', { username, password });
    localStorage.setItem('c0_access_token', data.access);
    localStorage.setItem('c0_refresh_token', data.refresh);
    return data;
  },

  register: async (payload: {
    username: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
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

// ─── Dashboard API ───────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/dashboard/stats/');
    return data;
  },
};

export default api;
