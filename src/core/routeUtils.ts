import { glob } from 'glob';
import * as path from 'path';
import { RouteDefinition, MiddlewareFunction, RouteComponent } from './types';


export function filePathToRoutePath(filePath: string): string {
    let routePath = filePath
        .replace(/^src[\\/]app/, '')
        .replace(/[\\/]view\.tsx$/, '');

    routePath = routePath.replace(/\\/g, '/');

    routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1');

    if (!routePath) return '/';

    return routePath;
}

export async function loadMiddlewares(dirPath: string): Promise<MiddlewareFunction[]> {
    try {
        const middlewarePath = path.join(dirPath, 'middleware.ts');

        // @ts-ignore
        const module = await import(/* @vite-ignore */ middlewarePath);

        if (Array.isArray(module.default)) {
            return module.default;
        }

        if (typeof module.default === 'function') {
            return [module.default];
        }

        return [];
    } catch (error) {
        return [];
    }
}

export async function discoverRoutes(): Promise<RouteDefinition[]> {
    try {
        const viewFiles = await glob('src/app/**/view.tsx');

        const routes: RouteDefinition[] = [];

        for (const filePath of viewFiles) {
            const dirPath = path.dirname(filePath);
            const routePath = filePathToRoutePath(filePath);

            const viewModule = await import(/* @vite-ignore */ `/${filePath}`);
            const component = viewModule.default;

            const middlewares = await loadMiddlewares(dirPath);

            routes.push({
                path: routePath,
                component,
                middlewares
            });
        }

        return routes;
    } catch (error) {
        console.error('Error discovering routes:', error);
        return [];
    }
}

export function applyMiddlewares(
    Component: RouteComponent,
    middlewares: MiddlewareFunction[]
): RouteComponent {
    return middlewares.reduce(
        (WrappedComponent, middleware) => middleware(WrappedComponent),
        Component
    );
}