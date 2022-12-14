import { Type } from '../utils/constants.js';

/**
 * Type can be of given type or undefined.
 */
export type Maybe<T> = T | undefined;

/**
 * Either an empty string or a string starting with a dot.
 */
export type Extension = `.${string}` | '';

export type FileType = typeof Type[keyof typeof Type];

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

export type Directory = FileOrDirectory<'directory'> & {
  files?: RegularFile[];
  subdirectories?: Directory[];
};

export type RegularFile = FileOrDirectory<'file'> & {
  content?: string;
  /**
   * Either an extension or an empty string if file does not have an extension.
   */
  extension: Extension;
};

export type TypeFilter = Exclude<FileType, 'unknown'>;

export type DigDirFilters<T extends Maybe<TypeFilter> = undefined> = {
  /**
   * Filter by extension.
   */
  extensions?: Extension[];
  /**
   * Filter by name (partial match).
   */
  filename?: string;
  /**
   * Filter by filetype.
   */
  type?: T;
};

export type DigDirOptions<T extends Maybe<TypeFilter> = undefined> = {
  /**
   * Filters digdir output.
   */
  filters?: DigDirFilters<T>;
  /**
   * Should we include each file contents?
   */
  includeFileContent?: boolean;
  /**
   * Set the maximum depth.
   */
  depth?: number;
};

export type DigDirOutput = {
  [Type.DIRECTORY]: Directory[];
  [Type.FILE]: RegularFile[];
  undefined: (Directory | RegularFile)[];
};

export type DigDirReturn<
  T extends Maybe<TypeFilter> = undefined,
  V extends keyof DigDirOutput = T extends undefined ? 'undefined' : T
> = DigDirOutput[V];
