const API_BASE_URL = 'https://r-s-kappa.vercel.app'

// Type definitions
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  isFavorite?: boolean;
}

interface UserData {
  name: string;
  email: string;
  password: string;
  role?: 'buyer' | 'seller' | 'admin' | string;
  phone?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin' | string;
  phone?: string;
  isVerified?: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface PropertyData {
  title: string;
  description: string;
  price: number;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities?: string[];
  status?: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

interface ReviewData {
  rating: number;
  comment: string;
}

interface ContactData {
  name: string;
  email: string;
  message: string;
  phone?: string;
}

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  images?: string[];
  status: string;
  amenities?: string[];
  listedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
}

interface RequestOptions {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helpers
  private isValidObjectId(id: string | number): boolean {
    const s = String(id);
    return /^[0-9a-fA-F]{24}$/.test(s);
  }

  private readLocalFavorites(): any[] {
    try {
      const raw = localStorage.getItem('local_favorites');
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  private writeLocalFavorites(items: any[]): void {
    try {
      localStorage.setItem('local_favorites', JSON.stringify(items.slice(0, 200)));
    } catch {}
  }

  // Helper method to get auth token
  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  // Helper method to set auth token
  setAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Helper method to get headers
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method
  async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const url = `${this.baseURL}/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: UserData): Promise<ApiResponse<User>> {
    const response = await this.request<{ token: string; data: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return {
      success: true,
      data: (
        response.data?.data ||
        (typeof response.data === 'object' && 'user' in response.data ? (response.data as any).user : undefined) ||
        (typeof response.data === 'object' && 'token' in response.data ? undefined : response.data)
      ),
      message: response.message || 'User registered successfully'
    };
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ token: string; data?: User; user?: User } | (User & { token: string })>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    const hasToken = (response as any)?.data?.token || (response as any)?.token;
    const token = (response as any)?.data?.token ?? (response as any)?.token ?? null;

    // Try to extract user from common shapes
    const userFromData = (response as any)?.data?.data as User | undefined;
    const userFromUser = (response as any)?.data?.user as User | undefined;
    const userInline = (response as any) as (User & { token?: string });

    const user: User | undefined = userFromData || userFromUser || (
      (userInline && userInline._id && userInline.email && userInline.name) ? {
        _id: userInline._id,
        email: userInline.email,
        name: userInline.name,
        role: (userInline as any).role,
        phone: (userInline as any).phone,
        isVerified: (userInline as any).isVerified,
      } : undefined
    );

    if (hasToken && token) {
      this.setAuthToken(token);
      if (user) {
        return {
          success: true,
          data: { user, token },
          message: 'Login successful'
        };
      }
      // If token present but user missing, caller can fetch /auth/me
      return {
        success: true,
        data: { user: (undefined as unknown as User), token },
        message: 'Login successful'
      };
    }

    return {
      success: false,
      error: 'Login failed'
    };
  }

  async logout(): Promise<void> {
    this.setAuthToken(null);
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me');
  }

  async updateProfile(profileData: Partial<UserData>): Promise<ApiResponse> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Property methods
  async getProperties(filters: Record<string, string | number | boolean> = {}): Promise<ApiResponse<{ properties: Property[], total: number, page: number, pages: number }>> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();

    const tryEndpoints = [
      queryString ? `/api/properties?${queryString}` : '/api/properties',
      queryString ? `/api/listings?${queryString}` : '/api/listings',
    ];

    for (const endpoint of tryEndpoints) {
      try {
  const raw = await fetch(this.baseURL + endpoint).then(res => res.json());
        // Normalize: backend may return an array or a wrapped object
        if (Array.isArray(raw)) {
          return {
            success: true,
            data: {
              properties: raw as Property[],
              total: raw.length,
              page: 1,
              pages: 1,
            },
          };
        }
        // Handle backend that returns { listings, total, page, pages }
        if (raw && Array.isArray((raw as any).listings)) {
          const listings = (raw as any).listings as Property[];
          return {
            success: true,
            data: {
              properties: listings,
              total: (raw as any).total ?? listings.length,
              page: (raw as any).page ?? 1,
              pages: (raw as any).pages ?? 1,
            },
          };
        }
        if (raw && Array.isArray(raw.properties)) {
          return { success: true, data: { properties: raw.properties, total: raw.total ?? raw.properties.length, page: raw.page ?? 1, pages: raw.pages ?? 1 } };
        }
        // Some APIs return { data: { properties: [] }, pagination... }
        if (raw && raw.data && Array.isArray(raw.data.properties)) {
          return { success: true, data: { properties: raw.data.properties, total: raw.data.total ?? raw.data.properties.length, page: raw.data.page ?? 1, pages: raw.data.pages ?? 1 } };
        }
        // If object looks like a single property list under a key
        if (raw && typeof raw === 'object') {
          const maybeArray = (raw as any).data || (raw as any).items || (raw as any).results;
          if (Array.isArray(maybeArray)) {
            return {
              success: true,
              data: {
                properties: maybeArray,
                total: maybeArray.length,
                page: (raw as any).page || 1,
                pages: (raw as any).pages || 1,
              },
            };
          }
        }
      } catch {}
    }

    return { success: false, error: 'Failed to fetch properties' } as unknown as ApiResponse<{ properties: Property[], total: number, page: number, pages: number }>;
  }

  async getProperty(id: string | number): Promise<ApiResponse<Property>> {
  const endpoints = [`/api/properties/${id}`, `/api/listings/${id}`];
    for (const endpoint of endpoints) {
      try {
        const response = await this.request<any>(endpoint);
        const data = response?.data;
        if (data && typeof data === 'object' && typeof data._id === 'string' && typeof data.title === 'string') {
          return { success: true, data };
        }
      } catch {}
    }
    return { success: false, error: 'Failed to fetch property' } as unknown as ApiResponse<Property>;
  }

  async createProperty(propertyData: PropertyData | FormData): Promise<ApiResponse> {
    // Handle both JSON and FormData (for file uploads)
    if (propertyData instanceof FormData) {
  const endpoints = [`${this.baseURL}/api/properties`, `${this.baseURL}/api/listings`];
      for (const url of endpoints) {
        const config = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`,
          },
          body: propertyData,
        } as RequestInit;
        try {
          const response = await fetch(url, config);
          const data = await response.json();
          if (response.ok) return { success: true, data, message: 'Property created successfully' };
        } catch {}
      }
      return { success: false, error: 'Property creation failed' } as unknown as ApiResponse;
    } else {
      // JSON payload version
  const endpoints = ['/api/properties', '/api/listings'];
      for (const endpoint of endpoints) {
        try {
          const res = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(propertyData),
          });
          if ((res as any)?.success !== false) return { success: true, data: (res as any)?.data || res } as ApiResponse;
        } catch {}
      }
      return { success: false, error: 'Property creation failed' } as unknown as ApiResponse;
    }
  }

  async getUserProperties(): Promise<ApiResponse<Property[]>> {
    // Use listings endpoint first; '/properties/my' is not supported on this backend
  const endpoints = ['/api/listings/my-listings'];
    for (const endpoint of endpoints) {
      try {
        const raw = await this.request<any>(endpoint);
        if (Array.isArray(raw)) {
          return { success: true, data: raw };
        }
        if (raw && Array.isArray(raw.data)) {
          return { success: true, data: raw.data };
        }
      } catch {}
    }
    return { success: false, error: 'Failed to fetch user properties' } as unknown as ApiResponse<Property[]>;
  }

  async updateProperty(id: string | number, propertyData: Partial<PropertyData>): Promise<ApiResponse> {
    // Prefer listings endpoint; fall back to properties
    try {
  const res = await this.request(`/api/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(propertyData),
      });
      return res;
    } catch {}
  return this.request(`/api/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }

  async deleteProperty(id: string | number): Promise<ApiResponse> {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  async getFeaturedProperties(): Promise<ApiResponse> {
  return this.request('/api/properties/featured');
  }

  async addReview(propertyId: string | number, reviewData: ReviewData): Promise<ApiResponse> {
  return this.request(`/api/properties/${propertyId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // User methods
  async getUserProfile(): Promise<ApiResponse> {
  return this.request('/api/users/profile');
  }

  async updateUserProfile(profileData: Partial<UserData>): Promise<ApiResponse> {
  return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Favorites methods
  async getFavorites(): Promise<ApiResponse<Property[]>> {
    // Merge server favorites with local favorites (non-ObjectId demo items)
    let server: Property[] = [];
  const endpoints = ['/api/favorites']; // primary backend route
    for (const endpoint of endpoints) {
      try {
        const raw = await this.request<any>(endpoint);
        if (Array.isArray(raw)) { server = raw as Property[]; break; }
        if (raw && Array.isArray(raw.data)) { server = raw.data as Property[]; break; }
  if (raw && raw.data && Array.isArray(raw.data.favorites)) { server = raw.data.favorites as Property[]; break; }
      } catch {}
    }

    const local = this.readLocalFavorites();
    // De-duplicate by _id preferring server entries
    const map = new Map<string, Property>();
    for (const item of local) {
      if (item && item._id) map.set(String(item._id), item);
    }
    for (const item of server) {
      if (item && item._id) map.set(String(item._id), item);
    }
    return { success: true, data: Array.from(map.values()) } as ApiResponse<Property[]>;
  }

  async addToFavorites(propertyId: string | number, fullProperty?: Partial<Property>): Promise<ApiResponse> {
    // If not a valid ObjectId, store locally
    if (!this.isValidObjectId(propertyId)) {
      const items = this.readLocalFavorites();
      const id = String(propertyId);
      if (!items.some(p => String(p._id) === id)) {
        const toStore = fullProperty && fullProperty._id ? fullProperty : { _id: id };
        items.unshift(toStore);
        this.writeLocalFavorites(items);
      }
      return { success: true, message: 'Favorited locally' } as ApiResponse;
    }
  const endpoints = [`/api/favorites/${propertyId}`];
    for (const endpoint of endpoints) {
      try {
        const res = await this.request(endpoint, { method: 'POST' });
        return res;
      } catch (e) {}
    }
    return { success: false, error: 'Failed to add favorite' } as unknown as ApiResponse;
  }

  async removeFromFavorites(propertyId: string | number): Promise<ApiResponse> {
    if (!this.isValidObjectId(propertyId)) {
      const id = String(propertyId);
      const items = this.readLocalFavorites().filter(p => String(p._id) !== id);
      this.writeLocalFavorites(items);
      return { success: true, message: 'Unfavorited locally' } as ApiResponse;
    }
  const endpoints = [`/api/favorites/${propertyId}`];
    for (const endpoint of endpoints) {
      try {
        const res = await this.request(endpoint, { method: 'DELETE' });
        return res;
      } catch (e) {}
    }
    return { success: false, error: 'Failed to remove favorite' } as unknown as ApiResponse;
  }

  // Contact methods
  async submitContact(contactData: ContactData): Promise<ApiResponse> {
  return this.request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // File upload helper
  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

  const url = `${this.baseURL}/api/upload`;
    const config = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Upload failed');
      }

      return data.data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
  return this.request('/api/health');
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient; 