import React from 'react';
import { MiddlewareFunction } from '../core/types';

export interface WithAuthOptions {
    isAuthenticated?: () => boolean;
    redirectTo?: string;
    fallback?: React.ReactNode;
}

export const withAuth = (options: WithAuthOptions = {}): MiddlewareFunction => {
    const {
        isAuthenticated = () => localStorage.getItem('auth_token') !== null,
        redirectTo = '/login',
        fallback = <div>Redirection vers la page de connexion...</div>
} = options;

    return (Component) => {
        return (props) => {
            if (!isAuthenticated()) {
                React.useEffect(() => {
                    window.location.href = redirectTo;
                }, []);

                return <>{fallback}</>;
            }

            return <Component {...props} />;
        };
    };
};