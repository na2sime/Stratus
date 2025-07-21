import inquirer from 'inquirer';
import path from 'path';
import { logger } from '../utils/logger.js';
import { FileUtils } from '../utils/fileUtils.js';

interface GenerateOptions {
  dir?: string;
  service?: boolean;
}

export async function generateCommand(type: string, name: string, options: GenerateOptions) {
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
  } catch (error) {
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
  } catch (error) {
    logger.error(`Failed to generate ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

async function generatePage(name: string, options: GenerateOptions, config: any) {
  const routePath = options.dir ? path.join(options.dir, name) : name;
  const pagePath = path.join(process.cwd(), 'src', 'app', routePath);
  
  // Ensure directory exists
  await FileUtils.ensureDir(pagePath);

  const isTypeScript = config.features?.typescript !== false;
  const ext = isTypeScript ? 'tsx' : 'jsx';
  
  // Generate page component
  const pageContent = generatePageTemplate(name, isTypeScript, options.service);
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

async function generateService(name: string, options: GenerateOptions, config: any) {
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

async function generateLayout(name: string, options: GenerateOptions, config: any) {
  const layoutDir = path.join(process.cwd(), 'src', options.dir || 'layouts');
  
  await FileUtils.ensureDir(layoutDir);

  const isTypeScript = config.features?.typescript !== false;
  const ext = isTypeScript ? 'tsx' : 'jsx';
  
  const layoutContent = generateLayoutTemplate(name, isTypeScript);
  const layoutPath = path.join(layoutDir, `${FileUtils.toCamelCase(name)}.${ext}`);
  
  await FileUtils.createFile(layoutPath, layoutContent);
  logger.info(`🎨 Layout created at: src/${options.dir || 'layouts'}/${FileUtils.toCamelCase(name)}.${ext}`);
}

async function generateMiddleware(name: string, options: GenerateOptions, config: any) {
  const middlewareDir = path.join(process.cwd(), 'src', options.dir || 'middleware');
  
  await FileUtils.ensureDir(middlewareDir);

  const isTypeScript = config.features?.typescript !== false;
  const ext = isTypeScript ? 'ts' : 'js';
  
  const middlewareContent = generateMiddlewareTemplate(name, isTypeScript);
  const middlewarePath = path.join(middlewareDir, `${FileUtils.toCamelCase(name)}.${ext}`);
  
  await FileUtils.createFile(middlewarePath, middlewareContent);
  logger.info(`🛡️ Middleware created at: src/${options.dir || 'middleware'}/${FileUtils.toCamelCase(name)}.${ext}`);
}

function generatePageTemplate(name: string, isTypeScript: boolean, withService: boolean): string {
  const componentName = FileUtils.toPascalCase(name);
  const serviceName = withService ? `${componentName}Service` : null;
  
  const imports = [
    "import React from 'react';",
    withService && isTypeScript ? `import { useService } from 'stratus';` : '',
    withService ? `import { ${serviceName} } from '../../../services/${FileUtils.toCamelCase(serviceName!)}';` : ''
  ].filter(Boolean).join('\n');

  const serviceHook = withService ? `  const ${FileUtils.toCamelCase(serviceName!)} = useService(${serviceName});` : '';

  return `${imports}

export default function ${componentName}Page() {
${serviceHook}

  return (
    <div className="${FileUtils.toKebabCase(name)}-page">
      <h1>${componentName}</h1>
      <p>Welcome to the ${name} page!</p>
    </div>
  );
}
`;
}

function generateServiceTemplate(name: string, isTypeScript: boolean): string {
  const imports = isTypeScript ? "import type { Service } from 'stratus';" : '';
  const interfaceDecl = isTypeScript ? ' implements Service' : '';
  const nameProperty = isTypeScript ? '  readonly name = ' : '  name = ';

  return `${imports}

export class ${name}${interfaceDecl} {
${nameProperty}'${name}';

  async initialize() {
    // Initialize service
  }

  async destroy() {
    // Cleanup service
  }

  // Add your service methods here
  async getData() {
    // Implement your business logic
    return [];
  }
}
`;
}

function generateLayoutTemplate(name: string, isTypeScript: boolean): string {
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

function generateMiddlewareTemplate(name: string, isTypeScript: boolean): string {
  const middlewareName = `with${FileUtils.toPascalCase(name)}`;
  const imports = isTypeScript ? "import type { MiddlewareFunction } from 'stratus';" : '';
  const returnType = isTypeScript ? ': MiddlewareFunction' : '';

  return `import React from 'react';
${imports}

export const ${middlewareName} = ()${returnType} => {
  return (Component) => {
    return (props) => {
      // Add your middleware logic here
      
      return <Component {...props} />;
    };
  };
};
`;
}