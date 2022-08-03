import { Dirent } from 'fs';
import { readdir, readFile, stat } from 'fs/promises';
import { basename, extname } from 'path';
import { FileType } from './ts/enums.js';
import {
  Directory,
  Extension,
  FileOrDirectory,
  FileOrDirectoryPaths,
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

/**
 * Retrieve a parent object.
 *
 * @param {string} path - The current file or directory path.
 * @param {string} filename - The current filename.
 * @returns {FileOrDirectory['parent']} Maybe an object with name and path.
 */
const getParent = (
  path: string,
  filename: string
): FileOrDirectory['parent'] => {
  const parentPath = path.replace(`/${filename}`, '');
  const parentName = basename(parentPath);

  return parentName === '.'
    ? undefined
    : { name: parentName, path: parentPath };
};

/**
 * Retrieve the shared data between Directory and File objects.
 *
 * @param {Dirent} fileOrDir - A Dirent object.
 * @param {FileOrDirectoryPaths} paths - A paths object (absolute and relative).
 * @returns {Promise<FileOrDirectory<T>>} A FileOrDirectory object.
 */
const getSharedData = async <T extends FileType>(
  fileOrDir: Dirent,
  paths: FileOrDirectoryPaths
): Promise<FileOrDirectory<T>> => {
  const { birthtime, mtime } = await stat(paths.absolute);

  return {
    createdAt: birthtime.toISOString(),
    id: Buffer.from(paths.relative).toString('base64'),
    name: basename(fileOrDir.name),
    parent: getParent(paths.relative, fileOrDir.name),
    path: paths.relative,
    type: getFiletype(fileOrDir) as T,
    updatedAt: mtime.toISOString(),
  };
};

/**
 * Retrieve a Directory object.
 *
 * @param {Dirent} dir - A Dirent object.
 * @param {WalkDirOptions<T>} options - The walkDir options.
 * @param {FileOrDirectoryPaths} paths - A paths object (absolute and relative).
 * @param {string[]} acc - The walkDir accumulator.
 * @returns {Promise<Directory>} The Directory object.
 */
const getDirectoryData = async <T extends Maybe<TypeFilter> = undefined>(
  dir: Dirent,
  options: WalkDirOptions<T>,
  paths: FileOrDirectoryPaths,
  acc: string[]
): Promise<Directory> => {
  const partialData = await getSharedData<FileType.DIRECTORY>(dir, paths);
  const dirData =
    options.recursive && (await walkDir(paths.absolute, options, acc));
  const dirChildren = dirData
    ? {
        files: getFilesIn(dirData),
        subdirectories: getSubdirectoriesIn(dirData),
      }
    : {};

  return {
    ...partialData,
    ...dirChildren,
  };
};

/**
 * Retrieve a RegularFile object.
 *
 * If the  walkDir extensions option is set, the return value can be undefined.
 * Otherwise, it will be a RegularFile object.
 *
 * @param {Dirent} file - A Dirent object.
 * @param {WalkDirOptions<T>} options - The walkDir options.
 * @param {FileOrDirectoryPaths} paths - A paths object (absolute and relative).
 * @returns {Promise<RegularFile | undefined>} Maybe the RegularFile object.
 */
const getFileData = async <T extends Maybe<TypeFilter> = undefined>(
  file: Dirent,
  options: WalkDirOptions<T>,
  paths: FileOrDirectoryPaths
): Promise<RegularFile | undefined> => {
  const extension = extname(file.name) as Extension;

  if (
    options.filters?.extensions &&
    !options.filters.extensions.includes(extension)
  ) {
    return undefined;
  }

  const partialData = await getSharedData<FileType.FILE>(file, paths);
  const content = options.includeFileContent
    ? await readFile(paths.absolute, 'utf8')
    : undefined;

  return {
    ...partialData,
    extension,
    content,
  };
};

/**
 * Retrieve a directory contents.
 *
 * @param {string} path - An absolute path to a directory.
 * @param {string[]} acc - The walkDir accumulator.
 * @returns {Promise<Dirent[] | undefined>} The directory contents if readable.
 */
const readdirSafely = async (
  path: string,
  acc: string[]
): Promise<Dirent[] | undefined> => {
  try {
    return await readdir(path, {
      encoding: 'utf8',
      withFileTypes: true,
    });
  } catch (error) {
    if (acc.length > 0) {
      console.error(error);
      return undefined;
    } else {
      throw error;
    }
  }
};

/**
 * Walk through a directory.
 *
 * If a protected directory is inside the root path, WalkDir will return some
 * info about the protected directory but not its contents. If the protected
 * directory is the root path, an error will be thrown.
 *
 * @param {string} root - An absolute path pointing to the starting directory.
 * @param {WalkDirOptions<T>} options - An object of options.
 * @param {string[]} acc - An accumulator to keep track of starting path.
 * @returns {Promise<WalkDirReturn<T>>} The directory contents.
 */
export const walkDir = async <T extends Maybe<TypeFilter> = undefined>(
  root: string,
  options: WalkDirOptions<T> = {
    includeFileContent: false,
    recursive: true,
  },
  acc: string[] = []
): Promise<WalkDirReturn<T>> => {
  const rootData = await readdirSafely(root, acc);

  acc.push(root);
  const initialPath = acc[0] || root;

  const { filters } = options;
  const shouldOnlyIncludeFiles = filters?.type === FileType.FILE;
  const shouldOnlyIncludeDirectories = filters?.type === FileType.DIRECTORY;

  const data =
    rootData &&
    (await Promise.all(
      rootData.map(async (fileOrDir) => {
        if (filters?.filename && !fileOrDir.name.includes(filters.filename)) {
          return undefined;
        }

        const fileOrDirPath = `${root}/${fileOrDir.name}`;
        const relativePath = fileOrDirPath.replace(initialPath, '.');
        const paths = { absolute: fileOrDirPath, relative: relativePath };

        switch (getFiletype(fileOrDir)) {
          case FileType.DIRECTORY:
            return shouldOnlyIncludeFiles
              ? undefined
              : getDirectoryData(fileOrDir, options, paths, acc);
          case FileType.FILE:
            return shouldOnlyIncludeDirectories
              ? undefined
              : getFileData(fileOrDir, options, paths);
          default:
            return undefined;
        }
      })
    ));

  return data?.filter(removeEmpty) as WalkDirReturn<T>;
};

export default walkDir;
