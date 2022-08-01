import { readdir, readFile, stat } from 'fs/promises';
import { basename, extname, resolve } from 'path';
import { FileType } from './ts/enums.js';
import {
  Directory,
  FileOrDirectory,
  Maybe,
  RegularFile,
  TypeFilter,
  WalkDirOptions,
  WalkDirReturn,
} from './ts/types.js';
import {
  getFilesIn,
  getFiletype,
  getSubdirectoriesIn,
  removeEmpty,
} from './utils/helpers.js';
import { getDirname } from './utils/paths.js';

/**
 * Walk through a directory.
 *
 * @param {string} root - The starting directory path.
 * @param {WalkDirOptions<T>} options - An object of options.
 * @param {string[]} acc - An accumulator to keep track of starting path.
 * @returns {Promise<WalkDirOutput[V]>} The directory contents.
 */
export const walkDir = async <T extends Maybe<TypeFilter> = undefined>(
  root: string,
  { includeFileContent, filters, recursive }: WalkDirOptions<T> = {
    includeFileContent: false,
    recursive: true,
  },
  acc: string[] = []
): Promise<WalkDirReturn<T>> => {
  const rootAbsolutePath = resolve(getDirname(import.meta), root);
  const rootData = await readdir(rootAbsolutePath, {
    encoding: 'utf8',
    withFileTypes: true,
  });

  acc.push(rootAbsolutePath);
  const initialPath = acc[0] || rootAbsolutePath;

  const data = await Promise.all(
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
        if (filters?.type === FileType.FILE) return undefined;

        const dirData =
          recursive &&
          (await walkDir(
            fileOrDirPath,
            { includeFileContent, filters, recursive },
            acc
          ));
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
        if (filters?.type === FileType.DIRECTORY) return undefined;

        return {
          ...sharedData,
          content: await readFile(fileOrDirPath, 'utf8'),
          extension: extname(fileOrDir.name),
        } as RegularFile;
      }

      return undefined;
    })
  );

  return data.filter(removeEmpty) as WalkDirReturn<T>;
};

export default walkDir;
