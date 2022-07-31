import { readdir, readFile, stat } from 'fs/promises';
import { basename, extname, resolve } from 'path';
import {
  Directory,
  FileOrDirectory,
  RegularFile,
  WalkDirOptions,
} from './ts/types.js';
import {
  getFilesIn,
  getFiletype,
  getSubdirectoriesIn,
  removeEmpty,
} from './utils/helpers.js';
import { getDirname } from './utils/paths.js';

const defaultOptions: WalkDirOptions = {
  includeFileContent: false,
  recursive: true,
};

/**
 * Walk through a directory.
 *
 * @param {string} root - The starting directory path.
 * @param {WalkDirOptions} options - An object of options.
 * @param {string[]} acc - An accumulator to keep track of starting path.
 * @returns {Promise<(Directory | RegularFile)[]>} The directory contents.
 */
export const walkDir = async (
  root: string,
  options: WalkDirOptions = defaultOptions,
  acc: string[] = []
): Promise<(Directory | RegularFile)[]> => {
  const rootAbsolutePath = resolve(getDirname(import.meta), root);
  const rootData = await readdir(rootAbsolutePath, {
    encoding: 'utf8',
    withFileTypes: true,
  });

  acc.push(rootAbsolutePath);
  const initialPath = acc[0] || rootAbsolutePath;

  return Promise.all(
    rootData.map(async (fileOrDir) => {
      const fileOrDirPath = `${rootAbsolutePath}/${fileOrDir.name}`;
      const relativePath = fileOrDirPath.replace(initialPath, '.');
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
        const dirData =
          options.recursive && (await walkDir(fileOrDirPath, options, acc));
        const dirChildren = dirData
          ? {
              files: getFilesIn(dirData),
              subdirectories: getSubdirectoriesIn(dirData),
            }
          : {};

        return {
          ...sharedData,
          ...dirChildren,
        } as Directory;
      }

      if (fileOrDir.isFile()) {
        return {
          ...sharedData,
          content: await readFile(fileOrDirPath, 'utf8'),
          extension: extname(fileOrDir.name),
        } as RegularFile;
      }

      return undefined;
    })
  ).then((data) => data.filter(removeEmpty));
};

export default walkDir;
