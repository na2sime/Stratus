import { MiddlewareFunction, RouteComponent } from './types';

export function composeMiddlewares(...middlewares: MiddlewareFunction[]): MiddlewareFunction {
    return (Component: RouteComponent) => {
        return middlewares.reduce(
            (wrapped, middleware) => middleware(wrapped),
            Component
        );
    };
}

export function createConditionalMiddleware(
    condition: () => boolean,
    middleware: MiddlewareFunction
): MiddlewareFunction {
    return (Component: RouteComponent) => {
        return (props: any) => {
            if (condition()) {
                const EnhancedComponent = middleware(Component);
                return <EnhancedComponent {...props} />;
            }
            return <Component {...props} />;
        };
    };
}

export function createRouteSpecificMiddleware(
    routePatterns: string[],
    middleware: MiddlewareFunction
): MiddlewareFunction {
    return (Component: RouteComponent) => {
        return (props: any) => {
            const currentPath = window.location.pathname;

            const shouldApply = routePatterns.some(pattern => {
                const regexPattern = pattern
                    .replace(/:\w+/g, '[^/]+')  // Remplace :param par [^/]+
                    .replace(/\//g, '\\/');     // Échappe les /

                const regex = new RegExp(`^${regexPattern}$`);
                return regex.test(currentPath);
            });

            if (shouldApply) {
                const EnhancedComponent = middleware(Component);
                return <EnhancedComponent {...props} />;
            }

            return <Component {...props} />;
        };
    };
}