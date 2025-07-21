// Base service interface
export interface Service {
  readonly name: string;
  initialize?(): Promise<void> | void;
  destroy?(): Promise<void> | void;
}

// Service constructor type
export type ServiceConstructor<T extends Service = Service> = new (...args: any[]) => T;

// Service dependency injection
export interface ServiceDependency<T extends Service = Service> {
  token: string | symbol | ServiceConstructor<T>;
  service?: T;
  factory?: () => T | Promise<T>;
  singleton?: boolean;
}

// Service container interface
export interface ServiceContainer {
  register<T extends Service>(
    token: string | symbol | ServiceConstructor<T>,
    serviceOrFactory: T | (() => T | Promise<T>),
    options?: { singleton?: boolean }
  ): void;
  
  get<T extends Service>(token: string | symbol | ServiceConstructor<T>): T;
  getAsync<T extends Service>(token: string | symbol | ServiceConstructor<T>): Promise<T>;
  
  has(token: string | symbol | ServiceConstructor): boolean;
  remove(token: string | symbol | ServiceConstructor): void;
  clear(): void;
}

// Service context for React components
export interface ServiceContextValue {
  container: ServiceContainer;
}

// Common service interfaces
export interface HttpService extends Service {
  get<T = any>(url: string, config?: RequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: RequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>;
}

export interface StorageService extends Service {
  get<T = any>(key: string): T | null;
  set<T = any>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
}

export interface AuthService extends Service {
  isAuthenticated(): boolean;
  login(credentials: any): Promise<any>;
  logout(): Promise<void>;
  getUser(): any | null;
  getToken(): string | null;
}

// Request configuration
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  baseURL?: string;
}

// Service metadata for SSR
export interface ServiceMetadata {
  isServerSide?: boolean;
  preloadData?: boolean;
  dependencies?: (string | symbol | ServiceConstructor)[];
}