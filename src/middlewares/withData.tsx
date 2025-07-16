import React, { useState, useEffect } from 'react';
import { MiddlewareFunction } from '../core/types';

export interface WithDataOptions<T> {
    fetcher: () => Promise<T>;

    loadingComponent?: React.ReactNode;

    errorComponent?: (error: Error) => React.ReactNode;

    propName?: string;

    deps?: React.DependencyList;
}

export function withData<T = any>(
    options: WithDataOptions<T>
): MiddlewareFunction {
    const {
        fetcher,
        loadingComponent = <div>Chargement...</div>,
    errorComponent = (error) => <div>Erreur: {error.message}</div>,
    propName = 'data',
        deps = []
} = options;

    return (Component) => {
        return (props) => {
            const [data, setData] = useState<T | null>(null);
            const [loading, setLoading] = useState<boolean>(true);
            const [error, setError] = useState<Error | null>(null);

            useEffect(() => {
                let isMounted = true;

                const loadData = async () => {
                    try {
                        setLoading(true);
                        const result = await fetcher();

                        if (isMounted) {
                            setData(result);
                            setError(null);
                        }
                    } catch (err) {
                        if (isMounted) {
                            setError(err instanceof Error ? err : new Error('Unknown error'));
                        }
                    } finally {
                        if (isMounted) {
                            setLoading(false);
                        }
                    }
                };

                loadData();

                return () => {
                    isMounted = false;
                };
            }, deps);

            if (loading) {
                return <>{loadingComponent}</>;
            }

            if (error) {
                return <>{errorComponent(error)}</>;
            }

            // Passe les données au composant via la prop spécifiée
            const dataProps = { [propName]: data };
            return <Component {...props} {...dataProps} />;
        };
    };
}