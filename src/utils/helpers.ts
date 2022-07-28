import { Dirent } from 'fs';
import { FileType } from '../ts/enums.js';

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
 * Method to remove null or undefined data from an array.
 *
 * @param data - A possible data.
 * @returns {boolean} True if it is an existing data.
 */
export const removeEmpty = <T>(data: T | undefined | null): data is T => {
  if (data === null || data === undefined) return false;
  return true;
};
