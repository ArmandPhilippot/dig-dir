# DigDir

Browse a directory tree with Node.js and extract some children data.

## Description

DigDir retrieves data about the contents of a given directory but not about the directory itself. For each file and subdirectory encountered it will create an object with the filetype, the name, the relative path, the creation date, the update date, the parent (if nested) and an id generated from the relative path.

DigDir gathers some additional data depending of the filetype:

- If it is a file, DigDir will return the extension and optionally the file content as string.
- If it is a directory, DigDir will return its files and its subdirectories except when max depth is reached.

## Install

```bash
# With npm
npm install dig-dir

# With yarn
yarn add dig-dir

# With pnpm
pnpm add dig-dir
```

## Usage

### ESM

```javascript
import { resolve } from 'path';
import digDir from 'dig-dir';

const currentPath = new URL('.', import.meta.url).pathname;
const dirPath = resolve(currentPath, './relative-dir-path');
const dirData = await digDir(dirPath);
console.log(dirData);
```

### CommonJS

```javascript
const digDir = require('dig-dir');
const path = require('path');

const dirPath = path.resolve(__dirname, './relative-dir-path');
digDir(dirPath).then((dirData) => console.log(dirData));
```

## Parameters

DigDir accept three parameters:

- `root`: An absolute path pointing to the directory to browse,
- `options`: An object containing some options regarding DigDir output,
- `acc`: An accumulator to keep track of the root path with depth option. **You should not override it.**

### Options

You can pass some options to DigDir as an object:

- `filters`: An object of filters to exclude some directories and/or files,
- `includeFileContent`: If active, each file encountered will be read and DigDir will return the content,
- `depth`: If `undefined`, DigDir will also read subdirectories until there is no more path to explore. If enabled, DigDir will returns the directories and files inside the given path until the given depth is reached.

**Note:** By default, all options are undefined so DigDir will not include file content and it will continue until there is no more directory to explore.

### Filters

You can provide an object to filter the returned data.

#### Extensions

If you pass an array of extensions (starting with a dot), DigDir will only return files matching the given extensions. It will also return the directories to be able to look into subdirectories.

Examples:

```javascript
// Only retrieve Markdown files.
const dirData = await digDir('some-path', {
  filters: { extensions: ['.md'] },
});

// Retrieve text and Markdown files.
const dirData = await digDir('some-path', {
  filters: extensions: ['.txt', '.md'],
});
```

#### Filename

If provided, DigDir will return only directories and/or files which contain the filename (it does not look for an exact match).

Example:

```javascript
const dirData = await digDir('some-path', {
  filters: { filename: 'and' },
});

// dirData could contain an array with directories named `andy` or `armand` and
// a file named `tandem`. But a directory named `images` will not be returned.
```

#### Type

- `"file"` will only return files (including the ones in each subdirectory),
- `"directory"` will only return directories (including the ones in each subdirectory),
- `undefined` will return every files and directories encountered.

Example:

```javascript
// Retrieve only directories
const dirData = await digDir('some-path', {
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

DigDir with default options will return this Javascript array of objects:

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
            name: 'document',
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
            name: 'note',
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
        name: 'readme',
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
    name: 'readme',
    parent: undefined,
    path: './readme.md',
    type: 'file',
    updatedAt: '2022-08-03T12:08:05.866Z',
    extension: '.md',
    content: undefined,
  },
];
```

## Development

If you want to contribute to DigDir, first of all: thanks! Then, here a few instructions:

1. You need `pnpm` installed,
2. Clone the project,
3. Install dev dependencies with`pnpm i`,
4. Install test fixtures with `pnpm test:fixtures:prepare`,
5. Create a branch for your contribution,
6. You can run `pnpm watch` to watch for changes and automatically rebuild the project.
7. Make your changes and commit them,
8. Push your branch.

**A few notes:**

- This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) rules. This is helpful to generate changelog and bump the version. So please, try to follow these guidelines.
- A git hook is set to run tests before pushing. If the push fails, you need to make the appropriate changes so that all tests work as expected. You can also run the tests manually with `pnpm test`.
- If you tweak the fixtures and you want to return to the initial state, you can clean them with `pnpm:test:fixtures:clean` then reinstall them with `pnpm test:fixtures:prepare`.
- If you are familiar with unit testing, you can add your own tests. This project uses [Ava](https://github.com/avajs/ava). If you don't know this tool, please read the documentation before.

## FAQ

**Why the accumulator should be ignored?**

To avoid repeats, DigDir is calling itself until max depth is reached. To be able to return the relative path instead of an absolute path, DigDir needs to keep track of the path you have given. Each time DigDir is called, the current path is pushed to the accumulator. So `acc[0]` will always match the given path.

**Why use a relative path?**

I estimate that the relative path can be useful but the absolute path should not be public.

As a developer, you know where is the starting path so you can easily retrieve the path which could cause an error from the relative path. However, if you want to use the DigDir data through an API, I think it is preferable to not provide the full path.

**Why DigDir?**

At first, I whish to name this package Walk Dir, but the name and its variants was already taken in the npm public space. I prefer to release this package as unscoped package so I had to look for another available name. DigDir was available and it seems appropriate. The idea is to dig into a directory to extract data about its children (and their children, so dig deeper).

So, if in the repository's history you find some mentions of "walk dir" (in different case), it was the previous name of this package.

## License

This project is open-source and released under the [MIT license](./LICENSE).
