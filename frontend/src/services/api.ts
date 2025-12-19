// Resolve API base URL for both local dev and production.
// Priority: VITE_API_BASE_URL env > localhost fallback > deployed default
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://real-estate-backend-three-rust.vercel.app');

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
  public baseURL: string;

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

    try {
      const raw = await fetch(`${this.baseURL}/api/listings${queryString ? '?' + queryString : ''}`).then(res => res.json());
      
      // Normalize: backend may return an array or a wrapped object
      if (Array.isArray(raw)) {
        return {
          success: true,
          data: {
            properties: raw,
            total: raw.length,
            page: 1,
            pages: 1,
          },
        };
      }

      // Backend returns { total, page, pages, listings } OR just an array
      if (raw.listings) {
        return {
          success: true,
          data: {
            properties: raw.listings,
            total: raw.total || raw.listings.length,
            page: raw.page || 1,
            pages: raw.pages || 1,
          },
        };
      }

      if (raw.success && raw.data) {
        const properties = Array.isArray(raw.data) ? raw.data : raw.data.properties || [];
        return {
          success: true,
          data: {
            properties,
            total: raw.total || properties.length,
            page: raw.page || 1,
            pages: raw.pages || 1,
          },
        };
      }

      return {
        success: false,
        error: raw.message || 'Failed to fetch properties',
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      return {
        success: false,
        error: 'Error fetching properties',
      };
    }
  }

  async getProperty(id: string | number): Promise<ApiResponse<Property>> {
  const endpoints = [`/properties/${id}`, `/listings/${id}`];
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
  const endpoints = [`${this.baseURL}/properties`, `${this.baseURL}/listings`];
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
  const endpoints = ['/properties', '/listings'];
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
  const endpoints = ['/listings/my-listings'];
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
  const res = await this.request(`/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(propertyData),
      });
      return res;
    } catch {}
  return this.request(`/properties/${id}`, {
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
  return this.request('/properties/featured');
  }

  async addReview(propertyId: string | number, reviewData: ReviewData): Promise<ApiResponse> {
  return this.request(`/properties/${propertyId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // User methods
  async getUserProfile(): Promise<ApiResponse> {
  return this.request('/users/profile');
  }

  async updateUserProfile(profileData: Partial<UserData>): Promise<ApiResponse> {
  return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Favorites methods
  async getFavorites(): Promise<ApiResponse<Property[]>> {
    // Merge server favorites with local favorites (non-ObjectId demo items)
    let server: Property[] = [];
  const endpoints = ['/favorites']; // primary backend route
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
  const endpoints = [`/favorites/${propertyId}`];
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
  const endpoints = [`/favorites/${propertyId}`];
    for (const endpoint of endpoints) {
      try {
        const res = await this.request(endpoint, { method: 'DELETE' });
        return res;
      } catch (e) {}
    }
    return { success: false, error: 'Failed to remove favorite' } as unknown as ApiResponse;
  }

  // Contact methods
  // async submitContact(contactData: ContactData): Promise<ApiResponse> {
  // return this.request('/contact', {
  //     method: 'POST',
  //     body: JSON.stringify(contactData),
  //   });
  // }

  // File upload helper
  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

  const url = `${this.baseURL}/upload`;
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
  return this.request('/health');
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient; 