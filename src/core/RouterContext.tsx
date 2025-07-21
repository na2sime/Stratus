import React, { createContext, useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import type { RouterContextValue } from './types';

export const RouterContext = createContext<RouterContextValue | null>(null);

interface RouterProviderProps {
  children: React.ReactNode;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ children }) => {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [contextValue, setContextValue] = useState<RouterContextValue | null>(null);

  useEffect(() => {
    const query = Object.fromEntries(searchParams.entries());
    
    setContextValue({
      pathname: location.pathname,
      params: params as Record<string, string>,
      query,
      navigate: (path: string, options = {}) => {
        if (options.replace) {
          window.history.replaceState(options.state, '', path);
        } else {
          window.history.pushState(options.state, '', path);
        }
      },
      back: () => window.history.back(),
      forward: () => window.history.forward()
    });
  }, [location, params, searchParams]);

  if (!contextValue) {
    return null;
  }

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
};