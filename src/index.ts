import { readdir, stat } from 'fs/promises';
import { basename, resolve } from 'path';
import { Directory, FileOrDirectory, RegularFile } from './ts/types.js';
import { getFiletype, removeEmpty } from './utils/helpers.js';
import { getDirname } from './utils/paths.js';

export const walkDir = async (root: string) => {
  const rootAbsolutePath = resolve(getDirname(import.meta), root);
  const rootData = await readdir(rootAbsolutePath, {
    encoding: 'utf8',
    withFileTypes: true,
  });

  return Promise.all(
    rootData.map(async (fileOrDir) => {
      const fileOrDirPath = `${rootAbsolutePath}/${fileOrDir.name}`;
      const relativePath = fileOrDirPath.replace(rootAbsolutePath, '.');
      const { birthtime, mtime } = await stat(fileOrDirPath);
      const sharedData: FileOrDirectory = {
        createdAt: birthtime.toISOString(),
        id: Buffer.from(relativePath).toString('base64'),
        name: basename(fileOrDir.name),
        path: relativePath,
        type: getFiletype(fileOrDir),
        updatedAt: mtime.toISOString(),
      };

      if (fileOrDir.isDirectory()) {
        return {
          ...sharedData,
        } as Directory;
      }

      if (fileOrDir.isFile()) {
        return {
          ...sharedData,
        } as RegularFile;
      }

      return undefined;
    })
  ).then((data) => data.filter(removeEmpty));
};

export default walkDir;
