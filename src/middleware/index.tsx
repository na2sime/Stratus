import React from 'react';
import type { PageComponent } from '../core/types';

// Type for simple middleware
export type MiddlewareFunction = (Component: PageComponent) => PageComponent;

/**
 * Compose multiple middleware together
 */
export function composeMiddleware(...middlewares: MiddlewareFunction[]): MiddlewareFunction {
  return (Component: PageComponent) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      Component
    );
  };
}

/**
 * Simple authentication middleware
 */
export interface AuthOptions {
  isAuthenticated?: () => boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const withAuth = (options: AuthOptions = {}) => {
  const {
    isAuthenticated = () => typeof window !== 'undefined' && !!localStorage.getItem('token'),
    redirectTo = '/login',
    fallback = null
  } = options;

  return (Component: PageComponent): PageComponent => {
    return (props: any) => {
      // Client-side verification only
      if (typeof window === 'undefined') {
        return fallback;
      }

      if (!isAuthenticated()) {
        // Use Stratus router instead of window.location
        window.location.replace(redirectTo);
        return fallback;
      }

      return <Component {...props} />;
    };
  };
};

/**
 * Layout middleware (simplified version)
 */
export const withLayout = (Layout: React.ComponentType<{ children: React.ReactNode }>) => {
  return (Component: PageComponent): PageComponent => {
    return (props: any) => (
      <Layout>
        <Component {...props} />
      </Layout>
    );
  };
};

/**
 * Error handling middleware
 */
export interface ErrorBoundaryOptions {
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: any) => void;
}

export const withErrorBoundary = (options: ErrorBoundaryOptions = {}) => {
  const { fallback: Fallback, onError } = options;

  return (Component: PageComponent): PageComponent => {
    return (props: any) => {
      const [error, setError] = React.useState<Error | null>(null);

      React.useEffect(() => {
        const handleError = (event: ErrorEvent) => {
          setError(new Error(event.message));
          onError?.(new Error(event.message), { stack: event.error?.stack });
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
      }, []);

      if (error) {
        if (Fallback) {
          return <Fallback error={error} retry={() => setError(null)} />;
        }
        
        return (
          <div>
            <h2>Error</h2>
            <p>{error.message}</p>
            <button onClick={() => setError(null)}>Retry</button>
          </div>
        );
      }

      return <Component {...props} />;
    };
  };
};

// Utility to easily create custom middleware
export const createMiddleware = (
  fn: (Component: PageComponent, ...args: any[]) => PageComponent
) => {
  return (...args: any[]) => (Component: PageComponent) => fn(Component, ...args);
};