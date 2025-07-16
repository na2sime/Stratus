export { AppRouter } from './core/AppRouter';

export type {
    RouteComponent,
    MiddlewareFunction,
    RouteDefinition,
    MiddlewareProps
} from './core/types';

export {
    discoverRoutes,
    applyMiddlewares,
    filePathToRoutePath
} from './core/routeUtils';

export * from './middlewares';