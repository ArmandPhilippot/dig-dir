export default {
  extensions: {
    js: true,
    ts: 'module',
  },
  nodeArguments: [
    '--experimental-specifier-resolution=node',
    '--loader=esbuild-node-loader',
  ],
  files: ['tests/**/*.spec.ts'],
};
