import { Dirent } from 'fs';
import { FileType } from '../ts/enums.js';
import { Directory, RegularFile } from '../ts/types.js';

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
