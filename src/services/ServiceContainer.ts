import type { Service, ServiceContainer as IServiceContainer, ServiceConstructor } from './types';

/**
 * Dependency injection container for services
 */
export class ServiceContainer implements IServiceContainer {
  private services = new Map<string | symbol | ServiceConstructor, any>();
  private factories = new Map<string | symbol | ServiceConstructor, () => any | Promise<any>>();
  private singletons = new Set<string | symbol | ServiceConstructor>();
  private initializing = new Set<string | symbol | ServiceConstructor>();

  /**
   * Register a service or factory in the container
   */
  register<T extends Service>(
    token: string | symbol | ServiceConstructor<T>,
    serviceOrFactory: T | (() => T | Promise<T>),
    options: { singleton?: boolean } = {}
  ): void {
    const { singleton = true } = options;

    if (typeof serviceOrFactory === 'function' && !this.isServiceInstance(serviceOrFactory)) {
      // It's a factory function
      this.factories.set(token, serviceOrFactory);
    } else {
      // It's a service instance
      this.services.set(token, serviceOrFactory);
    }

    if (singleton) {
      this.singletons.add(token);
    }
  }

  /**
   * Get a service synchronously
   */
  get<T extends Service>(token: string | symbol | ServiceConstructor<T>): T {
    // Check if already instantiated
    if (this.services.has(token)) {
      return this.services.get(token) as T;
    }

    // Check if we have a factory
    if (this.factories.has(token)) {
      const factory = this.factories.get(token)!;
      const service = factory();

      if (service instanceof Promise) {
        throw new Error(
          `Service "${String(token)}" is async and requires getAsync(). Use await container.getAsync("${String(token)}") instead.`
        );
      }

      // Cache if singleton
      if (this.singletons.has(token)) {
        this.services.set(token, service);
      }

      return service as T;
    }

    // Try to instantiate if it's a constructor
    if (typeof token === 'function') {
      const service = new (token as any)();
      
      if (this.singletons.has(token)) {
        this.services.set(token, service);
      }

      return service as T;
    }

    throw new Error(`Service "${String(token)}" not found. Make sure it's registered in the container.`);
  }

  /**
   * Get a service asynchronously (supports async factories)
   */
  async getAsync<T extends Service>(token: string | symbol | ServiceConstructor<T>): Promise<T> {
    // Prevent circular dependencies
    if (this.initializing.has(token)) {
      throw new Error(`Circular dependency detected for service "${String(token)}"`);
    }

    // Check if already instantiated
    if (this.services.has(token)) {
      return this.services.get(token) as T;
    }

    this.initializing.add(token);

    try {
      // Check if we have a factory
      if (this.factories.has(token)) {
        const factory = this.factories.get(token)!;
        const service = await factory();

        // Cache if singleton
        if (this.singletons.has(token)) {
          this.services.set(token, service);
        }

        // Initialize service if it has an initialize method
        if (service && typeof service.initialize === 'function') {
          await service.initialize();
        }

        return service as T;
      }

      // Try to instantiate if it's a constructor
      if (typeof token === 'function') {
        const service = new (token as any)();
        
        if (this.singletons.has(token)) {
          this.services.set(token, service);
        }

        // Initialize service if it has an initialize method
        if (service && typeof service.initialize === 'function') {
          await service.initialize();
        }

        return service as T;
      }

      throw new Error(`Service "${String(token)}" not found. Make sure it's registered in the container.`);
    } finally {
      this.initializing.delete(token);
    }
  }

  /**
   * Check if a service is registered
   */
  has(token: string | symbol | ServiceConstructor): boolean {
    return this.services.has(token) || this.factories.has(token);
  }

  /**
   * Remove a service from the container
   */
  remove(token: string | symbol | ServiceConstructor): void {
    const service = this.services.get(token);
    
    // Call destroy if the service has it
    if (service && typeof service.destroy === 'function') {
      service.destroy();
    }

    this.services.delete(token);
    this.factories.delete(token);
    this.singletons.delete(token);
  }

  /**
   * Clear all services
   */
  clear(): void {
    // Destroy all services that have a destroy method
    for (const service of this.services.values()) {
      if (service && typeof service.destroy === 'function') {
        service.destroy();
      }
    }

    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
    this.initializing.clear();
  }

  /**
   * Get all registered service tokens
   */
  getTokens(): (string | symbol | ServiceConstructor)[] {
    return [
      ...Array.from(this.services.keys()),
      ...Array.from(this.factories.keys())
    ];
  }

  /**
   * Check if value is a service instance (has name property)
   */
  private isServiceInstance(value: any): value is Service {
    return value && typeof value === 'object' && 'name' in value;
  }
}