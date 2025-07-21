# Stratus CLI Documentation

The Stratus CLI is a powerful command-line tool for creating and managing Stratus React applications. It provides everything you need to build modern, lightweight React applications with optional SSR support.

## Installation

```bash
npm install -g stratus
```

## Commands Overview

### `stratus create <project-name>`

Creates a new Stratus project with interactive setup.

**Options:**
- `-t, --template <template>`: Choose project template (default, blog, dashboard, ecommerce)
- `--ssr`: Enable Server-Side Rendering
- `--js`: Use JavaScript instead of TypeScript

**Examples:**
```bash
stratus create my-app
stratus create my-blog --template blog --ssr
stratus create my-store --template ecommerce --js
```

**Interactive Setup:**
- Project template selection
- TypeScript/JavaScript choice
- SSR enabling
- Dependency installation

---

### `stratus dev`

Starts the development server with hot module replacement.

**Options:**
- `-p, --port <port>`: Port number (default: 3000)
- `--ssr`: Enable SSR development mode

**Examples:**
```bash
stratus dev
stratus dev --port 8080
stratus dev --ssr
```

---

### `stratus build`

Builds the project for production.

**Options:**
- `--ssr`: Build with SSR support
- `--static`: Generate static pages

**Examples:**
```bash
stratus build
stratus build --ssr
stratus build --static
```

**Build Process:**
1. TypeScript type checking (if enabled)
2. Vite production build
3. SSR server bundle (if enabled)
4. Static page generation (if enabled)

---

### `stratus generate <type> <name>`

Generates components, services, layouts, and middleware.

**Alias:** `stratus g`

**Types:**
- `page` or `p`: Generate a page component
- `service` or `s`: Generate a service class
- `layout` or `l`: Generate a layout component
- `middleware` or `m`: Generate middleware

**Options:**
- `-d, --dir <directory>`: Target directory
- `--service`: Generate with service (for pages)

**Examples:**
```bash
stratus generate page about
stratus g service user --dir services
stratus g layout dashboard
stratus generate middleware auth
```

---

### `stratus deploy`

Deploys the project to various platforms.

**Options:**
- `-p, --platform <platform>`: Deployment platform (vercel|netlify|docker|node)
- `--build`: Build before deploying

**Supported Platforms:**
- **Vercel**: Automatic SSR support with vercel.json
- **Netlify**: Static deployment with SPA fallback
- **Docker**: Containerized deployment with Dockerfile
- **Node.js**: Raw Node.js server deployment

**Examples:**
```bash
stratus deploy
stratus deploy --platform vercel --build
stratus deploy --platform docker
```

---

### `stratus info`

Shows project information and configuration.

**Output:**
- Framework version
- Node.js version
- Platform information
- Project configuration

---

## Project Structure

```
my-stratus-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── about/
│   │       └── page.tsx    # About page
│   ├── services/           # Business logic services
│   ├── middleware/         # HOC middleware
│   ├── layouts/           # Reusable layouts
│   └── main.tsx           # Application entry point
├── templates/             # Project templates
├── stratus.config.json    # Stratus configuration
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Configuration

### stratus.config.json

```json
{
  "name": "my-app",
  "features": {
    "typescript": true,
    "ssr": false
  },
  "dev": {
    "port": 3000
  },
  "build": {
    "outDir": "dist"
  }
}
```

## Templates

### Default Template
- Basic React application
- TypeScript configured
- Vite build system
- File-based routing
- Service container ready

### Blog Template
- Static site generation optimized
- SSR enabled by default
- Blog post structure
- SEO friendly

### Dashboard Template
- Admin dashboard layout
- SSR support
- Metrics components
- Business logic services

### E-commerce Template
- Product showcase
- Shopping cart structure
- Payment ready
- SSR optimized

## File-Based Routing

Stratus uses file-based routing similar to Next.js:

- `src/app/page.tsx` → `/`
- `src/app/about/page.tsx` → `/about`
- `src/app/products/[id]/page.tsx` → `/products/:id`
- `src/app/(group)/layout.tsx` → Layout for group

## Services System

Services provide clean separation of business logic:

```typescript
// src/services/userService.ts
export class UserService implements Service {
  readonly name = 'UserService';

  async initialize() {
    // Service initialization
  }

  async getUsers() {
    // Business logic
  }
}

// Using in components
import { useService } from 'stratus';

function UserList() {
  const userService = useService(UserService);
  // Use service methods
}
```

## SSR Support

Server-Side Rendering is supported through the SSR renderer:

```typescript
// Page with server-side props
export async function getServerSideProps(context: SSRContext) {
  return {
    props: {
      data: await fetchData()
    }
  };
}
```

## Middleware System

Higher-Order Components for cross-cutting concerns:

```typescript
// src/middleware/authMiddleware.tsx
export const withAuth = (): MiddlewareFunction => {
  return (Component) => {
    return (props) => {
      // Authentication logic
      return <Component {...props} />;
    };
  };
};

// Usage in pages
export default withAuth()(MyPage);
```

## Deployment

### Vercel
```bash
stratus deploy --platform vercel
```
- Automatic SSR configuration
- Zero-config deployment
- Serverless functions

### Netlify
```bash
stratus deploy --platform netlify
```
- Static site deployment
- SPA fallback routing
- Build optimization

### Docker
```bash
stratus deploy --platform docker
```
- Containerized deployment
- Production-ready server
- Scalable infrastructure

### Node.js Server
```bash
stratus deploy --platform node
```
- Raw Node.js deployment
- Express server included
- Manual server management

## Best Practices

1. **Project Structure**: Keep pages in `src/app/`, services in `src/services/`
2. **Services**: Use services for business logic, keep components focused on UI
3. **Middleware**: Apply middleware for authentication, logging, analytics
4. **SSR**: Use SSR for SEO-critical pages, static generation for performance
5. **TypeScript**: Enable TypeScript for better developer experience
6. **Build Optimization**: Use `--static` for maximum performance when possible

## Troubleshooting

### Common Issues

**Build Errors:**
- Ensure all dependencies are installed: `npm install`
- Check TypeScript configuration if using TS
- Verify file paths and imports

**Development Server Issues:**
- Check port availability: `stratus dev --port 8080`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**Deployment Issues:**
- Build project first: `stratus build`
- Check platform-specific requirements
- Verify configuration files

### Getting Help

1. Check the official documentation
2. Review project configuration
3. Use `stratus info` for debugging information
4. Check console logs for detailed error messages

---

## Migration Guide

### From Create React App

1. Install Stratus CLI: `npm install -g stratus`
2. Create new project: `stratus create my-app`
3. Move components to `src/app/` structure
4. Update imports and routing
5. Configure services if needed

### From Next.js

1. Create Stratus project with similar template
2. Move pages to `src/app/` structure
3. Convert API routes to services
4. Update configuration for SSR if needed
5. Test and deploy

The Stratus CLI provides a complete development experience with modern tooling, flexible architecture, and multiple deployment options while remaining lightweight and developer-friendly.