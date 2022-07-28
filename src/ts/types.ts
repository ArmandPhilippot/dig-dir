import { FileType } from './enums.js';

export type FileOrDirectoryParent = {
  name: string;
  path: string;
};

export type FileOrDirectory<T extends FileType = FileType> = {
  createdAt: string;
  id: string;
  name: string;
  parent?: FileOrDirectoryParent;
  path: string;
  type: T;
  updatedAt: string;
};

export type Directory = FileOrDirectory<FileType.DIRECTORY> & {
  files?: RegularFile[];
  subDirectories?: Directory[];
};

export type RegularFile = FileOrDirectory<FileType.FILE> & {
  content?: string;
  extension?: string;
};
