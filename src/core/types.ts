import { ComponentType, ReactNode } from 'react';

// Base types
export type PageComponent = ComponentType<any>;
export type LayoutComponent = ComponentType<{ children: ReactNode }>;

// Route definition
export interface RouteDefinition {
  path: string;
  component: () => Promise<{ default: PageComponent }>;
  layout?: string;
  metadata?: RouteMetadata;
}

// Route metadata
export interface RouteMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
}

// Router context
export interface RouterContextValue {
  pathname: string;
  params: Record<string, string>;
  query: Record<string, string>;
  navigate: (path: string, options?: NavigateOptions) => void;
  back: () => void;
  forward: () => void;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: any;
}

// Component props
export interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
}