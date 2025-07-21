import type { AuthService as IAuthService, StorageService } from '../types';

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

/**
 * Authentication service
 */
export class AuthService implements IAuthService {
  readonly name = 'AuthService';
  
  private user: AuthUser | null = null;
  private token: string | null = null;
  private storageService?: StorageService;
  
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  constructor(storageService?: StorageService) {
    this.storageService = storageService;
  }

  async initialize(): Promise<void> {
    // Load auth state from storage on initialization
    if (this.storageService) {
      this.token = this.storageService.get<string>(this.TOKEN_KEY);
      this.user = this.storageService.get<AuthUser>(this.USER_KEY);
    }
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // This is a basic implementation - replace with your API calls
    try {
      // Simulate API call
      const response = await this.callLoginAPI(credentials);
      
      this.token = response.token;
      this.user = response.user;
      
      // Persist to storage
      if (this.storageService) {
        this.storageService.set(this.TOKEN_KEY, this.token);
        this.storageService.set(this.USER_KEY, this.user);
      }
      
      return this.user;
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout API if needed
      await this.callLogoutAPI();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local state
      this.token = null;
      this.user = null;
      
      if (this.storageService) {
        this.storageService.remove(this.TOKEN_KEY);
        this.storageService.remove(this.USER_KEY);
      }
    }
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  /**
   * Update user information
   */
  updateUser(userData: Partial<AuthUser>): void {
    if (!this.user) return;
    
    this.user = { ...this.user, ...userData };
    
    if (this.storageService) {
      this.storageService.set(this.USER_KEY, this.user);
    }
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    if (!this.user) return false;
    
    const permissions = this.user.permissions as string[] || [];
    return permissions.includes(permission);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    if (!this.user) return false;
    
    const roles = this.user.roles as string[] || [];
    return roles.includes(role);
  }

  /**
   * Simulate login API call - replace with your actual implementation
   */
  private async callLoginAPI(credentials: LoginCredentials): Promise<{ token: string; user: AuthUser }> {
    // This is a mock implementation
    // Replace with actual API call using HttpService
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful login for demo
        if (credentials.password === 'password') {
          resolve({
            token: 'mock_jwt_token_' + Date.now(),
            user: {
              id: '1',
              email: credentials.email || credentials.username,
              name: 'John Doe',
              roles: ['user'],
              permissions: ['read', 'write']
            }
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  /**
   * Simulate logout API call - replace with your actual implementation
   */
  private async callLogoutAPI(): Promise<void> {
    // This is a mock implementation
    // Replace with actual API call using HttpService
    return new Promise(resolve => {
      setTimeout(resolve, 500);
    });
  }
}