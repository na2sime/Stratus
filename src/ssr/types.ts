import type { RouteDefinition } from '../core/types';
import type { ServiceContainer } from '../services/ServiceContainer';

// SSR Context
export interface SSRContext {
  request: SSRRequest;
  response: SSRResponse;
  pathname: string;
  params: Record<string, string>;
  query: Record<string, string>;
  services: ServiceContainer;
  data: Record<string, any>;
}

// Request interface (simplified)
export interface SSRRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}

// Response interface (simplified)
export interface SSRResponse {
  status: number;
  headers: Record<string, string>;
  redirect?: string;
}

// Server-side data loading function
export type GetServerSideProps<T = Record<string, any>> = (
  context: SSRContext
) => Promise<{
  props?: T;
  redirect?: {
    destination: string;
    permanent?: boolean;
  };
  notFound?: boolean;
}>;

// Static data loading function (build time)
export type GetStaticProps<T = Record<string, any>> = (
  context: {
    params: Record<string, string>;
    preview?: boolean;
  }
) => Promise<{
  props: T;
  revalidate?: number | false;
  notFound?: boolean;
  redirect?: {
    destination: string;
    permanent?: boolean;
  };
}>;

// Static paths generation
export type GetStaticPaths = () => Promise<{
  paths: Array<{
    params: Record<string, string>;
  }>;
  fallback: boolean | 'blocking';
}>;

// Enhanced route definition for SSR
export interface SSRRouteDefinition extends RouteDefinition {
  getServerSideProps?: GetServerSideProps;
  getStaticProps?: GetStaticProps;
  getStaticPaths?: GetStaticPaths;
  isStatic?: boolean;
}

// SSR rendering result
export interface SSRRenderResult {
  html: string;
  css?: string;
  initialData: Record<string, any>;
  statusCode: number;
  redirect?: string;
  headers: Record<string, string>;
}

// SSR configuration
export interface SSRConfig {
  // Enable/disable SSR
  enabled: boolean;
  
  // Port for SSR server
  port?: number;
  
  // Static file serving
  staticDir?: string;
  
  // HTML template
  template?: string;
  
  // Custom document component
  document?: React.ComponentType<{
    html: string;
    css?: string;
    initialData: Record<string, any>;
    title?: string;
    meta?: Array<{ name?: string; property?: string; content: string }>;
  }>;
  
  // Error handling
  onError?: (error: Error, context: SSRContext) => void;
  
  // Custom service setup for server
  setupServices?: (container: ServiceContainer, context: SSRContext) => Promise<void>;
}

// Hydration data type
export interface HydrationData {
  pathname: string;
  params: Record<string, string>;
  query: Record<string, string>;
  props: Record<string, any>;
  services?: Record<string, any>;
}