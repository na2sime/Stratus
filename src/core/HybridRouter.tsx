import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { ServiceProvider } from '../services/ServiceContext';
import { ServiceContainer } from '../services/ServiceContainer';
import { RouterProvider } from './RouterContext';
import { discoverRoutes } from './routeUtils';
import { getConfig, setConfig } from '../config';
import type { RouteDefinition, LayoutComponent } from './types';
import type { StratusConfig } from '../config';
import type { HydrationData } from '../ssr/types';

interface HybridRouterProps {
  config?: Partial<StratusConfig>;
  fallback?: React.ReactNode;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  routes?: RouteDefinition[];
  serviceContainer?: ServiceContainer;
}

const DefaultFallback = () => <div>Loading...</div>;
const DefaultErrorBoundary: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div>
    <h2>An error occurred</h2>
    <p>{error.message}</p>
    <button onClick={retry}>Retry</button>
  </div>
);

// Layout cache
const layoutsCache = new Map<string, LayoutComponent>();

/**
 * Hybrid router that supports both client-side and server-side rendering
 */
export const HybridRouter: React.FC<HybridRouterProps> = ({
  config,
  fallback = <DefaultFallback />,
  errorBoundary: ErrorBoundary = DefaultErrorBoundary,
  routes: predefinedRoutes,
  serviceContainer
}) => {
  const [routes, setRoutes] = useState<RouteDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [container] = useState(() => serviceContainer || new ServiceContainer());
  const [hydrationData, setHydrationData] = useState<HydrationData | null>(null);

  // Configure Stratus on startup
  useEffect(() => {
    if (config) {
      setConfig(config);
    }
  }, [config]);

  // Load hydration data if available (SSR)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = (window as any).__STRATUS_DATA__;
      if (data) {
        setHydrationData(data);
        // Clean up
        delete (window as any).__STRATUS_DATA__;
      }
    }
  }, []);

  // Route discovery
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setLoading(true);
        
        if (predefinedRoutes) {
          setRoutes(predefinedRoutes);
        } else {
          const discoveredRoutes = await discoverRoutes();
          setRoutes(discoveredRoutes);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading routes:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, [predefinedRoutes]);

  const retry = () => {
    setError(null);
    setRoutes([]);
    setLoading(true);
  };

  if (loading) {
    return <Suspense fallback={fallback}>{fallback}</Suspense>;
  }

  if (error) {
    return <ErrorBoundary error={error} retry={retry} />;
  }

  const app = (
    <ServiceProvider container={container}>
      <BrowserRouter basename={getConfig().basePath}>
        <RouterProvider>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <RouteRenderer 
                    route={route} 
                    fallback={fallback}
                    initialProps={hydrationData?.props}
                  />
                }
              />
            ))}
          </Routes>
        </RouterProvider>
      </BrowserRouter>
    </ServiceProvider>
  );

  return app;
};

// Component for rendering a route with its layout
interface RouteRendererProps {
  route: RouteDefinition;
  fallback: React.ReactNode;
  initialProps?: Record<string, any>;
}

const RouteRenderer: React.FC<RouteRendererProps> = ({ route, fallback, initialProps }) => {
  const LazyComponent = lazy(route.component);
  const [Layout, setLayout] = useState<LayoutComponent | null>(null);

  // Load layout if necessary
  useEffect(() => {
    const loadLayout = async () => {
      if (!route.layout) {
        setLayout(null);
        return;
      }
      
      // Check cache
      if (layoutsCache.has(route.layout)) {
        setLayout(layoutsCache.get(route.layout)!);
        return;
      }
      
      try {
        const config = getConfig();
        const layoutPath = `${config.layoutsDir}/${route.layout}`;
        const layoutModule = await import(/* @vite-ignore */ layoutPath);
        const LayoutComponent = layoutModule.default;
        
        // Cache layout
        layoutsCache.set(route.layout, LayoutComponent);
        setLayout(() => LayoutComponent);
      } catch (err) {
        console.warn(`Layout not found: ${route.layout}`, err);
        setLayout(null);
      }
    };

    loadLayout();
  }, [route.layout]);

  const content = (
    <Suspense fallback={fallback}>
      <LazyComponent {...(initialProps || {})} />
    </Suspense>
  );

  if (Layout) {
    return <Layout>{content}</Layout>;
  }

  return content;
};

/**
 * Client-side hydration function
 */
export const hydrateApp = (
  element: React.ReactElement,
  container: HTMLElement,
  callback?: () => void
): void => {
  const hydrationData = (window as any).__STRATUS_DATA__;
  
  if (hydrationData) {
    // Hydrate if server-rendered
    hydrateRoot(container, element, {
      onRecoverableError: (error) => {
        console.error('Hydration error:', error);
      }
    });
    
    if (callback) callback();
  } else {
    // Regular client-side rendering
    createRoot(container).render(element);
    
    if (callback) callback();
  }
};

/**
 * Helper to create a Stratus app with SSR support
 */
export const createStratusApp = (props: HybridRouterProps) => {
  return <HybridRouter {...props} />;
};

/**
 * Mount the app to DOM (client-side)
 */
export const mountApp = (
  props: HybridRouterProps,
  containerId = 'root',
  callback?: () => void
): void => {
  const container = document.getElementById(containerId);
  
  if (!container) {
    throw new Error(`Container with id "${containerId}" not found`);
  }

  const app = createStratusApp(props);
  hydrateApp(app, container, callback);
};