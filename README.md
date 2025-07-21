# ⚡ Stratus - Lightweight React Framework

A modern, lightweight React framework inspired by Next.js but designed for simplicity and performance. Build fast, scalable applications with file-based routing, built-in services, and optional SSR support.

## 🚀 Quick Start

```bash
# Install CLI globally
npm install -g stratus

# Create a new project
stratus create my-app

# Start development
cd my-app
stratus dev
```

## ✨ Features

- **🗂️ File-Based Routing** - Automatic routing based on file structure
- **⚙️ Dependency Injection** - Clean service architecture for business logic
- **🎭 Server-Side Rendering** - Optional SSR with hydration support
- **🔧 TypeScript First** - Full TypeScript support with excellent DX
- **📦 Lightweight** - Minimal bundle size, maximum performance
- **🛠️ Modern Tooling** - Vite-powered development and building
- **🎨 Template System** - Multiple project templates (blog, dashboard, e-commerce)
- **🚢 Easy Deployment** - One-click deployment to Vercel, Netlify, Docker

## 🏗️ Architecture

```
src/
├── app/                    # File-based routes
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Home page (/)
│   └── about/
│       └── page.tsx       # About page (/about)
├── services/              # Business logic services
├── middleware/            # HOC middleware
└── main.tsx              # App entry point
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

### Services System

Clean separation of business logic using dependency injection:

```typescript
// src/services/userService.ts
export class UserService implements Service {
  readonly name = 'UserService';
  
  async getUsers() {
    return await fetch('/api/users').then(r => r.json());
  }
}

// Using in components
import { useService } from 'stratus';

export default function UserList() {
  const userService = useService(UserService);
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    userService.getUsers().then(setUsers);
  }, []);
  
  return <div>{/* Render users */}</div>;
}
```

### Server-Side Rendering

Optional SSR with simple data fetching:

```typescript
export async function getServerSideProps(context: SSRContext) {
  const data = await fetchData();
  return { props: { data } };
}

export default function Page({ data }) {
  return <div>{data.title}</div>;
}
```

### Middleware System

Higher-Order Components for cross-cutting concerns:

```typescript
// src/middleware/authMiddleware.tsx
export const withAuth = () => (Component) => (props) => {
  // Authentication logic
  return <Component {...props} />;
};

// Usage
export default withAuth()(MyProtectedPage);
```

## 🎯 Templates

Choose from pre-built templates to kickstart your project:

### Default
Basic React application with TypeScript and routing.

### Blog
Static site generation optimized for content sites.

### Dashboard
Admin dashboard with metrics and business logic services.

### E-commerce
Product showcase with shopping cart structure.

## 🛠️ CLI Commands

```bash
# Create project
stratus create <name>              # Interactive project creation
stratus create blog --template blog --ssr

# Development
stratus dev                        # Start dev server
stratus dev --port 8080 --ssr     # Custom port with SSR

# Building
stratus build                      # Production build
stratus build --ssr               # Build with SSR
stratus build --static            # Static site generation

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
// Define a service
export class UserService implements Service {
  readonly name = 'UserService';
  
  async getUsers() {
    // Business logic here
    return await fetch('/api/users').then(r => r.json());
  }
}

// Use in components
function UsersPage() {
  const userService = useService(UserService);
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    userService.getUsers().then(setUsers);
  }, [userService]);
  
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
| SSR Support | ✅ Optional | ✅ Built-in | ❌ No |
| File Routing | ✅ Yes | ✅ Yes | ❌ No |
| Services DI | ✅ Built-in | ❌ Manual | ❌ Manual |
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
