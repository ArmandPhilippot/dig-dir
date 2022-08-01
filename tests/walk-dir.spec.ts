import anyTest, { TestFn } from 'ava';
import { Dirent } from 'fs';
import { readdir } from 'fs/promises';
import { resolve } from 'path';
import { walkDir } from '../dist/index.js';
import { FileType } from '../dist/ts/enums.js';
import { Directory, RegularFile } from '../dist/ts/types.js';
import { getFilesIn, getSubdirectoriesIn } from '../dist/utils/helpers.js';
import { getDirname } from '../dist/utils/paths.js';

const FIXTURES_PATH = resolve(getDirname(import.meta), './fixtures/');

const test = anyTest as TestFn<{
  fixtures: Dirent[];
}>;

test.beforeEach(async (t) => {
  t.context = {
    fixtures: await readdir(FIXTURES_PATH, {
      encoding: 'utf8',
      withFileTypes: true,
    }),
  };
});

test('returns the correct number of files & directories in root folder', async (t) => {
  const fixturesCount = t.context.fixtures.length;
  const filesFixturesCount = t.context.fixtures.filter((fileOrDir) =>
    fileOrDir.isFile()
  ).length;
  const directoriesFixturesCount = t.context.fixtures.filter((fileOrDir) =>
    fileOrDir.isDirectory()
  ).length;
  const root = await walkDir(FIXTURES_PATH);
  const rootDirectories = getSubdirectoriesIn(root);
  const rootFiles = getFilesIn(root);

  t.is(root.length, fixturesCount);
  t.is(rootDirectories.length, directoriesFixturesCount);
  t.is(rootFiles.length, filesFixturesCount);
});

test('returns root subdirectories content if recursive', async (t) => {
  const root = await walkDir(FIXTURES_PATH, { recursive: true });
  const rootDirectories = getSubdirectoriesIn(root);

  rootDirectories.forEach((subDir) => {
    t.truthy(subDir.files);
    t.truthy(subDir.subdirectories);
  });
});

test('does not return root subdirectories content if not recursive', async (t) => {
  const root = await walkDir(FIXTURES_PATH, { recursive: false });
  const rootDirectories = getSubdirectoriesIn(root);

  rootDirectories.forEach((subDir) => {
    t.falsy(subDir.files);
    t.falsy(subDir.subdirectories);
  });
});

test('includes files content if option is activated', async (t) => {
  const root = await walkDir(FIXTURES_PATH, { includeFileContent: true });
  const rootFiles = getFilesIn(root);

  rootFiles.forEach((file) => {
    t.truthy(file.content);
  });
});

test('does not include files content if option is deactivated', async (t) => {
  const root = await walkDir(FIXTURES_PATH, { includeFileContent: false });
  const rootFiles = getFilesIn(root);

  rootFiles.forEach((file) => {
    t.truthy(file.content);
  });
});

test('returns only directories when filtering by directory filetype', async (t) => {
  const root = await walkDir(FIXTURES_PATH, {
    filters: { type: FileType.DIRECTORY },
    recursive: true,
  });

  root.forEach((fileOrDir) => {
    t.is(fileOrDir.type, FileType.DIRECTORY);
    t.is(fileOrDir.files?.length, 0);
  });
});

test('returns only files when filtering by file filetype', async (t) => {
  const root = await walkDir(FIXTURES_PATH, {
    filters: { type: FileType.FILE },
    recursive: true,
  });

  root.forEach((fileOrDir) => {
    t.is(fileOrDir.type, FileType.FILE);
  });
});

test('returns only files and/or directories with the given filename', async (t) => {
  const filename = '-1';
  const root = await walkDir(FIXTURES_PATH, {
    filters: { filename },
    recursive: true,
  });
  const filenameRegex = new RegExp(filename, 'i');

  const doesFilenameMatchRegex = (filename: string) => {
    return t.regex(filename, filenameRegex);
  };

  const checkFilenames = (filesOrDirs?: (Directory | RegularFile)[]) => {
    if (filesOrDirs)
      filesOrDirs.forEach((fileOrDir) => {
        doesFilenameMatchRegex(fileOrDir.name);

        if (fileOrDir.type === FileType.DIRECTORY) {
          checkFilenames(fileOrDir.subdirectories);
          checkFilenames(fileOrDir.files);
        }
      });
  };

  checkFilenames(root);
});
