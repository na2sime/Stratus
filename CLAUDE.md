# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stratus is a lightweight React framework library inspired by Next.js, providing file-system-based routing with automatic code splitting, layouts, middleware support, dependency injection services, and SSR capabilities. Built as a TypeScript library for npm distribution.

## Development Commands

- `npm run dev` - Start Vite development server for testing/development
- `npm run build` - Full build (TypeScript compilation + Vite build for distribution)
- `npm run build:lib` - Library-specific TypeScript compilation (used for npm publishing)
- `npm run lint` - Run ESLint with TypeScript support
- `npm run preview` - Preview the Vite build
- `npm run prepublishOnly` - Automated build step before npm publishing

## Architecture

### Core Components

**AppRouter** (`src/core/AppRouter.tsx`): Main router with lazy loading support:
- Auto-discovers routes from `src/app/**/page.tsx` files (configurable)
- Lazy loads components and layouts for optimal performance
- Built-in error boundaries and loading states
- Configurable via props or global config

**Configuration** (`src/config.ts`): Centralized configuration system:
- `routesDir`: Where to find pages (default: "src/app")
- `layoutsDir`: Where to find layouts (default: "src/layouts")  
- `pageExtensions`: Supported file extensions (default: ["tsx", "ts", "jsx", "js"])
- `basePath`, `trailingSlash`: URL configuration options

**Route Discovery** (`src/core/routeUtils.ts`):
- `discoverRoutes()`: Scans for `page.tsx` files with caching
- `filePathToRoutePath()`: Converts file paths to URL routes
- Supports dynamic routes `[param]` and catch-all `[...param]`
- Automatic layout detection from `layout.tsx` files

### Hooks (`src/hooks/index.ts`)

- `useRouter()`: Main router hook with navigation methods
- `useRouteParams<T>()`: Typed route parameters
- `useQuery<T>()`: Typed query parameters  
- `useNavigation()`: Navigation utilities (navigate, back, forward)

### Middleware System (`src/middleware/index.ts`)

Simple HOC-based middleware:
- `withAuth(options)`: Authentication protection
- `withLayout(Layout)`: Wrap components with layouts
- `withErrorBoundary(options)`: Error handling
- `composeMiddleware(...middleware)`: Combine multiple middleware
- `createMiddleware(fn)`: Helper for custom middleware

### File System Routing

**Pages**: Routes discovered from `page.tsx` files:
- `src/app/page.tsx` → `/`
- `src/app/about/page.tsx` → `/about`
- `src/app/users/[id]/page.tsx` → `/users/:id`
- `src/app/blog/[...slug]/page.tsx` → `/blog/*slug`

**Layouts**: Optional layout files:
- `src/app/layout.tsx` → Root layout
- `src/app/dashboard/layout.tsx` → Dashboard layout (applies to all dashboard pages)
- Layouts are automatically nested based on file structure

**Metadata**: Optional metadata files:
- `src/app/metadata.ts` → Route metadata (title, description, etc.)

### Services & Dependency Injection (`src/services/`)

**ServiceContainer** (`src/services/ServiceContainer.ts`): Dependency injection container:
- Register services as singletons or factories
- Async service initialization support
- Circular dependency detection
- Automatic service cleanup

**Built-in Services**:
- `HttpService`: REST API client with interceptors and error handling
- `LocalStorageService`/`SessionStorageService`: Browser storage abstraction
- `AuthService`: Authentication state management
- `MemoryStorageService`: In-memory storage for SSR compatibility

**Service Hooks**:
- `useService<T>(token)`: Get service instance
- `useOptionalService<T>(token)`: Get service without throwing if not found
- `useServiceContainer()`: Direct access to container

### Server-Side Rendering (`src/ssr/`)

**SSRRenderer** (`src/ssr/SSRRenderer.tsx`): Server-side rendering support:
- `renderPage()`: Render pages server-side with service injection
- `generateStaticPages()`: Build-time static page generation
- Support for `getServerSideProps` and `getStaticProps`
- Hydration data management

**HybridRouter** (`src/core/HybridRouter.tsx`): Universal router:
- Supports both client-side and server-side rendering
- Automatic hydration from server-rendered content
- Service container integration

### Key Features

- **Lazy Loading**: All routes and layouts are lazy-loaded by default
- **Code Splitting**: Automatic code splitting per route
- **Layout Caching**: Layouts are cached for performance
- **Route Caching**: Route discovery is cached (clearable with `clearRoutesCache()`)
- **Service Architecture**: Clean separation of business logic via DI container
- **SSR Support**: Optional server-side rendering with hydration
- **TypeScript**: Full TypeScript support with proper typing
- **Configurable**: Flexible configuration without breaking simplicity

## Usage Example

```tsx
import { AppRouter } from 'stratus';

function App() {
  return (
    <AppRouter 
      config={{
        routesDir: 'src/pages',
        basePath: '/app'
      }}
      fallback={<div>Loading...</div>}
    />
  );
}
```

## Important Notes

- Framework focuses on simplicity while maintaining Next.js-like developer experience
- Optional SSR support via HybridRouter for enhanced performance
- Uses React Router DOM under the hood for actual routing
- Designed as a library to be integrated into existing React applications
- All imports are lazy-loaded for optimal bundle splitting
- Service container provides clean architecture patterns from backend development
- Built-in services handle common patterns (HTTP, storage, auth) with SSR compatibility