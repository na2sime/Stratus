# Stratus CLI Documentation

The Stratus CLI is a powerful command-line tool for creating and managing Stratus React applications. It provides everything you need to build modern, lightweight React applications with optional SSR support.

## Installation

```bash
npm install -g @wizecorp/stratusjs
```

## Commands Overview

### `stratusjs create <project-name>`

Creates a new Stratus project with interactive setup.

**Options:**
- `-t, --template <template>`: Choose project template (default, blog, dashboard, ecommerce)
- `--ssr`: Enable Server-Side Rendering
- `--js`: Use JavaScript instead of TypeScript

**Examples:**
```bash
stratusjs create my-app
stratusjs create my-blog --template blog --ssr
stratusjs create my-store --template ecommerce --js
```

**Interactive Setup:**
- Project template selection
- TypeScript/JavaScript choice
- SSR enabling
- Dependency installation

---

### `stratusjs dev`

Starts the development server with hot module replacement.

**Options:**
- `-p, --port <port>`: Port number (default: 3000)
- `--ssr`: Enable SSR development mode

**Examples:**
```bash
stratusjs dev
stratusjs dev --port 8080
stratusjs dev --ssr
```

---

### `stratus build`

Builds the project for production.

**Options:**
- `--ssr`: Build with SSR support
- `--static`: Generate static pages

**Examples:**
```bash
stratusjs build
stratusjs build --ssr
stratusjs build --static
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
stratusjs generate page about
stratusjs g service user --dir services
stratusjs g layout dashboard
stratusjs generate middleware auth
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
stratusjs deploy
stratusjs deploy --platform vercel --build
stratusjs deploy --platform docker
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

## Deployment

### Vercel
```bash
stratusjs deploy --platform vercel
```
- Automatic SSR configuration
- Zero-config deployment
- Serverless functions

### Netlify
```bash
stratusjs deploy --platform netlify
```
- Static site deployment
- SPA fallback routing
- Build optimization

### Docker
```bash
stratusjs deploy --platform docker
```
- Containerized deployment
- Production-ready server
- Scalable infrastructure

### Node.js Server
```bash
stratusjs deploy --platform node
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
- Check port availability: `stratusjs dev --port 8080`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**Deployment Issues:**
- Build project first: `stratusjs build`
- Check platform-specific requirements
- Verify configuration files

### Getting Help

1. Check the official documentation
2. Review project configuration
3. Use `stratusjs info` for debugging information
4. Check console logs for detailed error messages