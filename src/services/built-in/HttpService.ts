import type { HttpService as IHttpService, RequestConfig } from '../types';

/**
 * HTTP service for making API calls
 */
export class HttpService implements IHttpService {
  readonly name = 'HttpService';
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(options: {
    baseURL?: string;
    defaultHeaders?: Record<string, string>;
    timeout?: number;
  } = {}) {
    this.baseURL = options.baseURL || '';
    this.defaultHeaders = options.defaultHeaders || {
      'Content-Type': 'application/json'
    };
    this.timeout = options.timeout || 10000;
  }

  async get<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  async patch<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>('PATCH', url, data, config);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const fullURL = this.buildURL(url, config.baseURL);
    const headers = { ...this.defaultHeaders, ...config.headers };
    const timeout = config.timeout || this.timeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullURL, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new HttpError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response
        );
      }

      // Handle different response types
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      
      if (contentType?.includes('text/')) {
        return await response.text() as unknown as T;
      }
      
      return await response.blob() as unknown as T;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpError('Request timeout', 408);
      }
      
      throw error;
    }
  }

  private buildURL(url: string, baseURL?: string): string {
    const base = baseURL || this.baseURL;
    
    if (!base) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    
    return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }

  /**
   * Set default headers for all requests
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string, type: 'Bearer' | 'Basic' = 'Bearer'): void {
    this.setDefaultHeaders({
      'Authorization': `${type} ${token}`
    });
  }

  /**
   * Remove authorization header
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
}

/**
 * HTTP Error class
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'HttpError';
  }
}