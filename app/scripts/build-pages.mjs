import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync, readFileSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';

// Pass a repository path (e.g. /sweden-alcohol), or / for a root/custom domain.
const raw = process.argv[2] ?? process.env.PAGES_BASE_PATH ?? '/';
const basePath = raw === '/' ? '' : `/${raw.replace(/^\/+|\/+$/g, '')}`;
if (basePath === '/.' || basePath === '/..' || (basePath && !/^\/[A-Za-z0-9._-]+$/.test(basePath))) {
  throw new Error('Use a single repository path such as /sweden-alcohol, or / for a root site.');
}
const result = spawnSync(process.execPath, ['node_modules/vinext/dist/cli.js', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, PAGES_EXPORT: '1', NEXT_PUBLIC_BASE_PATH: basePath },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
if (!existsSync('dist/client/index.html')) throw new Error('Static export did not produce dist/client/index.html.');
// Vinext emits prefixed assets in a matching directory. GitHub Pages itself
// mounts the artifact at that prefix, so strip the duplicate disk-level prefix.
const output = path.resolve('dist/client');
if (basePath) {
  const nested = path.join(output, basePath.slice(1));
  const assets = path.join(nested, '_next');
  if (!existsSync(assets)) throw new Error('Expected prefixed static assets were not emitted.');
  renameSync(assets, path.join(output, '_next'));
  rmSync(nested, { recursive: true });
}
writeFileSync('dist/client/.nojekyll', '');
const html = readFileSync(path.join(output, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const url = match[1];
  if (!url.startsWith('/') || url.startsWith('//')) continue;
  if (basePath && !url.startsWith(`${basePath}/`)) throw new Error(`Asset misses the repository prefix: ${url}`);
  const pathname = url.slice(basePath.length).split(/[?#]/)[0];
  const file = path.resolve(output, `.${decodeURIComponent(pathname)}`);
  if (!file.startsWith(`${output}${path.sep}`) || !existsSync(file)) throw new Error(`Missing static file: ${url}`);
}
console.log('Verified exported HTML asset and download paths.');
console.log(`\nGitHub Pages files: dist/client/\nURL path: ${basePath || '/'}\n`);
