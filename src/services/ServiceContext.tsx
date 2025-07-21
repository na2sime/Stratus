import React, { createContext, useContext, useEffect, useState } from 'react';
import { ServiceContainer } from './ServiceContainer';
import type { ServiceContextValue, Service, ServiceConstructor } from './types';

// Service context
const ServiceContext = createContext<ServiceContextValue | null>(null);

// Service provider props
interface ServiceProviderProps {
  children: React.ReactNode;
  container?: ServiceContainer;
  services?: Array<{
    token: string | symbol | ServiceConstructor;
    service?: Service | (() => Service | Promise<Service>);
    options?: { singleton?: boolean };
  }>;
}

/**
 * Service provider component
 */
export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
  container: providedContainer,
  services = []
}) => {
  const [container] = useState(() => providedContainer || new ServiceContainer());
  const [initialized, setInitialized] = useState(false);

  // Register services on mount
  useEffect(() => {
    const initializeServices = async () => {
      // Register provided services
      for (const { token, service, options } of services) {
        if (service) {
          container.register(token, service, options);
        }
      }

      setInitialized(true);
    };

    initializeServices();

    // Cleanup on unmount
    return () => {
      container.clear();
    };
  }, [container, services]);

  if (!initialized) {
    return <div>Initializing services...</div>;
  }

  const contextValue: ServiceContextValue = {
    container
  };

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  );
};

/**
 * Hook to get the service container
 */
export const useServiceContainer = () => {
  const context = useContext(ServiceContext);
  
  if (!context) {
    throw new Error('useServiceContainer must be used within a ServiceProvider');
  }
  
  return context.container;
};

/**
 * Hook to get a specific service
 */
export const useService = <T extends Service>(
  token: string | symbol | ServiceConstructor<T>
): T => {
  const container = useServiceContainer();
  const [service, setService] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadService = async () => {
      try {
        const serviceInstance = await container.getAsync(token);
        setService(serviceInstance);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load service'));
        setService(null);
      }
    };

    loadService();
  }, [container, token]);

  if (error) {
    throw error;
  }

  if (!service) {
    throw new Error(`Service "${String(token)}" is still loading`);
  }

  return service;
};

/**
 * Hook for optional service (doesn't throw if not found)
 */
export const useOptionalService = <T extends Service>(
  token: string | symbol | ServiceConstructor<T>
): T | null => {
  const container = useServiceContainer();
  const [service, setService] = useState<T | null>(null);

  useEffect(() => {
    const loadService = async () => {
      try {
        if (container.has(token)) {
          const serviceInstance = await container.getAsync(token);
          setService(serviceInstance);
        }
      } catch {
        // Ignore errors for optional services
        setService(null);
      }
    };

    loadService();
  }, [container, token]);

  return service;
};