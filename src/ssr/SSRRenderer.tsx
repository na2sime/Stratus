import { renderToString } from 'react-dom/server';
import { ServiceProvider } from '../services/ServiceContext';
import { ServiceContainer } from '../services/ServiceContainer';
import type { 
  SSRContext, 
  SSRRenderResult, 
  SSRRouteDefinition, 
  SSRConfig,
  HydrationData 
} from './types';
import type { RouteDefinition } from '../core/types';

/**
 * Server-side renderer for Stratus applications
 */
export class SSRRenderer {
  private config: SSRConfig;
  private routes: SSRRouteDefinition[] = [];

  constructor(config: SSRConfig) {
    this.config = {
      port: 3000,
      staticDir: 'public',
      template: this.getDefaultTemplate(),
      ...config
    };
  }

  /**
   * Set routes for SSR
   */
  setRoutes(routes: RouteDefinition[]): void {
    this.routes = routes as SSRRouteDefinition[];
  }

  /**
   * Render a page server-side
   */
  async renderPage(context: SSRContext): Promise<SSRRenderResult> {
    try {
      // Find matching route
      const route = this.findMatchingRoute(context.pathname);
      
      if (!route) {
        return this.renderNotFound(context);
      }

      // Setup services for server-side
      if (this.config.setupServices) {
        await this.config.setupServices(context.services, context);
      }

      // Load server-side data if available
      let pageProps: Record<string, any> = {};
      let redirect: string | undefined;
      let statusCode = 200;

      if (route.getServerSideProps) {
        const result = await route.getServerSideProps(context);
        
        if (result.redirect) {
          return {
            html: '',
            initialData: {},
            statusCode: result.redirect.permanent ? 301 : 302,
            redirect: result.redirect.destination,
            headers: {}
          };
        }
        
        if (result.notFound) {
          return this.renderNotFound(context);
        }
        
        pageProps = result.props || {};
      }

      // Load component
      const componentModule = await route.component();
      const Component = componentModule.default;

      // Prepare hydration data
      const hydrationData: HydrationData = {
        pathname: context.pathname,
        params: context.params,
        query: context.query,
        props: pageProps
      };

      // Render component (simplified for SSR)
      const app = (
        <ServiceProvider container={context.services}>
          <Component {...pageProps} />
        </ServiceProvider>
      );

      const html = renderToString(app);

      // Generate full HTML with template
      const fullHtml = this.generateHTML(html, hydrationData);

      return {
        html: fullHtml,
        initialData: hydrationData,
        statusCode,
        redirect,
        headers: {}
      };

    } catch (error) {
      if (this.config.onError) {
        this.config.onError(error as Error, context);
      }
      
      return this.renderError(error as Error, context);
    }
  }

  /**
   * Generate static pages (for build time)
   */
  async generateStaticPages(): Promise<Array<{ path: string; html: string }>> {
    const staticPages: Array<{ path: string; html: string }> = [];

    for (const route of this.routes) {
      if (route.getStaticPaths && route.getStaticProps) {
        // Dynamic static pages
        const { paths } = await route.getStaticPaths();
        
        for (const pathInfo of paths) {
          const mockContext = this.createMockContext(route.path, pathInfo.params);
          const result = await route.getStaticProps({
            params: pathInfo.params
          });

          if (!result.notFound && !result.redirect) {
            const componentModule = await route.component();
            const Component = componentModule.default;
            
            const app = (
              <ServiceProvider container={new ServiceContainer()}>
                <Component {...result.props} />
              </ServiceProvider>
            );

            const html = renderToString(app);
            const fullHtml = this.generateHTML(html, {
              pathname: mockContext.pathname,
              params: pathInfo.params,
              query: {},
              props: result.props
            });

            staticPages.push({
              path: mockContext.pathname,
              html: fullHtml
            });
          }
        }
      } else if (route.getStaticProps && !route.path.includes(':')) {
        // Static page without dynamic segments
        const result = await route.getStaticProps({ params: {} });

        if (!result.notFound && !result.redirect) {
          const componentModule = await route.component();
          const Component = componentModule.default;
          
          const app = (
            <ServiceProvider container={new ServiceContainer()}>
              <Component {...result.props} />
            </ServiceProvider>
          );

          const html = renderToString(app);
          const fullHtml = this.generateHTML(html, {
            pathname: route.path,
            params: {},
            query: {},
            props: result.props
          });

          staticPages.push({
            path: route.path,
            html: fullHtml
          });
        }
      }
    }

    return staticPages;
  }

  /**
   * Find matching route for a pathname
   */
  private findMatchingRoute(pathname: string): SSRRouteDefinition | undefined {
    return this.routes.find(route => {
      // Simple pattern matching - can be enhanced
      if (route.path === pathname) return true;
      
      // Handle dynamic routes
      const routeSegments = route.path.split('/');
      const pathSegments = pathname.split('/');
      
      if (routeSegments.length !== pathSegments.length) return false;
      
      return routeSegments.every((segment, index) => {
        return segment.startsWith(':') || segment.startsWith('*') || segment === pathSegments[index];
      });
    });
  }

  /**
   * Generate full HTML document
   */
  private generateHTML(content: string, hydrationData: HydrationData): string {
    const hydrationScript = `
      <script>
        window.__STRATUS_DATA__ = ${JSON.stringify(hydrationData).replace(/</g, '\\u003c')};
      </script>
    `;

    if (this.config.document) {
      // Use custom document component
      const Document = this.config.document;
      const documentHtml = renderToString(
        <Document 
          html={content}
          initialData={hydrationData}
        />
      );
      
      return `<!DOCTYPE html>${documentHtml}${hydrationScript}`;
    }

    // Use default template
    return this.config.template!
      .replace('{{content}}', content)
      .replace('{{hydration}}', hydrationScript);
  }

  /**
   * Render 404 page
   */
  private renderNotFound(context: SSRContext): SSRRenderResult {
    const html = this.generateHTML(
      '<div><h1>404 - Page Not Found</h1></div>',
      {
        pathname: context.pathname,
        params: {},
        query: {},
        props: {}
      }
    );

    return {
      html,
      initialData: {},
      statusCode: 404,
      headers: {}
    };
  }

  /**
   * Render error page
   */
  private renderError(error: Error, context: SSRContext): SSRRenderResult {
    const html = this.generateHTML(
      `<div><h1>500 - Server Error</h1><p>${error.message}</p></div>`,
      {
        pathname: context.pathname,
        params: {},
        query: {},
        props: {}
      }
    );

    return {
      html,
      initialData: {},
      statusCode: 500,
      headers: {}
    };
  }

  /**
   * Create mock context for static generation
   */
  private createMockContext(path: string, params: Record<string, string>): SSRContext {
    return {
      request: {
        url: path,
        method: 'GET',
        headers: {},
        cookies: {}
      },
      response: {
        status: 200,
        headers: {}
      },
      pathname: path,
      params,
      query: {},
      services: new ServiceContainer(),
      data: {}
    };
  }

  /**
   * Default HTML template
   */
  private getDefaultTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Stratus App</title>
        </head>
        <body>
          <div id="root">{{content}}</div>
          {{hydration}}
          <script src="/bundle.js"></script>
        </body>
      </html>
    `;
  }
}