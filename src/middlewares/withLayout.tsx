import React from 'react';
import {MiddlewareFunction, MiddlewareProps} from '../core/types';

export const withLayout = (
    Layout: React.ComponentType<MiddlewareProps>
): MiddlewareFunction => {
    return (Component) => {
        return (props) => (
            <Layout>
                <Component {...props} />
            </Layout>
        );
    };
};