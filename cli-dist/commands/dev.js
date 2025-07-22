import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../utils/logger.js';
import { FileUtils } from '../utils/fileUtils.js';
export async function devCommand(options) {
    logger.info('Starting Stratus development server...');
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
    // Check if package.json exists
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!await FileUtils.fileExists(packageJsonPath)) {
        logger.error('package.json not found! Run `npm install` first.');
        process.exit(1);
    }
    // Set environment variables
    process.env.STRATUS_MODE = 'development';
    const port = options.port || config.dev?.port || '5173';
    process.env.STRATUS_PORT = port;
    if (options.ssr || config.features?.ssr) {
        process.env.STRATUS_SSR = 'true';
        logger.info('SSR mode enabled');
    }
    // Start development server
    logger.startSpinner('Starting development server...');
    try {
        // Use Vite for development
        const viteProcess = spawn('npx', ['vite', '--port', port], {
            stdio: 'pipe',
            shell: true,
            cwd: process.cwd()
        });
        // Pipe output to console
        viteProcess.stdout?.pipe(process.stdout);
        viteProcess.stderr?.pipe(process.stderr);
        logger.succeedSpinner(`Development server running on http://localhost:${port}`);
        // Handle process termination
        process.on('SIGINT', () => {
            logger.info('Stopping development server...');
            viteProcess.kill();
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            viteProcess.kill();
            process.exit(0);
        });
        // Handle Vite process exit
        viteProcess.on('exit', (code) => {
            if (code !== 0) {
                logger.error(`Development server exited with code ${code}`);
                process.exit(code || 1);
            }
        });
    }
    catch (error) {
        logger.failSpinner('Failed to start development server');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}
