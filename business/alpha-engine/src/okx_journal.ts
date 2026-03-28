import fs from 'node:fs/promises';
import path from 'node:path';

export async function appendOkxJournal(root: string, line: string) {
  const p = path.join(root, 'logs', 'okx_trades.md');
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.appendFile(p, line + '\n', 'utf8');
}

export function fmtIso(ts: string | Date) {
  const d = typeof ts === 'string' ? new Date(ts) : ts;
  return d.toISOString().replace('T', ' ').replace('Z', 'Z');
}
