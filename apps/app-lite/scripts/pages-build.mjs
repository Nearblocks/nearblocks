import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const run = (bin, args) => {
  const { status } = spawnSync(bin, args, { shell: false, stdio: 'inherit' });

  if (status !== 0) process.exit(status ?? 1);
};

mkdirSync('.vercel', { recursive: true });
writeFileSync(
  '.vercel/project.json',
  JSON.stringify({
    orgId: '_',
    projectId: '_',
    settings: { framework: 'nextjs', installCommand: 'true' },
  }),
);

run('pnpm', ['exec', 'vercel', 'build']);
run('pnpm', ['exec', 'next-on-pages', '--skip-build']);
