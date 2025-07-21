import { glob } from 'glob';
import * as path from 'path';
import { getConfig } from '../config';
import type { RouteDefinition } from './types';

// Cache for discovered routes
let routesCache: RouteDefinition[] | null = null;

/**
 * Converts a file path to a route path
 */
export function filePathToRoutePath(filePath: string): string {
  const config = getConfig();
  
  // Remove base directory and extension
  let routePath = filePath
    .replace(new RegExp(`^${config.routesDir.replace(/[/\\]/g, '[/\\\\]')}`), '')
    .replace(/\.(tsx?|jsx?)$/, '');

  // Normalize slashes
  routePath = routePath.replace(/\\/g, '/');

  // Handle dynamic parameters [param] -> :param
  routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1');

  // Handle catch-all routes [...param] -> *param
  routePath = routePath.replace(/\[\.\.\.([^\]]+)\]/g, '*$1');

  // Index page becomes /
  routePath = routePath.replace(/\/page$/, '') || '/';

  // Add initial slash if necessary
  if (!routePath.startsWith('/')) {
    routePath = '/' + routePath;
  }

  // Handle trailing slash
  if (config.trailingSlash && routePath !== '/' && !routePath.endsWith('/')) {
    routePath += '/';
  } else if (!config.trailingSlash && routePath.endsWith('/') && routePath !== '/') {
    routePath = routePath.slice(0, -1);
  }

  return routePath;
}

/**
 * Automatically discovers routes in the project
 */
export async function discoverRoutes(useCache = true): Promise<RouteDefinition[]> {
  if (useCache && routesCache) {
    return routesCache;
  }

  const config = getConfig();
  
  try {
    // Patterns to find pages
    const patterns = config.pageExtensions.map(ext => 
      `${config.routesDir}/**/page.${ext}`
    );

    const routes: RouteDefinition[] = [];
    
    for (const pattern of patterns) {
      const files = await glob(pattern, { windowsPathsNoEscape: true });
      
      for (const filePath of files) {
        const routePath = filePathToRoutePath(filePath);
        
        // Create a secure dynamic import
        const importPath = path.resolve(filePath).replace(/\\/g, '/');
        
        routes.push({
          path: routePath,
          component: () => import(/* @vite-ignore */ importPath),
          layout: await findLayoutForRoute(filePath),
          metadata: await loadRouteMetadata(filePath)
        });
      }
    }

    // Sort routes by priority (static routes before dynamic)
    routes.sort((a, b) => {
      const aHasDynamic = a.path.includes(':') || a.path.includes('*');
      const bHasDynamic = b.path.includes(':') || b.path.includes('*');
      
      if (aHasDynamic && !bHasDynamic) return 1;
      if (!aHasDynamic && bHasDynamic) return -1;
      return 0;
    });

    routesCache = routes;
    return routes;
    
  } catch (error) {
    console.error('Error discovering routes:', error);
    return [];
  }
}

/**
 * Finds the layout for a given route
 */
async function findLayoutForRoute(routePath: string): Promise<string | undefined> {
  const config = getConfig();
  const routeDir = path.dirname(routePath);
  
  // Search for a layout in the same directory or parent directories
  let currentDir = routeDir;
  
  while (currentDir && currentDir !== config.routesDir) {
    for (const ext of config.pageExtensions) {
      const layoutPath = path.join(currentDir, `layout.${ext}`);
      
      try {
        // Check if file exists (simple verification)
        await import(/* @vite-ignore */ layoutPath);
        return path.relative(config.layoutsDir, layoutPath);
      } catch {
        // Layout not found, continue
      }
    }
    
    // Go up one level
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  
  return config.defaultLayout;
}

/**
 * Loads metadata for a route
 */
async function loadRouteMetadata(routePath: string) {
  try {
    const routeDir = path.dirname(routePath);
    const metaPath = path.join(routeDir, 'metadata.ts');
    
    const metaModule = await import(/* @vite-ignore */ metaPath);
    return metaModule.default || metaModule;
  } catch {
    return undefined;
  }
}

/**
 * Clears the routes cache (useful in development)
 */
export function clearRoutesCache(): void {
  routesCache = null;
}