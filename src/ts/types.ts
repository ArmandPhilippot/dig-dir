import { FileType } from './enums.js';

/**
 * Type can be of given type or undefined.
 */
export type Maybe<T> = T | undefined;

export type Extension = `.${string}` | '';

export type FileOrDirectoryParent = {
  name: string;
  path: string;
};

export type FileOrDirectoryPaths = {
  absolute: string;
  relative: string;
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
  subdirectories?: Directory[];
};

export type RegularFile = FileOrDirectory<FileType.FILE> & {
  content?: string;
  extension?: Extension;
};

export type TypeFilter = FileType.DIRECTORY | FileType.FILE;

export type WalkDirFilters<T extends Maybe<TypeFilter> = undefined> = {
  extensions?: Extension[];
  filename?: string;
  type?: T;
};

export type WalkDirOptions<T extends Maybe<TypeFilter> = undefined> = {
  filters?: WalkDirFilters<T>;
  includeFileContent?: boolean;
  depth?: number;
};

export type WalkDirOutput = {
  [FileType.DIRECTORY]: Directory[];
  [FileType.FILE]: RegularFile[];
  undefined: (Directory | RegularFile)[];
};

export type WalkDirReturn<
  T extends Maybe<TypeFilter> = undefined,
  V extends keyof WalkDirOutput = T extends undefined ? 'undefined' : T
> = WalkDirOutput[V];
