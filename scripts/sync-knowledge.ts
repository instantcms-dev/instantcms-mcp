import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const repository = 'https://github.com/instantsoft/icms2.git';
const projectRoot = process.cwd();
const cacheDir = resolve(projectRoot, '.cache/icms2');
const stateFile = resolve(projectRoot, 'knowledge/upstream.json');

function git(args: string[], cwd = projectRoot): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();
}

function latestTag(): string {
  const tags = git(['ls-remote', '--tags', '--refs', repository])
    .split('\n')
    .map(line => line.split('refs/tags/')[1])
    .filter((tag): tag is string => /^v?\d+\.\d+(?:\.\d+)?$/.test(tag));
  return tags.sort((left, right) =>
    right.localeCompare(left, undefined, { numeric: true, sensitivity: 'base' })
  )[0];
}

async function ensureCheckout(
  ref: string
): Promise<{ resolvedRef: string; commit: string; generatedAt: string }> {
  await mkdir(resolve(projectRoot, '.cache'), { recursive: true });
  try {
    git(['rev-parse', '--git-dir'], cacheDir);
  } catch {
    git(['clone', '--filter=blob:none', '--no-checkout', repository, cacheDir]);
  }
  const resolvedRef = ref === 'latest' ? latestTag() : ref;
  if (!resolvedRef) throw new Error('InstantCMS stable tag was not found');
  git(['fetch', '--depth=1', 'origin', resolvedRef], cacheDir);
  git(['checkout', '--detach', '--force', 'FETCH_HEAD'], cacheDir);
  return {
    resolvedRef,
    commit: git(['rev-parse', 'HEAD'], cacheDir),
    generatedAt: git(['show', '-s', '--format=%cI', 'HEAD'], cacheDir),
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const refIndex = args.indexOf('--ref');
  const ref = refIndex >= 0 ? args[refIndex + 1] : 'latest';
  const statusOnly = args.includes('--status');
  const current = JSON.parse(await readFile(stateFile, 'utf8').catch(() => '{}')) as {
    ref?: string;
    commit?: string;
  };
  const upstream = await ensureCheckout(ref);

  if (statusOnly) {
    console.log(JSON.stringify({ repository, requested_ref: ref, ...upstream, current }, null, 2));
    process.exitCode = current.commit === upstream.commit ? 0 : 2;
    return;
  }

  execFileSync('npm', ['run', 'parse:all'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      INSTANTCMS_SOURCE: cacheDir,
      KNOWLEDGE_GENERATED_AT: upstream.generatedAt,
    },
    stdio: 'inherit',
  });
  await writeFile(
    stateFile,
    `${JSON.stringify(
      {
        repository,
        requested_ref: ref,
        resolved_ref: upstream.resolvedRef,
        commit: upstream.commit,
        updated_at: upstream.generatedAt,
      },
      null,
      2
    )}\n`
  );
  execFileSync('npm', ['run', 'knowledge:build'], { cwd: projectRoot, stdio: 'inherit' });
  console.log(`Knowledge updated from ${upstream.resolvedRef} (${upstream.commit.slice(0, 12)}).`);
}

void main();
