import anyTest, { TestFn } from 'ava';
import { Dirent } from 'fs';
import { readdir } from 'fs/promises';
import { resolve } from 'path';
import { walkDir } from '../dist/index.js';
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
