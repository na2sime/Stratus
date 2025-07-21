// Core service system
export { ServiceContainer } from './ServiceContainer';
export { ServiceProvider, useServiceContainer, useService, useOptionalService } from './ServiceContext';

// Types
export type {
  Service,
  ServiceConstructor,
  ServiceDependency,
  ServiceContainer as IServiceContainer,
  ServiceContextValue,
  HttpService as IHttpService,
  StorageService,
  AuthService as IAuthService,
  RequestConfig,
  ServiceMetadata
} from './types';

// Built-in services
export { HttpService, HttpError } from './built-in/HttpService';
export { 
  LocalStorageService, 
  SessionStorageService, 
  MemoryStorageService 
} from './built-in/StorageService';
export { AuthService } from './built-in/AuthService';

// Service tokens (for dependency injection)
export const SERVICE_TOKENS = {
  HTTP: Symbol('HttpService'),
  STORAGE: Symbol('StorageService'),
  AUTH: Symbol('AuthService'),
  LOCAL_STORAGE: Symbol('LocalStorageService'),
  SESSION_STORAGE: Symbol('SessionStorageService'),
  MEMORY_STORAGE: Symbol('MemoryStorageService')
} as const;