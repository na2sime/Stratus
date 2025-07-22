import path from 'path';
import { logger } from '../utils/logger.js';
import { FileUtils } from '../utils/fileUtils.js';
export async function generateCommand(type, name, options) {
    logger.info(`Generating ${type}: ${name}`);
    // Check if we're in a Stratus project
    const configPath = path.join(process.cwd(), 'stratus.config.json');
    if (!await FileUtils.fileExists(configPath)) {
        logger.error('Not a Stratus project! Run this command in a Stratus project directory.');
        process.exit(1);
    }
    // Load project config
    let config;
    try {
        const fs = await import('fs-extra');
        config = await fs.readJSON(configPath);
    }
    catch {
        logger.error('Failed to read stratus.config.json');
        process.exit(1);
    }
    try {
        switch (type.toLowerCase()) {
            case 'page':
            case 'p':
                await generatePage(name, options, config);
                break;
            case 'service':
            case 's':
                await generateService(name, options, config);
                break;
            case 'layout':
            case 'l':
                await generateLayout(name, options, config);
                break;
            case 'middleware':
            case 'm':
                await generateMiddleware(name, options, config);
                break;
            default:
                logger.error(`Unknown type: ${type}`);
                logger.info('Available types: page (p), service (s), layout (l), middleware (m)');
                process.exit(1);
        }
        logger.success(`✨ ${type} '${name}' generated successfully!`);
    }
    catch (error) {
        logger.error(`Failed to generate ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
}
async function generatePage(name, options, config) {
    const routePath = options.dir ? path.join(options.dir, name) : name;
    const pagePath = path.join(process.cwd(), 'src', 'app', routePath);
    // Ensure directory exists
    await FileUtils.ensureDir(pagePath);
    const isTypeScript = config.features?.typescript !== false;
    const ext = isTypeScript ? 'tsx' : 'jsx';
    // Generate page component
    const pageContent = generatePageTemplate(name, isTypeScript, !!options.service);
    await FileUtils.createFile(path.join(pagePath, `page.${ext}`), pageContent);
    // Generate layout if it doesn't exist
    const layoutPath = path.join(pagePath, `layout.${ext}`);
    if (!await FileUtils.fileExists(layoutPath)) {
        const layoutContent = generateLayoutTemplate(name, isTypeScript);
        await FileUtils.createFile(layoutPath, layoutContent);
    }
    // Generate service if requested
    if (options.service) {
        const serviceName = `${FileUtils.toPascalCase(name)}Service`;
        await generateService(serviceName, { dir: 'services' }, config);
    }
    logger.info(`📄 Page created at: src/app/${routePath}`);
}
async function generateService(name, options, config) {
    const serviceName = name.endsWith('Service') ? name : `${name}Service`;
    const serviceDir = path.join(process.cwd(), 'src', options.dir || 'services');
    await FileUtils.ensureDir(serviceDir);
    const isTypeScript = config.features?.typescript !== false;
    const ext = isTypeScript ? 'ts' : 'js';
    const serviceContent = generateServiceTemplate(serviceName, isTypeScript);
    const servicePath = path.join(serviceDir, `${FileUtils.toCamelCase(serviceName)}.${ext}`);
    await FileUtils.createFile(servicePath, serviceContent);
    logger.info(`🔧 Service created at: src/${options.dir || 'services'}/${FileUtils.toCamelCase(serviceName)}.${ext}`);
}
async function generateLayout(name, options, config) {
    const layoutDir = path.join(process.cwd(), 'src', options.dir || 'layouts');
    await FileUtils.ensureDir(layoutDir);
    const isTypeScript = config.features?.typescript !== false;
    const ext = isTypeScript ? 'tsx' : 'jsx';
    const layoutContent = generateLayoutTemplate(name, isTypeScript);
    const layoutPath = path.join(layoutDir, `${FileUtils.toCamelCase(name)}.${ext}`);
    await FileUtils.createFile(layoutPath, layoutContent);
    logger.info(`🎨 Layout created at: src/${options.dir || 'layouts'}/${FileUtils.toCamelCase(name)}.${ext}`);
}
async function generateMiddleware(name, options, config) {
    const middlewareDir = path.join(process.cwd(), 'src', options.dir || 'middleware');
    await FileUtils.ensureDir(middlewareDir);
    const isTypeScript = config.features?.typescript !== false;
    const ext = isTypeScript ? 'ts' : 'js';
    const middlewareContent = generateMiddlewareTemplate(name, isTypeScript);
    const middlewarePath = path.join(middlewareDir, `${FileUtils.toCamelCase(name)}.${ext}`);
    await FileUtils.createFile(middlewarePath, middlewareContent);
    logger.info(`🛡️ Middleware created at: src/${options.dir || 'middleware'}/${FileUtils.toCamelCase(name)}.${ext}`);
}
function generatePageTemplate(name, isTypeScript, withService) {
    const componentName = FileUtils.toPascalCase(name);
    const serviceName = withService ? `${componentName}Service` : null;
    const imports = [
        "import React, { useState, useEffect } from 'react';",
        withService && isTypeScript ? `import { useService } from 'stratus';` : '',
        withService ? `import { ${serviceName} } from '../../../services/${FileUtils.toCamelCase(serviceName)}';` : ''
    ].filter(Boolean).join('\n');
    const serviceLogic = withService ? `
  const [data, setData] = useState${isTypeScript ? '<any[]>' : ''}([]);
  const [loading, setLoading] = useState(true);
  const ${FileUtils.toCamelCase(serviceName)} = useService${isTypeScript ? `<${serviceName}>` : ''}('${FileUtils.toCamelCase(serviceName)}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await ${FileUtils.toCamelCase(serviceName)}.getData();
        setData(result);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [${FileUtils.toCamelCase(serviceName)}]);` : '';
    const renderContent = withService ? `
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            This page uses the ${serviceName} to fetch data.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Data from service:</h3>
            <pre className="text-sm text-gray-600">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      )}` : `
      <p className="text-gray-600 mb-6">
        Welcome to the ${name} page! This page was generated using the Stratus CLI.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Getting Started
          </h2>
          <p className="text-blue-700 dark:text-blue-300">
            Edit this page in <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">src/app/${FileUtils.toKebabCase(name)}/page.tsx</code>
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
            Add Features
          </h2>
          <p className="text-green-700 dark:text-green-300">
            Use <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded">stratus generate service</code> to add business logic
          </p>
        </div>
      </div>`;
    return `${imports}

export default function ${componentName}Page() {${serviceLogic}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            ${componentName}
          </h1>
          ${renderContent}
        </div>
      </div>
    </div>
  );
}
`;
}
function generateServiceTemplate(name, isTypeScript) {
    const typeAnnotations = isTypeScript ? ': Promise<unknown[]>' : '';
    return `/**
 * ${name} - Business logic service
 * Handles data operations and business rules
 */
export class ${name} {
  private baseUrl${isTypeScript ? ': string' : ''};

  constructor(baseUrl${isTypeScript ? ': string' : ''} = 'https://api.example.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize service connections and dependencies
   */
  async initialize()${isTypeScript ? ': Promise<void>' : ''} {
    // Initialize service resources
  }

  /**
   * Cleanup service resources
   */
  async destroy()${isTypeScript ? ': Promise<void>' : ''} {
    // Cleanup resources
  }

  /**
   * Fetch data from the API
   */
  async getData()${typeAnnotations} {
    try {
      const response = await fetch(\`\${this.baseUrl}/data\`);
      if (!response.ok) {
        throw new Error(\`HTTP Error: \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw error;
    }
  }

  /**
   * Create new data entry
   */
  async createData(data${isTypeScript ? ': any' : ''})${typeAnnotations} {
    try {
      const response = await fetch(\`\${this.baseUrl}/data\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(\`HTTP Error: \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create data:', error);
      throw error;
    }
  }
}
`;
}
function generateLayoutTemplate(name, isTypeScript) {
    const componentName = FileUtils.toPascalCase(name);
    const propsType = isTypeScript ? ': { children: React.ReactNode }' : '';
    return `import React from 'react';

export default function ${componentName}Layout({ children }${propsType}) {
  return (
    <div className="${FileUtils.toKebabCase(name)}-layout">
      <header>
        <h1>${componentName} Layout</h1>
      </header>
      <main>
        {children}
      </main>
      <footer>
        <p>&copy; 2024 ${componentName}</p>
      </footer>
    </div>
  );
}
`;
}
function generateMiddlewareTemplate(name, isTypeScript) {
    const middlewareName = `with${FileUtils.toPascalCase(name)}`;
    const componentType = isTypeScript ? 'React.ComponentType<P>' : '';
    const optionsType = isTypeScript ? `: ${FileUtils.toPascalCase(name)}Options` : '';
    const propsType = isTypeScript ? '<P extends {}>' : '';
    const componentProps = isTypeScript ? '(props: P)' : '(props)';
    const optionsInterface = FileUtils.toPascalCase(name) + 'Options';
    // Build the interface declaration separately to avoid 'interface' keyword issues
    const interfaceKeyword = 'interface';
    const interfaceDeclaration = isTypeScript ? `
/**
 * Configuration options for ${name} middleware
 */
${interfaceKeyword} ${optionsInterface} {
  enabled?: boolean;
  // Add your configuration options here
}` : '';
    const template = `import React from 'react';
${interfaceDeclaration}

/**
 * ${middlewareName} - HOC middleware for ${name}
 * 
 * Usage:
 * export default ${middlewareName}(MyComponent, { enabled: true });
 */
export function ${middlewareName}${propsType}(
  Component${isTypeScript ? `: ${componentType}` : ''},
  options${optionsType} = {}
) {
  return function ${FileUtils.toPascalCase(name)}Component${componentProps} {
    const { enabled = true } = options;

    // Early return if middleware is disabled
    if (!enabled) {
      return <Component {...props} />;
    }

    // Add your middleware logic here
    // Examples:
    // - Authentication checks
    // - Permission validation  
    // - Analytics tracking
    // - Error boundaries
    // - Loading states
    
    // Example: Log component renders in development
    if (process.env.NODE_ENV === 'development') {
      console.log(\`\${Component.name || 'Component'} rendered with ${name} middleware\`);
    }

    return <Component {...props} />;
  };
}

/**
 * Hook version for functional components
 */
export function use${FileUtils.toPascalCase(name)}(options${optionsType} = {}) {
  const { enabled = true } = options;
  
  // Add your hook logic here
  // Return any values that components might need
  
  return {
    enabled,
    // Add your return values here
  };
}
`;
    return template;
}
