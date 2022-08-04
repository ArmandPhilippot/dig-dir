import { Dirent } from 'fs';
import { basename } from 'path';
import { FileType } from '../ts/enums.js';
import { Directory, FileOrDirectoryParent, RegularFile } from '../ts/types.js';

/**
 * Retrieve a FileType from a Dirent object.
 *
 * @param {Dirent} dirent - A representation of a directory entry.
 * @returns {FileType} The matching FileType.
 */
export const getFiletype = (dirent: Dirent): FileType => {
  if (dirent.isDirectory()) return FileType.DIRECTORY;
  if (dirent.isFile()) return FileType.FILE;
  return FileType.UNKNOWN;
};

/**
 * Method to remove undefined data from an array.
 *
 * @param data - A possible data.
 * @returns {boolean} True if it is an existing data.
 */
export const removeEmpty = <T>(data: T | undefined | null): data is T => {
  if (data === undefined) return false;
  return true;
};

/**
 * Retrieve the subdirectories in a directory content.
 *
 * @param {(Directory | RegularFile)[]} dir - A directory content.
 * @returns {Directory[]} The subdirectories.
 */
export const getSubdirectoriesIn = (
  dir: (Directory | RegularFile)[]
): Directory[] => {
  return dir.filter(
    (fileOrDir) => fileOrDir.type === FileType.DIRECTORY
  ) as Directory[];
};

/**
 * Retrieve the files in a directory content.
 *
 * @param {(Directory | RegularFile)[]} dir - A directory content.
 * @returns {RegularFile[]} The files.
 */
export const getFilesIn = (dir: (Directory | RegularFile)[]): RegularFile[] => {
  return dir.filter(
    (fileOrDir) => fileOrDir.type === FileType.FILE
  ) as RegularFile[];
};

/**
 * Retrieve a parent object (name & path).
 *
 * @param {string} path - The current file or directory path.
 * @param {string} filename - The current filename.
 * @returns {FileOrDirectoryParent | undefined} Maybe the parent object.
 */
export const getParent = (
  path: string,
  filename: string
): FileOrDirectoryParent | undefined => {
  const parentPath = path.replace(`/${filename}`, '');
  const parentName = basename(parentPath);

  return parentName === '.'
    ? undefined
    : { name: parentName, path: parentPath };
};

/**
 * Retrieve the depth of a path.
 *
 * `0` match the first directory.
 *
 * Examples:
 * * Depth of `/home/username/directory/subdirectory` is `3`.
 * * Depth of `./directory/subdirectory` is `2`.
 *
 * @param {string} path - A path.
 * @returns {number} The depth.
 */
export const getDepthOf = (path: string): number => {
  const normalizedPath = path.endsWith('/')
    ? path.substring(0, path.length - 1)
    : path;

  if (normalizedPath.startsWith('/')) {
    return normalizedPath.substring(1).split('/').length;
  } else if (normalizedPath.startsWith('./')) {
    return normalizedPath.split('/').length - 1;
  } else {
    throw new Error('Path not recognized.');
  }
};

/**
 * Determine if we can go deeper.
 *
 * If depth is `undefined` the return is always `true`.
 *
 * @param {string} currentPath - The current path.
 * @param {number | undefined} depth - The allowed depth.
 * @returns {boolean} True if the current depth is lower or equal to depth.
 */
export const shouldBeRecursive = (
  currentPath: string,
  depth?: number
): boolean => {
  if (depth === undefined) return true;

  const currentDepth = getDepthOf(currentPath);

  return currentDepth <= depth;
};
