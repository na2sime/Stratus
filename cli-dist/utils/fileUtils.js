import fs from 'fs-extra';
import path from 'path';
import { logger } from './logger.js';
export class FileUtils {
    static async ensureDir(dirPath) {
        try {
            await fs.ensureDir(dirPath);
        }
        catch (error) {
            logger.error(`Failed to create directory: ${dirPath}`);
            throw error;
        }
    }
    static async copyTemplate(templatePath, targetPath, replacements = {}) {
        try {
            await fs.copy(templatePath, targetPath, {
                filter: (src) => {
                    // Skip node_modules and other unwanted folders
                    return !src.includes('node_modules') && !src.includes('.git');
                }
            });
            // Replace placeholders in files
            if (Object.keys(replacements).length > 0) {
                await this.replaceInFiles(targetPath, replacements);
            }
        }
        catch (error) {
            logger.error(`Failed to copy template from ${templatePath} to ${targetPath}`);
            throw error;
        }
    }
    static async replaceInFiles(dirPath, replacements) {
        const files = await this.getAllFiles(dirPath);
        for (const file of files) {
            // Skip binary files
            if (this.isBinaryFile(file))
                continue;
            try {
                let content = await fs.readFile(file, 'utf8');
                // Replace placeholders
                for (const [placeholder, value] of Object.entries(replacements)) {
                    const regex = new RegExp(placeholder, 'g');
                    content = content.replace(regex, value);
                }
                await fs.writeFile(file, content, 'utf8');
            }
            catch {
                logger.warn(`Failed to process file: ${file}`);
            }
        }
    }
    static async getAllFiles(dirPath) {
        const files = [];
        async function scanDir(currentPath) {
            const entries = await fs.readdir(currentPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);
                if (entry.isDirectory()) {
                    await scanDir(fullPath);
                }
                else {
                    files.push(fullPath);
                }
            }
        }
        await scanDir(dirPath);
        return files;
    }
    static isBinaryFile(filePath) {
        const binaryExtensions = [
            '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
            '.zip', '.tar', '.gz', '.exe', '.bin', '.dmg',
            '.pdf', '.doc', '.docx', '.xls', '.xlsx'
        ];
        return binaryExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
    }
    static async createFile(filePath, content) {
        try {
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, content, 'utf8');
        }
        catch (error) {
            logger.error(`Failed to create file: ${filePath}`);
            throw error;
        }
    }
    static async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    static toPascalCase(str) {
        return str
            .split(/[-_\s]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }
    static toCamelCase(str) {
        const pascal = this.toPascalCase(str);
        return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    }
    static toKebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase()
            .replace(/[_\s]+/g, '-');
    }
}
