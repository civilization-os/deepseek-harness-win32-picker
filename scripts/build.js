import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'

await mkdir('lib', { recursive: true })

await Promise.all([
  build({
    entryPoints: ['src/index.ts'],
    outfile: 'lib/index.js',
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    external: ['@deepseek-ai/cordis', 'koffi'],
  }),
  build({
    entryPoints: ['src/win32-dialog-worker.ts'],
    outfile: 'lib/worker.cjs',
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node22',
    external: ['koffi'],
  }),
])
