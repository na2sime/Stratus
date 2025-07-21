import { useContext } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { RouterContext } from '../core/RouterContext';
import type { RouterContextValue, NavigateOptions } from '../core/types';

// Main router hook
export const useRouter = (): RouterContextValue => {
  const context = useContext(RouterContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams();
  
  if (!context) {
    // Fallback if context is not available
    const query = Object.fromEntries(searchParams.entries());
    
    return {
      pathname: location.pathname,
      params: params as Record<string, string>,
      query,
      navigate: (path: string, options?: NavigateOptions) => {
        navigate(path, { replace: options?.replace, state: options?.state });
      },
      back: () => window.history.back(),
      forward: () => window.history.forward()
    };
  }
  
  return context;
};

// Hook for route parameters
export const useRouteParams = <T = Record<string, string>>(): T => {
  const { params } = useRouter();
  return params as T;
};

// Hook for query parameters
export const useQuery = <T = Record<string, string>>(): T => {
  const { query } = useRouter();
  return query as T;
};

// Hook for navigation
export const useNavigation = () => {
  const { navigate, back, forward } = useRouter();
  return { navigate, back, forward };
};