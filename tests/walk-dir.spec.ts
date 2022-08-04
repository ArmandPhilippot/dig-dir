import anyTest, { TestFn } from 'ava';
import { Dirent } from 'fs';
import { readdir } from 'fs/promises';
import { resolve } from 'path';
import { walkDir } from '../dist/index.js';
import { FileType } from '../dist/ts/enums.js';
import { Directory, Extension, RegularFile } from '../dist/ts/types.js';
import { getFilesIn, getSubdirectoriesIn } from '../dist/utils/helpers.js';

/**
 * Replicate `__dirname` variable.
 *
 * @returns {string} The `__dirname` equivalent.
 */
const getDirname = (): string => {
  return new URL('.', import.meta.url).pathname;
};

const FIXTURES_PATH = resolve(getDirname(), './fixtures/');

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

test('returns the correct number of properties', async (t) => {
  const root = await walkDir(FIXTURES_PATH);

  const extensionRegex = /^\.||''/;

  root.forEach((fileOrDir) => {
    t.truthy(fileOrDir.createdAt);
    t.truthy(fileOrDir.id);
    t.truthy(fileOrDir.name);
    t.truthy(fileOrDir.path);
    t.truthy(fileOrDir.type);
    t.truthy(fileOrDir.updatedAt);
    t.falsy(fileOrDir.parent);

    if (fileOrDir.type === FileType.DIRECTORY) {
      t.truthy(fileOrDir.files);
      t.truthy(fileOrDir.subdirectories);

      fileOrDir.files?.forEach((file) => {
        t.truthy(file.parent);
      });

      fileOrDir.subdirectories?.forEach((dir) => {
        t.truthy(dir.parent);
      });
    } else if (fileOrDir.type === FileType.FILE) {
      if (fileOrDir.extension !== undefined) {
        t.regex(fileOrDir.extension, extensionRegex);
      } else {
        t.fail('missing extension');
      }
      t.falsy(fileOrDir.content);
    }
  });
});

test('returns all subdirectories contents if depth not set', async (t) => {
  const root = await walkDir(FIXTURES_PATH, { depth: undefined });
  const rootDirectories = getSubdirectoriesIn(root);

  const checkTruthyContentsIn = (directories: Directory[]) => {
    directories.forEach((dir) => {
      t.truthy(dir.files);
      t.truthy(dir.subdirectories);

      if (dir.subdirectories) checkTruthyContentsIn(dir.subdirectories);
    });
  };

  checkTruthyContentsIn(rootDirectories);
});

test('does not return root subdirectories content if depth equal 0', async (t) => {
  const root = await walkDir(FIXTURES_PATH, { depth: 0 });
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
    t.is(file.content, undefined);
  });
});

test('returns only directories when filtering by directory filetype', async (t) => {
  const root = await walkDir(FIXTURES_PATH, {
    filters: { type: FileType.DIRECTORY },
  });

  root.forEach((fileOrDir) => {
    t.is(fileOrDir.type, FileType.DIRECTORY);
    t.is(fileOrDir.files?.length, 0);
  });
});

test('returns only files when filtering by file filetype', async (t) => {
  const root = await walkDir(FIXTURES_PATH, {
    filters: { type: FileType.FILE },
  });

  root.forEach((fileOrDir) => {
    t.is(fileOrDir.type, FileType.FILE);
  });
});

test('returns only files and/or directories with the given filename', async (t) => {
  const filename = '-1';
  const root = await walkDir(FIXTURES_PATH, {
    filters: { filename },
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

test('returns only files of the given extensions', async (t) => {
  const extensions: Extension[] = ['.md', '.doc'];
  const extRegex = extensions.join('||');
  const root = await walkDir(FIXTURES_PATH, {
    filters: { extensions },
  });

  const doesExtensionMatchRegex = (extension: Extension) => {
    return t.regex(extension as string, new RegExp(extRegex));
  };

  const checkFileExtension = (file: RegularFile) => {
    if (file.extension !== undefined) doesExtensionMatchRegex(file.extension);
  };

  const checkFilesExtensions = (files?: RegularFile[]) => {
    if (files) files.forEach((file) => checkFileExtension(file));
  };

  const checkExtensions = (filesOrDirs?: (Directory | RegularFile)[]) => {
    if (filesOrDirs)
      filesOrDirs.forEach((fileOrDir) => {
        if (fileOrDir.type === FileType.FILE) {
          checkFileExtension(fileOrDir);
        } else {
          checkFilesExtensions(fileOrDir.files);
          checkExtensions(fileOrDir.subdirectories);
        }
      });
  };

  checkExtensions(root);
});

test('throws an error if path does not exist', async (t) => {
  const nonexistingPath = './non-existing-folder';

  const error = await t.throwsAsync(async () => {
    await walkDir(nonexistingPath);
  });

  if (error) t.regex(error.message, /no such file or directory/i);
});
