# Walk Dir

Walk a directory tree with Node.js

## Description

Walk Dir retrieves data about the contents of a given directory but not about the directory itself. For each file and subdirectory encountered it will create an object with the filetype, the name, the relative path, the creation date, the update date, the parent (if nested) and an id generated from the relative path.

Walk Dir gathers some additional data depending of the filetype:

- If it is a file, Walk Dir will return the extension and optionally the file content as string.
- If it is a directory, Walk Dir will return its files and its subdirectories if the recursive option is enabled.

## Install

```bash
# With npm
npm install walk-dir

# With yarn
yarn add walk-dir

# With pnpm
pnpm add walk-dir
```

## Usage

```javascript
import { resolve } from 'path';
import walkDir from 'walk-dir';

const currentPath = new URL('.', import.meta.url).pathname;
const dirPath = resolve(currentPath, './relative-path');
const dirContents = await walkDir(dirPath);
```

## Parameters

Walk Dir accept three parameters:

- `root`: An absolute path pointing to the directory to browse,
- `options`: An object containing some options regarding Walk Dir output,
- `acc`: An accumulator to keep track of the root path when using recursive option. **You should not override it.**

### Options

You can pass some options to Walk Dir as an object:

- `filters`: An object of filters to exclude some directories and/or files,
- `includeFileContent`: If active, each file encountered will be read and WalkDir will return the content,
- `recursive`: If active, Walk Dir will also read subdirectories until their is no more path to explore. If inactive, Walk Dir only returns the directories and files inside the given path.

**Note:** If you do not provide options, by default, recursive is enabled, no filters are set and Walk Dir does not include file content.

### Filters

You can provide an object to filter the returned data.

#### Extensions

If you pass an array of extensions (starting with a dot), Walk Dir will only return files matching the given extensions. It will also return the directories to be able to look into subdirectories when recursive option is set.

Examples:

```javascript
// Only retrieve Markdown files.
const dirData = await walkDir('some-path', {
  filters: { extensions: ['.md'] },
});

// Retrieve text and Markdown files.
const dirData = await walkDir('some-path', {
  filters: extensions: ['.txt', '.md'],
});
```

#### Filename

If provided, Walk Dir will return only directories and/or files which contain the filename (it does not look for an exact match).

Example:

```javascript
const dirData = await walkDir('some-path', {
  filters: { filename: 'and' },
});

// dirData could contain an array with directories named `andy` or
// `armand` and a file named `tandem`. But a directory named `images`
// will not be returned.
```

#### Type

- `"file"` will only return files (in each subdirectory if recursive is set),
- `"directory"` will only return directories (in each subdirectory if recursive is set),
- `undefined` will return every files and directories encountered.

Example:

```javascript
// Retrieve only directories
const dirData = await walkDir('some-path', {
  filters: { type: 'directory' },
});
```

## Output

Given a directory structured like this:

```
root
├── folder1
│   └── subFolder1
│       ├── document.odt
│       └── note.txt
├── folder2
│   ├── emptySubFolder
│   ├── .config
│   └── readme.md
└── readme.md
```

WalkDir with default options will return this Javascript array of objects:

```javascript
[
  {
    createdAt: '2022-08-03T12:07:05.230Z',
    id: 'Li9mb2xkZXIx',
    name: 'folder1',
    parent: undefined,
    path: './folder1',
    type: 'directory',
    updatedAt: '2022-08-03T12:07:09.927Z',
    files: [],
    subdirectories: [
      {
        createdAt: '2022-08-03T12:07:09.927Z',
        id: 'Li9mb2xkZXIxL3N1YkZvbGRlcjE=',
        name: 'subFolder1',
        parent: { name: 'folder1', path: './folder1' },
        path: './folder1/subFolder1',
        type: 'directory',
        updatedAt: '2022-08-03T12:09:11.859Z',
        files: [
          {
            createdAt: '2022-08-03T12:08:56.282Z',
            id: 'Li9mb2xkZXIxL3N1YkZvbGRlcjEvZG9jdW1lbnQub2R0',
            name: 'document.odt',
            parent: { name: 'subFolder1', path: './folder1/subFolder1' },
            path: './folder1/subFolder1/document.odt',
            type: 'file',
            updatedAt: '2022-08-03T12:08:56.282Z',
            extension: '.odt',
            content: undefined,
          },
          {
            createdAt: '2022-08-03T12:07:23.200Z',
            id: 'Li9mb2xkZXIxL3N1YkZvbGRlcjEvbm90ZS50eHQ=',
            name: 'note.txt',
            parent: { name: 'subFolder1', path: './folder1/subFolder1' },
            path: './folder1/subFolder1/note.txt',
            type: 'file',
            updatedAt: '2022-08-03T12:07:23.200Z',
            extension: '.txt',
            content: undefined,
          },
        ],
        subdirectories: [],
      },
    ],
  },
  {
    createdAt: '2022-08-03T12:07:28.543Z',
    id: 'Li9mb2xkZXIy',
    name: 'folder2',
    parent: undefined,
    path: './folder2',
    type: 'directory',
    updatedAt: '2022-08-03T12:07:50.463Z',
    files: [
      {
        createdAt: '2022-08-03T12:07:38.343Z',
        id: 'Li9mb2xkZXIyLy5jb25maWc=',
        name: '.config',
        parent: { name: 'folder2', path: './folder2' },
        path: './folder2/.config',
        type: 'file',
        updatedAt: '2022-08-03T12:07:38.343Z',
        extension: '',
        content: undefined,
      },
      {
        createdAt: '2022-08-03T12:07:50.463Z',
        id: 'Li9mb2xkZXIyL3JlYWRtZS5tZA==',
        name: 'readme.md',
        parent: { name: 'folder2', path: './folder2' },
        path: './folder2/readme.md',
        type: 'file',
        updatedAt: '2022-08-03T12:07:50.463Z',
        extension: '.md',
        content: undefined,
      },
    ],
    subdirectories: [
      {
        createdAt: '2022-08-03T12:07:32.803Z',
        id: 'Li9mb2xkZXIyL2VtcHR5U3ViRm9sZGVy',
        name: 'emptySubFolder',
        parent: { name: 'folder2', path: './folder2' },
        path: './folder2/emptySubFolder',
        type: 'directory',
        updatedAt: '2022-08-03T12:07:32.803Z',
        files: [],
        subdirectories: [],
      },
    ],
  },
  {
    createdAt: '2022-08-03T12:08:05.866Z',
    id: 'Li9yZWFkbWUubWQ=',
    name: 'readme.md',
    parent: undefined,
    path: './readme.md',
    type: 'file',
    updatedAt: '2022-08-03T12:08:05.866Z',
    extension: '.md',
    content: undefined,
  },
];
```

## FAQ

**Why the accumulator should be ignored?**

To avoid repeats, Walk Dir is calling itself when the recursive option is set. To be able to return the relative path instead of an absolute path, Walk Dir needs to keep track of the path you have given. Each time Walk Dir is called, the current path is pushed to the accumulator. So `acc[0]` will always match the given path.

**Why use a relative path?**

I estimate that the relative path can be useful but the absolute path should not be public.

As a developer, you know where is the starting path so you can easily retrieve the path which could cause an error from the relative path. However, if you want to use the Walk Dir data through an API, I think it is preferable to not provide the full path.

## License

This project is open-source and released under the [MIT license](./LICENSE).
