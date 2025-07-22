import inquirer from 'inquirer';
import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../utils/logger.js';
import { FileUtils } from '../utils/fileUtils.js';
export async function deployCommand(options) {
    logger.info('Deploying Stratus project...');
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
    let platform = options.platform;
    // If platform not specified, prompt user
    if (!platform) {
        const platformChoice = await inquirer.prompt([
            {
                type: 'list',
                name: 'platform',
                message: 'Select deployment platform:',
                choices: [
                    { name: 'Vercel', value: 'vercel' },
                    { name: 'Netlify', value: 'netlify' },
                    { name: 'Docker', value: 'docker' },
                    { name: 'Node.js Server', value: 'node' }
                ]
            }
        ]);
        platform = platformChoice.platform;
    }
    try {
        // Build project if requested or if dist doesn't exist
        const distPath = path.join(process.cwd(), config.build?.outDir || 'dist');
        if (options.build || !await FileUtils.fileExists(distPath)) {
            logger.info('Building project for deployment...');
            await buildForDeployment(config, platform);
        }
        // Deploy based on platform
        switch (platform) {
            case 'vercel':
                await deployToVercel();
                break;
            case 'netlify':
                await deployToNetlify();
                break;
            case 'docker':
                await deployWithDocker(config);
                break;
            case 'node':
                await deployToNode(config);
                break;
            default:
                logger.error(`Unsupported platform: ${platform}`);
                process.exit(1);
        }
        logger.success(`🚀 Successfully deployed to ${platform}!`);
    }
    catch (error) {
        logger.error(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
}
async function buildForDeployment(config, platform) {
    const buildOptions = [];
    if (config.features?.ssr && platform !== 'netlify') {
        buildOptions.push('--ssr');
    }
    else {
        buildOptions.push('--static');
    }
    await runCommand('npx', ['stratus', 'build', ...buildOptions]);
}
async function deployToVercel() {
    logger.startSpinner('Deploying to Vercel...');
    // Check if vercel CLI is installed
    try {
        await runCommand('npx', ['vercel', '--version']);
    }
    catch {
        logger.info('Installing Vercel CLI...');
        await runCommand('npm', ['install', '-g', 'vercel']);
    }
    // Create vercel.json if it doesn't exist
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    if (!await FileUtils.fileExists(vercelConfigPath)) {
        const vercelConfig = {
            "buildCommand": "stratus build --ssr",
            "outputDirectory": "dist",
            "installCommand": "npm install",
            "framework": "vite"
        };
        const fs = await import('fs-extra');
        await fs.writeJSON(vercelConfigPath, vercelConfig, { spaces: 2 });
        logger.info('Created vercel.json configuration');
    }
    await runCommand('npx', ['vercel', '--prod']);
    logger.succeedSpinner('Deployed to Vercel successfully!');
}
async function deployToNetlify() {
    logger.startSpinner('Deploying to Netlify...');
    // Check if netlify CLI is installed
    try {
        await runCommand('npx', ['netlify', '--version']);
    }
    catch {
        logger.info('Installing Netlify CLI...');
        await runCommand('npm', ['install', '-g', 'netlify-cli']);
    }
    // Create netlify.toml if it doesn't exist
    const netlifyConfigPath = path.join(process.cwd(), 'netlify.toml');
    if (!await FileUtils.fileExists(netlifyConfigPath)) {
        const netlifyConfig = `[build]
  publish = "dist"
  command = "stratus build --static"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
        const fs = await import('fs-extra');
        await fs.writeFile(netlifyConfigPath, netlifyConfig);
        logger.info('Created netlify.toml configuration');
    }
    await runCommand('npx', ['netlify', 'deploy', '--prod']);
    logger.succeedSpinner('Deployed to Netlify successfully!');
}
async function deployWithDocker(config) {
    logger.startSpinner('Creating Docker deployment...');
    // Create Dockerfile if it doesn't exist
    const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
    if (!await FileUtils.fileExists(dockerfilePath)) {
        const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist ./dist

# Create a simple server for SSR
COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
`;
        const fs = await import('fs-extra');
        await fs.writeFile(dockerfilePath, dockerfile);
        logger.info('Created Dockerfile');
    }
    // Create simple server.js for Docker
    const serverPath = path.join(process.cwd(), 'server.js');
    if (!await FileUtils.fileExists(serverPath)) {
        const serverContent = `const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
        const fs = await import('fs-extra');
        await fs.writeFile(serverPath, serverContent);
        logger.info('Created server.js');
    }
    // Build Docker image
    await runCommand('docker', ['build', '-t', config.name || 'stratus-app', '.']);
    logger.succeedSpinner('Docker image created successfully!');
    logger.info(`Run with: docker run -p 3000:3000 ${config.name || 'stratus-app'}`);
}
async function deployToNode(_config) {
    logger.startSpinner('Preparing Node.js deployment...');
    // Create production package.json
    const fs = await import('fs-extra');
    const originalPackage = await fs.readJSON('package.json');
    const productionPackage = {
        name: originalPackage.name,
        version: originalPackage.version,
        description: originalPackage.description,
        type: "module",
        main: "server.js",
        scripts: {
            start: "node server.js"
        },
        dependencies: {
            express: "^4.18.2",
            ...originalPackage.dependencies
        }
    };
    await fs.writeJSON(path.join('dist', 'package.json'), productionPackage, { spaces: 2 });
    // Copy server files
    const serverContent = `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
    await fs.writeFile(path.join('dist', 'server.js'), serverContent);
    logger.succeedSpinner('Node.js deployment files created!');
    logger.info('Upload the dist/ folder to your server and run: npm install && npm start');
}
async function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args, {
            stdio: 'pipe',
            shell: true,
            cwd: process.cwd()
        });
        let stderr = '';
        childProcess.stderr?.on('data', (data) => {
            stderr += data.toString();
        });
        childProcess.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed with code ${code}: ${stderr}`));
            }
            else {
                resolve();
            }
        });
    });
}
