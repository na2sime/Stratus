# {{PROJECT_NAME_PASCAL}}

A modern React application built with full Server-Side Rendering (SSR), featuring advanced SSR capabilities, services, middleware, and TailwindCSS.

## Features

- 🔥 **Full SSR** - Complete server-side rendering with `getServerSideProps` and `getStaticProps`
- 🔄 **Hybrid Router** - Universal routing with SSR capabilities and client-side hydration
- 🚀 **Stratus Framework** - Lightweight React framework with file-system routing
- 🎨 **TailwindCSS** - Modern utility-first CSS framework
- 🔧 **Services** - Dependency injection with service containers
- 🛡️ **Middleware** - HOC-based middleware system for authentication and more
- ⚡ **Fast** - Lazy loading and code splitting out of the box
- 🌙 **Dark Mode** - Built-in dark mode support with TailwindCSS
- 🌍 **SEO Optimized** - Server-side rendering for better search engine optimization

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Build

Build the application for production:

```bash
npm run build
```

### Build for SSR

Build the application with SSR support:

```bash
npm run build:ssr
```

### Start Production Server

Start the production SSR server:

```bash
npm start
```

### Lint

Run ESLint to check code quality:

```bash
npm run lint
```

## Project Structure

```
src/
├── app/                    # Pages and layouts
│   ├── about/             # About page with SSR demo
│   │   └── page.tsx       # About page with getServerSideProps
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── services/              # Service layer
│   └── ApiService.ts      # HTTP service for API calls
├── middleware/            # Middleware components
│   └── auth.tsx          # Authentication middleware
├── index.css             # Global styles with TailwindCSS
└── main.tsx              # Application entry point
```

## Architecture

### Services

Services are registered in `main.tsx` and can be injected into components using the `useService` hook:

```tsx
import { useService } from 'stratus';
import { HttpService } from './services/ApiService';

function MyComponent() {
  const httpService = useService<HttpService>('httpService');
  // Use the service...
}
```

### Middleware

Middleware are Higher-Order Components (HOCs) that wrap your components with additional functionality:

```tsx
import { withAuth } from './middleware/auth';

function ProtectedPage() {
  return <div>Protected content</div>;
}

export default withAuth(ProtectedPage, { redirectTo: '/login' });
```

### Server-Side Rendering

This template demonstrates full SSR capabilities with data fetching:

```tsx
import { GetServerSideProps } from 'stratus';

// This function runs on the server for each request
export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await fetchDataFromAPI();
  return {
    props: {
      data,
    },
  };
};

function MyPage({ data }) {
  return <div>{data.title}</div>;
}
```

### Hybrid Router

This template uses the Stratus HybridRouter which supports both client-side and server-side rendering with automatic hydration:

```tsx
import { HybridRouter } from 'stratus';

export default function RootLayout() {
  return (
    <HybridRouter 
      fallback={<LoadingSpinner />}
    />
  );
}
```

### Routing

Stratus uses file-system based routing. Create files in the `src/app` directory:

- `src/app/page.tsx` → `/`
- `src/app/about/page.tsx` → `/about`
- `src/app/users/[id]/page.tsx` → `/users/:id`

## Styling

This project uses TailwindCSS for styling. The configuration is in `tailwind.config.js`.

### Dark Mode

Dark mode is enabled by default and uses the `class` strategy. Toggle dark mode by adding/removing the `dark` class from the HTML element.

## Learn More

- [Stratus Documentation](https://stratus-framework.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [React Documentation](https://react.dev)