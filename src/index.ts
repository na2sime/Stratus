// Core exports
export { AppRouter } from './core/AppRouter';
export { HybridRouter, hydrateApp, createStratusApp, mountApp } from './core/HybridRouter';

// Types
export type {
  PageComponent,
  LayoutComponent,
  RouteDefinition,
  RouteMetadata,
  RouterContextValue,
  NavigateOptions,
  PageProps
} from './core/types';

// Hooks
export {
  useRouter,
  useRouteParams,
  useQuery,
  useNavigation
} from './hooks';

// Middleware
export {
  withAuth,
  withLayout,
  withErrorBoundary,
  composeMiddleware,
  createMiddleware
} from './middleware/index';

export type {
  MiddlewareFunction,
  AuthOptions,
  ErrorBoundaryOptions
} from './middleware/index';

// Services
export {
  ServiceContainer,
  ServiceProvider,
  useServiceContainer,
  useService,
  useOptionalService,
  HttpService,
  HttpError,
  LocalStorageService,
  SessionStorageService,
  MemoryStorageService,
  AuthService,
  SERVICE_TOKENS
} from './services';

export type {
  Service,
  ServiceConstructor,
  ServiceDependency,
  ServiceContainer as IServiceContainer,
  ServiceContextValue,
  IHttpService,
  StorageService,
  IAuthService,
  RequestConfig,
  ServiceMetadata
} from './services';

// SSR
export {
  SSRRenderer
} from './ssr';

export type {
  SSRContext,
  SSRRequest,
  SSRResponse,
  GetServerSideProps,
  GetStaticProps,
  GetStaticPaths,
  SSRRouteDefinition,
  SSRRenderResult,
  SSRConfig,
  HydrationData
} from './ssr';

// Configuration
export {
  getConfig,
  setConfig,
  defaultConfig
} from './config';

export type { StratusConfig } from './config';

// Utilities
export {
  discoverRoutes,
  filePathToRoutePath,
  clearRoutesCache
} from './core/routeUtils';