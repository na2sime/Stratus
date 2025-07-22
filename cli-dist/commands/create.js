import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';
import { FileUtils } from '../utils/fileUtils.js';
export async function createCommand(projectName, options) {
    logger.info(`Creating new Stratus project: ${projectName}`);
    // Validate project name
    if (!isValidProjectName(projectName)) {
        logger.error('Invalid project name. Use only alphanumeric characters, hyphens, and underscores.');
        process.exit(1);
    }
    const projectPath = path.resolve(process.cwd(), projectName);
    // Check if directory already exists
    if (await FileUtils.fileExists(projectPath)) {
        logger.error(`Directory ${projectName} already exists!`);
        process.exit(1);
    }
    // Interactive setup if no options provided
    if (!options.template && !options.ssr && !options.js) {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'template',
                message: 'Choose a template:',
                choices: [
                    { name: 'Default (Services + Middleware + TailwindCSS)', value: 'default' },
                    { name: 'Hybrid (Universal routing with SSR support)', value: 'hybrid' },
                    { name: 'SSR (Full server-side rendering)', value: 'ssr' }
                ],
                default: 'default'
            },
            {
                type: 'confirm',
                name: 'useTypeScript',
                message: 'Use TypeScript?',
                default: true
            },
            {
                type: 'list',
                name: 'packageManager',
                message: 'Choose package manager:',
                choices: ['npm', 'yarn', 'pnpm'],
                default: 'npm'
            }
        ]);
        options.template = answers.template;
        options.ssr = answers.template === 'ssr' || answers.template === 'hybrid';
        options.js = !answers.useTypeScript;
    }
    try {
        await createProject(projectName, projectPath, options);
        logger.success(`\n🎉 Project ${projectName} created successfully!\n`);
        // Show next steps
        console.log('Next steps:');
        console.log(`  cd ${projectName}`);
        console.log('  npm install');
        console.log('  npm run dev');
        // Show template specific information
        if (options.template === 'ssr') {
            console.log('\n📋 SSR Template Features:');
            console.log('  - Full server-side rendering with getServerSideProps');
            console.log('  - Demo SSR page at /about');
            console.log('  - Use "npm run build:ssr" for production build');
            console.log('  - Use "npm start" to run production server');
        }
        else if (options.template === 'hybrid') {
            console.log('\n📋 Hybrid Template Features:');
            console.log('  - Universal routing with SSR support');
            console.log('  - Client-side hydration');
            console.log('  - Supports both SSR and CSR pages');
        }
        else {
            console.log('\n📋 Default Template Features:');
            console.log('  - Services & middleware architecture');
            console.log('  - TailwindCSS for styling');
            console.log('  - Authentication middleware example');
        }
        console.log('\n🚀 All templates include:');
        console.log('  - Service container for dependency injection');
        console.log('  - Middleware system for cross-cutting concerns');
        console.log('  - TailwindCSS with dark mode support');
        console.log('  - TypeScript support');
        console.log('  - Hot module replacement');
        console.log('\nHappy coding! ⚡');
    }
    catch (error) {
        logger.error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
}
async function createProject(projectName, projectPath, options) {
    logger.startSpinner('Creating project structure...');
    // Get template path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const templatePath = path.join(__dirname, '../../templates', options.template);
    // Check if template exists
    if (!await FileUtils.fileExists(templatePath)) {
        logger.failSpinner(`Template '${options.template}' not found!`);
        throw new Error(`Template not found: ${options.template}`);
    }
    // Create project directory
    await FileUtils.ensureDir(projectPath);
    
    // Copy template
    logger.updateSpinner('Copying template files...');
    const replacements = {
        '{{PROJECT_NAME}}': projectName,
        '{{PROJECT_NAME_PASCAL}}': FileUtils.toPascalCase(projectName),
        '{{PROJECT_NAME_CAMEL}}': FileUtils.toCamelCase(projectName),
        '{{PROJECT_NAME_KEBAB}}': FileUtils.toKebabCase(projectName),
        '{{ENABLE_SSR}}': options.ssr ? 'true' : 'false',
        '{{USE_TYPESCRIPT}}': !options.js ? 'true' : 'false'
    };
    
    await FileUtils.copyTemplate(templatePath, projectPath, replacements);
    
    // If JavaScript is selected, convert TypeScript files
    if (options.js) {
        logger.updateSpinner('Converting to JavaScript...');
        await convertToJavaScript(projectPath);
    }
    
    // Create Stratus config
    logger.updateSpinner('Creating configuration...');
    await createStratusConfig(projectPath, options);
    logger.succeedSpinner('Project created successfully!');
}
async function convertToJavaScript(projectPath) {
    const files = await FileUtils.getAllFiles(projectPath);
    for (const file of files) {
        if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            const jsFile = file.replace('.ts', '.js');
            await FileUtils.copyTemplate(file, jsFile);
            // Remove original .ts file
            const fs = await import('fs-extra');
            await fs.remove(file);
        }
        else if (file.endsWith('.tsx')) {
            const jsxFile = file.replace('.tsx', '.jsx');
            await FileUtils.copyTemplate(file, jsxFile);
            // Remove original .tsx file
            const fs = await import('fs-extra');
            await fs.remove(file);
        }
    }
}
async function createStratusConfig(projectPath, options) {
    const config = {
        name: path.basename(projectPath),
        version: '1.0.0',
        template: options.template,
        features: {
            ssr: options.template === 'ssr' || options.template === 'hybrid',
            hybrid: options.template === 'hybrid',
            typescript: !options.js,
            services: true,
            middleware: true,
            tailwindcss: true
        },
        routing: {
            routesDir: 'src/app',
            layoutsDir: 'src/layouts',
            pageExtensions: ['tsx', 'ts', 'jsx', 'js']
        },
        build: {
            outDir: 'dist',
            assetsDir: 'assets',
            ssr: options.template === 'ssr'
        },
        dev: {
            port: 5173,
            open: true,
            host: 'localhost'
        }
    };
    const configPath = path.join(projectPath, 'stratus.config.json');
    await FileUtils.createFile(configPath, JSON.stringify(config, null, 2));
}
function isValidProjectName(name) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-_]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(name);
}
