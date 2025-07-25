import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RouterProvider } from './RouterContext';
import { discoverRoutes } from './routeUtils';
import { getConfig, setConfig } from '../config';
import type { RouteDefinition, LayoutComponent } from './types';
import type { StratusConfig } from '../config';

interface AppRouterProps {
  config?: Partial<StratusConfig>;
  fallback?: React.ReactNode;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  routes?: RouteDefinition[];
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

export const AppRouter: React.FC<AppRouterProps> = ({
  config,
  fallback = <DefaultFallback />,
  errorBoundary: ErrorBoundary = DefaultErrorBoundary,
  routes: predefinedRoutes
}) => {
  const [routes, setRoutes] = useState<RouteDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Configure Stratus on startup
  useEffect(() => {
    if (config) {
      setConfig(config);
    }
  }, [config]);

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
    // Re-trigger the effect
  };

  if (loading) {
    return <Suspense fallback={fallback}>{fallback}</Suspense>;
  }

  if (error) {
    return <ErrorBoundary error={error} retry={retry} />;
  }

  return (
    <BrowserRouter basename={getConfig().basePath}>
      <RouterProvider>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<RouteRenderer route={route} fallback={fallback} />}
            />
          ))}
        </Routes>
      </RouterProvider>
    </BrowserRouter>
  );
};

// Component for rendering a route with its layout
interface RouteRendererProps {
  route: RouteDefinition;
  fallback: React.ReactNode;
}

const RouteRenderer: React.FC<RouteRendererProps> = ({ route, fallback }) => {
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
      <LazyComponent />
    </Suspense>
  );

  if (Layout) {
    return <Layout>{content}</Layout>;
  }

  return content;
};