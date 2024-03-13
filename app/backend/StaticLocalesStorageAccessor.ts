import { promises as fs } from 'fs';
import { dirname, join } from 'node:path';

// depending on your Typescript settings this may be difference
// we just want to point to your static assets folder, to a directory
// called locales
const projectRoot = dirname(__dirname);
const staticDir = join(projectRoot, 'public')
const localesDir = join(staticDir, 'locales');

export default class StaticLocaleStorageAccessor {

    public static async writeLocales(
        fileName: string,
        localesJson: string
    ): Promise<boolean> {
        try {
            if (process.env.NODE_ENV == "development") {
              // If using a CDN upload here
              return true;
            }
            const filePath = join(localesDir, fileName);
            await fs.writeFile(filePath, Buffer.from(localesJson), {});
            return true;
        } catch(e) {
            console.log("E", e);
            return false;
        }

    }
}