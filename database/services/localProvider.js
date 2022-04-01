import { resolve } from 'path';
import { createReadStream } from 'fs';
import { stat, readdir } from 'fs/promises';

export class LocalProvider {

    constructor(basePath) {
        this.basePath = basePath || '';
    }

    /**
     * Recursively lists all files within a directory.
     * @param {*} path 
     * @returns 
     */
    async listFiles(path) {
        const targetPath = resolve(path);
        const metadata = await stat(targetPath);
        if (!metadata.isDirectory()) {
            return [];
        }

        let filePaths = [];
        for (const filePath of await readdir(targetPath)) {
            const metadata = await stat(filePath);
            if (metadata.isFile()) {
                filePaths.push(filePath);
            }
            else if (metadata.isDirectory()) {
                const subFilePaths = await this.listFiles(filePath);
                filePaths = filePaths.concat(subFilePaths);
            }
        }
        return filePaths;
    }

    async readFile(path) {
        return createReadStream(path);
    }

    async readFileMetadata(path) {
        return await stat(path);
    }
}