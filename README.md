# ⚡ Stratus - Lightweight React Framework

A modern, lightweight React framework inspired by Next.js but designed for simplicity and performance. Build fast, scalable applications with file-based routing, service injection, middleware system, and powerful SSR capabilities.

## 🚀 Quick Start

```bash
# Install CLI globally
npm install -g stratus

# Create a new project (interactive)
stratus create my-app

# Or create with specific template
stratus create my-blog --template ssr      # Full SSR
stratus create my-site --template hybrid   # Universal routing
stratus create my-mvp --template default   # Services + middleware

# Start development
cd my-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view your application.

## ✨ Features

- **🗂️ File-Based Routing** - Automatic routing based on file structure
- **⚙️ Service Container** - Dependency injection with clean architecture
- **🛡️ Middleware System** - HOC-based middleware for cross-cutting concerns
- **🎭 SSR & Hybrid Routing** - Full SSR, hybrid rendering, or client-side only
- **🎨 TailwindCSS** - Modern utility-first styling with dark mode
- **🔧 TypeScript First** - Full TypeScript support with excellent DX
- **📦 Lightweight** - Minimal bundle size, maximum performance
- **🛠️ Modern Tooling** - Vite-powered development and building
- **🚢 Easy Deployment** - One-click deployment to Vercel, Netlify, Docker

## 🏗️ Architecture

```
src/
├── app/                    # File-based routes
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Home page (/)
│   └── about/
│       └── page.tsx       # About page (/about)
├── services/              # Service layer with DI
│   └── ApiService.ts      # HTTP service example
├── middleware/            # HOC middleware system
│   └── auth.tsx          # Authentication middleware
└── main.tsx              # App entry point with service registration
```

## 📚 Core Concepts

### File-Based Routing

Routes are automatically created based on file structure:

```
src/app/page.tsx                    → /
src/app/about/page.tsx              → /about
src/app/products/[id]/page.tsx      → /products/:id
src/app/(dashboard)/layout.tsx      → Layout for dashboard pages
```

### Service Container

Clean separation of business logic using dependency injection:

```typescript
// src/services/ApiService.ts
export class HttpService {
  private baseUrl = 'https://api.example.com';
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    return await response.json();
  }
}

// Register in main.tsx
const serviceContainer = new ServiceContainer();
serviceContainer.register('httpService', () => new HttpService());

// Using in components
import { useService } from 'stratus';

export default function UserList() {
  const httpService = useService<HttpService>('httpService');
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    httpService.get('/users').then(setUsers);
  }, [httpService]);
  
  return <div>{/* Render users */}</div>;
}
```

### Server-Side Rendering

Full SSR support with data fetching:

```typescript
import { GetServerSideProps } from 'stratus';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await fetchDataFromAPI();
  return {
    props: {
      data,
      serverTimestamp: new Date().toISOString()
    }
  };
};

export default function Page({ data, serverTimestamp }) {
  return (
    <div>
      <h1>{data.title}</h1>
      <p>Generated at: {serverTimestamp}</p>
    </div>
  );
}
```

### Middleware System

Higher-Order Components for cross-cutting concerns:

```typescript
// src/middleware/auth.tsx
interface AuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export function withAuth<P extends {}>(
  Component: React.ComponentType<P>,
  options: AuthOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    if (options.requireAuth && !isAuthenticated()) {
      return <LoginPage />;
    }
    return <Component {...props} />;
  };
}

// Usage
export default withAuth(MyProtectedPage, { redirectTo: '/login' });
```

## 🎯 Templates

Choose from pre-built templates to kickstart your project:

### 🏗️ Default
**Perfect for:** Most applications, MVPs, client projects
- ✅ Service container with dependency injection
- ✅ Authentication middleware example
- ✅ TailwindCSS with dark mode support
- ✅ TypeScript configuration
- ✅ Modern component architecture

### 🔄 Hybrid
**Perfect for:** Universal applications with SSR needs
- ✅ HybridRouter with client-side and server-side rendering
- ✅ Automatic hydration support
- ✅ All default template features
- ✅ Optimized for SEO and performance
- ✅ Supports both SSR and CSR pages

### 🌐 SSR
**Perfect for:** Content-heavy sites, blogs, e-commerce
- ✅ Full server-side rendering with `getServerSideProps`
- ✅ Demo SSR page with server data fetching
- ✅ Production server configuration
- ✅ Enhanced SEO capabilities
- ✅ All default template features

## 🛠️ CLI Commands

```bash
# Create project
stratus create <name>              # Interactive project creation
stratus create my-app --template ssr --js

# Available templates: default, hybrid, ssr

# Development
stratus dev                        # Start dev server
stratus dev --port 8080           # Custom port

# Building
stratus build                      # Production build
stratus build --ssr               # Build with SSR (ssr template)

# Code Generation
stratus generate page about       # Create page
stratus g service user            # Create service
stratus g layout dashboard        # Create layout

# Deployment
stratus deploy                     # Interactive deployment
stratus deploy --platform vercel  # Deploy to Vercel
```

## 🚢 Deployment

### Vercel (Recommended for SSR)
```bash
stratus deploy --platform vercel
```

### Netlify (Great for static sites)
```bash
stratus deploy --platform netlify
```

### Docker
```bash
stratus deploy --platform docker
```

### Node.js Server
```bash
stratus deploy --platform node
```

## File Structure

```
src/
  app/
    page.tsx          # → /
    about/
      page.tsx        # → /about
      layout.tsx      # Layout for /about
    users/
      [id]/
        page.tsx      # → /users/:id
    blog/
      [...slug]/
        page.tsx      # → /blog/*slug
  layouts/
    main.tsx          # Reusable layouts
  services/
    userService.ts    # Business logic services
```

## Services & Dependency Injection

```tsx
// src/services/ApiService.ts
export class HttpService {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://api.example.com') {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
  }
}

// src/main.tsx - Register services
const serviceContainer = new ServiceContainer();
serviceContainer.register('httpService', () => new HttpService());

// Use in components
function UsersPage() {
  const httpService = useService<HttpService>('httpService');
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    httpService.get('/users').then(setUsers).catch(console.error);
  }, [httpService]);
  
  return <div>{/* render users */}</div>;
}
```

## 📖 Documentation

- [CLI Documentation](./CLI.md) - Complete CLI reference
- [CLAUDE.md](./CLAUDE.md) - Development guidelines and architecture

## 🔧 Configuration

Configure your project in `stratus.config.json`:

```json
{
  "name": "my-app",
  "template": "default",
  "features": {
    "ssr": false,
    "hybrid": false,
    "typescript": true,
    "services": true,
    "middleware": true,
    "tailwindcss": true
  },
  "routing": {
    "routesDir": "src/app",
    "layoutsDir": "src/layouts",
    "pageExtensions": ["tsx", "ts", "jsx", "js"]
  },
  "build": {
    "outDir": "dist",
    "assetsDir": "assets",
    "ssr": false
  },
  "dev": {
    "port": 5173,
    "open": true,
    "host": "localhost"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆚 Why Stratus?

| Feature | Stratus | Next.js | Create React App |
|---------|---------|---------|------------------|
| Bundle Size | ⚡ Minimal | 📦 Large | 📦 Medium |
| Learning Curve | 📈 Easy | 📈 Moderate | 📈 Easy |
| SSR Support | ✅ 3 Options | ✅ Built-in | ❌ No |
| File Routing | ✅ Yes | ✅ Yes | ❌ No |
| Services DI | ✅ Built-in | ❌ Manual | ❌ Manual |
| Middleware | ✅ HOC System | ⚠️ Route-based | ❌ No |
| TailwindCSS | ✅ Pre-configured | ⚠️ Manual setup | ⚠️ Manual setup |
| CLI Tools | ✅ Rich | ✅ Rich | ⚠️ Basic |
| TypeScript | ✅ First-class | ✅ Good | ⚠️ Setup required |

## 🎯 Perfect For

- **Startups** building MVPs quickly
- **Agencies** delivering client projects
- **Developers** who want Next.js simplicity without complexity
- **Teams** needing clean architecture with services
- **Projects** requiring lightweight, fast applications

---

Built with ❤️ for the React community. Start building amazing applications today!

```bash
npx stratus create my-awesome-app
```
