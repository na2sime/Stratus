import React, {useEffect, useState} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {RouteDefinition} from './types';
import {discoverRoutes, applyMiddlewares} from './routeUtils';

interface AppRouterProps {
    fallback?: React.ReactNode;

    errorElement?: React.ReactNode;

    routes?: RouteDefinition[];
}

export const AppRouter: React.FC<AppRouterProps> = ({
                                                        fallback = <div>Loading...</div>,
                                                        errorElement = <div>Something went wrong</div>,
                                                        routes: predefinedRoutes
                                                    }) => {
    const [routes, setRoutes] = useState<RouteDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Si des routes sont prédéfinies, utilisez-les
        if (predefinedRoutes) {
            setRoutes(predefinedRoutes);
            setLoading(false);
            return;
        }

        const loadRoutes = async () => {
            try {
                const discoveredRoutes = await discoverRoutes();
                setRoutes(discoveredRoutes);
                setLoading(false);
            } catch (error) {
                console.error('Failed to discover routes:', error);
                setError(error instanceof Error ? error : new Error('Unknown error'));
                setLoading(false);
            }
        };

        loadRoutes();
    }, [predefinedRoutes]);

    if (loading) {
        return <>{fallback}</>;
    }

    if (error) {
        return <>{errorElement}</>;
    }

    return (
        <BrowserRouter>
            <Routes>
                {routes.map((route) => {
                    // Applique les middlewares au composant de route
                    const RouteComponent = applyMiddlewares(route.component, route.middlewares);
                    return (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={<RouteComponent/>}
                        />
                    );
                })}
            </Routes>
        </BrowserRouter>
    );
};