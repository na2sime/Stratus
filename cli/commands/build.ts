import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../utils/logger.js';
import { FileUtils } from '../utils/fileUtils.js';

interface BuildOptions {
  ssr?: boolean;
  static?: boolean;
}

export async function buildCommand(options: BuildOptions) {
  logger.info('Building Stratus project for production...');

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

  // Set build environment
  process.env.NODE_ENV = 'production';
  process.env.STRATUS_MODE = 'production';
  
  if (options.ssr || config.features?.ssr) {
    process.env.STRATUS_SSR = 'true';
    logger.info('Building with SSR support');
  }

  if (options.static) {
    process.env.STRATUS_STATIC = 'true';
    logger.info('Building static pages');
  }

  try {
    logger.startSpinner('Building project...');

    // Clean dist directory
    const fs = await import('fs-extra');
    const outDir = path.join(process.cwd(), config.build?.outDir || 'dist');
    await fs.emptyDir(outDir);

    // Run TypeScript check if enabled
    if (config.features?.typescript) {
      logger.updateSpinner('Type checking...');
      await runCommand('npx', ['tsc', '--noEmit']);
    }

    // Build with Vite
    logger.updateSpinner('Building with Vite...');
    await runCommand('npx', ['vite', 'build']);

    // If SSR is enabled, build server bundle
    if (options.ssr || config.features?.ssr) {
      logger.updateSpinner('Building SSR server...');
      await buildSSRServer(config);
    }

    // If static generation is enabled
    if (options.static) {
      logger.updateSpinner('Generating static pages...');
      await generateStaticPages(config);
    }

    logger.succeedSpinner('Build completed successfully!');
    
    // Show build info
    await showBuildInfo(outDir);

  } catch (error) {
    logger.failSpinner('Build failed');
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

async function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    let stderr = '';

    process.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      } else {
        resolve();
      }
    });
  });
}

async function buildSSRServer(config: any): Promise<void> {
  // Create server build configuration
  const serverBuildConfig = {
    build: {
      ssr: true,
      outDir: path.join(config.build?.outDir || 'dist', 'server'),
      rollupOptions: {
        input: 'src/server.ts'
      }
    }
  };

  // Create temporary vite config for SSR
  const fs = await import('fs-extra');
  const tempConfigPath = path.join(process.cwd(), 'vite.ssr.config.js');
  
  await fs.writeFile(tempConfigPath, `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(${JSON.stringify(serverBuildConfig, null, 2)});
  `);

  try {
    await runCommand('npx', ['vite', 'build', '--config', 'vite.ssr.config.js']);
  } finally {
    // Clean up temp config
    await fs.remove(tempConfigPath);
  }
}

async function generateStaticPages(config: any): Promise<void> {
  logger.info('Generating static pages...');
  
  // Create a simple static page generator
  const fs = await import('fs-extra');
  const path = await import('path');
  const outDir = config.build?.outDir || 'dist';
  
  // Find all pages in src/app
  const appDir = path.join(process.cwd(), 'src', 'app');
  const pages = await findPages(appDir);
  
  // Generate static HTML for each page
  for (const page of pages) {
    const pagePath = page.replace(appDir, '').replace(/\\/g, '/');
    const route = pagePath === '/page.tsx' ? '/' : pagePath.replace('/page.tsx', '');
    
    // Create static HTML template
    const htmlContent = await generateStaticHTML(route, config);
    
    // Write HTML file
    const outputPath = path.join(outDir, route === '/' ? 'index.html' : `${route}/index.html`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, htmlContent);
    
    logger.info(`Generated: ${outputPath}`);
  }
}

async function findPages(dir: string): Promise<string[]> {
  const fs = await import('fs-extra');
  const path = await import('path');
  const pages: string[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        pages.push(...await findPages(fullPath));
      } else if (entry.name === 'page.tsx' || entry.name === 'page.jsx') {
        pages.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return pages;
}

async function generateStaticHTML(route: string, config: any): Promise<string> {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.name || 'Stratus App'}</title>
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" href="/assets/index.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
}

async function showBuildInfo(outDir: string): Promise<void> {
  const fs = await import('fs-extra');
  
  try {
    // Get directory size
    const stats = await getDirectorySize(outDir);
    
    console.log('\n📦 Build Summary:');
    console.log(`   Output directory: ${outDir}`);
    console.log(`   Total size: ${formatBytes(stats.size)}`);
    console.log(`   Files created: ${stats.files}`);
    
    // List main files
    const files = await fs.readdir(outDir);
    if (files.length > 0) {
      console.log('\n📄 Generated files:');
      for (const file of files.slice(0, 10)) { // Show first 10 files
        const filePath = path.join(outDir, file);
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          console.log(`   ${file} (${formatBytes(stat.size)})`);
        } else if (stat.isDirectory()) {
          console.log(`   ${file}/ (directory)`);
        }
      }
      if (files.length > 10) {
        console.log(`   ... and ${files.length - 10} more files`);
      }
    }
    
  } catch (error) {
    // Ignore errors in showing build info
  }
}

async function getDirectorySize(dirPath: string): Promise<{ size: number; files: number }> {
  const fs = await import('fs-extra');
  let totalSize = 0;
  let fileCount = 0;

  async function scan(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        totalSize += stats.size;
        fileCount++;
      }
    }
  }

  await scan(dirPath);
  return { size: totalSize, files: fileCount };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}