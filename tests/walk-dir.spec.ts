import anyTest, { TestFn } from 'ava';
import { Dirent } from 'fs';
import { readdir } from 'fs/promises';
import { resolve } from 'path';
import { walkDir } from '../dist/index.js';
import { FileType } from '../dist/ts/enums.js';
import { Directory, RegularFile } from '../dist/ts/types.js';
import { getDirname } from '../dist/utils/paths.js';

const FIXTURES_PATH = resolve(getDirname(import.meta), './fixtures/');

const test = anyTest as TestFn<{
  fixtures: Dirent[];
  root: (RegularFile | Directory)[];
}>;

test.beforeEach(async (t) => {
  t.context = {
    fixtures: await readdir(FIXTURES_PATH, {
      encoding: 'utf8',
      withFileTypes: true,
    }),
    root: await walkDir(FIXTURES_PATH),
  };
});

test('returns the correct number of files & directories in root folder', (t) => {
  const fixturesCount = t.context.fixtures.length;
  const filesFixturesCount = t.context.fixtures.filter((fileOrDir) =>
    fileOrDir.isFile()
  ).length;
  const directoriesFixturesCount = t.context.fixtures.filter((fileOrDir) =>
    fileOrDir.isDirectory()
  ).length;
  const rootDirectories = t.context.root.filter(
    (fileOrDir) => fileOrDir.type === FileType.DIRECTORY
  ) as Directory[];
  const rootFiles = t.context.root.filter(
    (fileOrDir) => fileOrDir.type === FileType.FILE
  ) as RegularFile[];

  t.is(t.context.root.length, fixturesCount);
  t.is(rootDirectories.length, directoriesFixturesCount);
  t.is(rootFiles.length, filesFixturesCount);
});
