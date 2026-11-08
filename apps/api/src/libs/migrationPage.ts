import { marked } from 'marked';

// Human-readable page for the migration guide; the markdown source is our
// own shipped file, so it is rendered as-is.
const css = `
  :root { color-scheme: light dark; --fg: #111827; --muted: #4b5563; --bg: #ffffff;
    --line: #e5e7eb; --code: #f3f4f6; --accent: #0f5e59; }
  @media (prefers-color-scheme: dark) {
    :root { --fg: #e5e7eb; --muted: #9ca3af; --bg: #0b0f14; --line: #1f2937;
      --code: #111827; --accent: #34d399; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); line-height: 1.65;
    font: 16px/1.65 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  header { border-bottom: 1px solid var(--line); padding: 16px; }
  header a { color: var(--fg); font-weight: 600; text-decoration: none; }
  main { max-width: 860px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { font-size: 2rem; line-height: 1.25; margin: 8px 0 16px; }
  h2 { font-size: 1.4rem; margin: 40px 0 12px; padding-top: 8px; border-top: 1px solid var(--line); }
  h3 { font-size: 1.1rem; margin: 28px 0 8px; }
  a { color: var(--accent); }
  blockquote { margin: 16px 0; padding: 12px 16px; border-left: 4px solid var(--accent);
    background: var(--code); border-radius: 4px; }
  blockquote p { margin: 0; }
  code { background: var(--code); padding: 1px 5px; border-radius: 4px; font-size: 0.9em; }
  pre { background: var(--code); padding: 14px 16px; border-radius: 6px; overflow-x: auto; }
  pre code { padding: 0; background: none; }
  table { border-collapse: collapse; width: 100%; display: block; overflow-x: auto; margin: 12px 0; }
  th, td { border: 1px solid var(--line); padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: var(--code); }
  hr { border: 0; border-top: 1px solid var(--line); margin: 32px 0; }
  .meta { color: var(--muted); font-size: 0.9rem; }
`;

export const migrationPage = (markdown: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Migrating to API v3 | NearBlocks</title>
  <meta name="description" content="How to move a NearBlocks API v1 or v2 integration to v3.">
  <link rel="icon" href="https://nearblocks.io/favicon_32x32.png">
  <link rel="alternate" type="text/markdown" href="/api-docs/migration.md">
  <style>${css}</style>
</head>
<body>
  <header><a href="/api-docs">NearBlocks API</a></header>
  <main>
    ${marked.parse(markdown, { async: false })}
    <p class="meta">Also available as <a href="/api-docs/migration.md">Markdown</a> for tools and AI assistants.</p>
  </main>
</body>
</html>`;
