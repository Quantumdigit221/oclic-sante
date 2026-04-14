import { authAPI } from './laravel-api';
import { User } from '../types';
import React, { useState } from 'react';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    // Initialize from localStorage
    this.token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
        // Force centerId for admin users
        if ((this.user.role === 'ADMIN' || this.user.role === 'SUPER_ADMIN') && !this.user.centerId) {
          this.user.centerId = '1';
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        this.clearStorage();
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthState> {
    try {
      console.log('AuthService.login: début avec', credentials.email);
      
      // Clear any existing auth data
      this.clearStorage();

      // Call Laravel API
      const response = await authAPI.login(credentials.email, credentials.password);
      console.log('AuthService.login: réponse API', response);

      if (response.success && response.user && response.token) {
        console.log('AuthService.login: succès, stockage des données');
        this.token = response.token;
        this.user = this.transformLaravelUser(response.user);
        
        // Store in localStorage
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        console.log('AuthService.login: données stockées', { token: this.token, user: this.user });

        return {
          user: this.user,
          token: this.token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        };
      } else {
        console.log('AuthService.login: échec - réponse invalide', response);
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('AuthService.login: erreur', error);
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.response?.data?.error || error.message || 'Login failed'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Call Laravel logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      this.clearStorage();
    }
  }

  async getProfile(): Promise<User | null> {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.user) {
        this.user = this.transformLaravelUser(response.user);
        localStorage.setItem('user', JSON.stringify(this.user));
        return this.user;
      }
      return null;
    } catch (error) {
      console.error('Get profile error:', error);
      // If token is invalid, clear auth data
      if (error.response?.status === 401) {
        this.clearStorage();
      }
      return null;
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User | null> {
    try {
      const response = await authAPI.updateProfile(userData);
      if (response.success && response.user) {
        this.user = this.transformLaravelUser(response.user);
        localStorage.setItem('user', JSON.stringify(this.user));
        return this.user;
      }
      return null;
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return this.user ? roles.includes(this.user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN') || this.hasRole('SUPER_ADMIN');
  }

  isDoctor(): boolean {
    return this.hasRole('DOCTOR');
  }

  isReceptionist(): boolean {
    return this.hasRole('RECEPTIONIST');
  }

  isPharmacist(): boolean {
    return this.hasRole('PHARMACIST');
  }

  isSuperAdmin(): boolean {
    return this.hasRole('SUPER_ADMIN');
  }

  private clearStorage(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  private transformLaravelUser(laravelUser: any): User {
    // Transform Laravel user data to match frontend User interface
    const centerId = laravelUser.center_id || laravelUser.centerId || '1';
    
    // Force centerId to '1' for admin users
    const finalCenterId = (laravelUser.role === 'ADMIN' || laravelUser.role === 'SUPER_ADMIN') ? '1' : centerId;
    
    return {
      id: laravelUser.id.toString(),
      centerId: finalCenterId,
      name: laravelUser.name,
      email: laravelUser.email,
      role: laravelUser.role,
      phone: laravelUser.phone || undefined,
      specialty: laravelUser.specialty || undefined,
      avatarUrl: laravelUser.avatar_url || laravelUser.avatarUrl || undefined
    };
  }

  // Validate token by calling profile endpoint
  async validateToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const user = await this.getProfile();
      return user !== null;
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearStorage();
      return false;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// React hook for auth state
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: authService.getCurrentUser(),
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,
    error: null
  });

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await authService.login(credentials);
      setAuthState(result);
      return result;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshProfile = async () => {
    const user = await authService.getProfile();
    if (user) {
      setAuthState(prev => ({ ...prev, user }));
    }
  };

  return {
    ...authState,
    login,
    logout,
    refreshProfile,
    hasRole: authService.hasRole.bind(authService),
    hasAnyRole: authService.hasAnyRole.bind(authService),
    isAdmin: authService.isAdmin.bind(authService),
    isDoctor: authService.isDoctor.bind(authService),
    isReceptionist: authService.isReceptionist.bind(authService),
    isPharmacist: authService.isPharmacist.bind(authService),
    isSuperAdmin: authService.isSuperAdmin.bind(authService)
  };
};
