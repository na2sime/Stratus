import { ComponentType, ReactNode } from 'react';

export type RouteComponent = ComponentType<any>;

export type MiddlewareFunction = (Component: RouteComponent) => RouteComponent;

export interface RouteDefinition {
    path: string;
    component: RouteComponent;
    middlewares: MiddlewareFunction[];
}

export interface MiddlewareProps {
    children: ReactNode;
}