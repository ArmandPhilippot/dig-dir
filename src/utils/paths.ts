/**
 * Replicate `__dirname` variable.
 *
 * @param {ImportMeta} meta - An `import.meta` object.
 * @returns {string} The `__dirname` equivalent.
 */
export const getDirname = (meta: ImportMeta): string => {
  return new URL('.', meta.url).pathname;
};
