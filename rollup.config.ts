import { RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

const bundle = (config: RollupOptions): RollupOptions => ({
  ...config,
  input: 'src/index.ts',
  external: (id: string) => !/^[./]/.test(id),
});

export default [
  bundle({
    output: [
      {
        file: `dist/walk-dir.js`,
        format: 'cjs',
        sourcemap: true,
        exports: 'default',
      },
      {
        file: `dist/walk-dir.mjs`,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      esbuild({
        minify: process.env.NODE_ENV === 'production',
        tsconfig: 'tsconfig.json', // default
      }),
    ],
  }),
  bundle({
    output: {
      file: `dist/walk-dir.d.ts`,
      format: 'es',
    },
    plugins: [dts()],
  }),
];
