import { execSync } from 'node:child_process';
import fs from 'node:fs';

function env(k) {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
}

function run(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
}

function pickThree(md) {
  // Parse patterns like:
  // $YANG ...
  // [Post](https://...) [Trade](https://...)
  const re = /\$(\w+)\s+[^\n]*\n\n([^\n]+)\n\nby[^\n]*\n\n(?:[\s\S]*?)\[Post\]\((https?:\/\/[^)]+)\)\s+\[Trade\]\((https?:\/\/[^)]+)\)/g;
  const out = [];
  let m;
  while ((m = re.exec(md)) && out.length < 3) {
    const symbol = `$${m[1]}`;
    const name = m[2].trim();
    const post_url = m[3];
    const trade_url = m[4];
    const note = `Watch ${symbol}: early launch with live post + trade link. Use: follow the post, check liquidity, and watch for repeated agent mentions.`;
    out.push({ symbol, name, post_url, trade_url, note });
  }
  return out;
}

async function main() {
  const SUPABASE_URL = env('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = env('SUPABASE_SERVICE_ROLE_KEY');

  const tmp = `.firecrawl/clawn/pad-${Date.now()}.md`;
  fs.mkdirSync('.firecrawl/clawn', { recursive: true });

  run(`firecrawl scrape "https://clawn.ch/pad/" --only-main-content -o "${tmp}"`);
  const md = fs.readFileSync(tmp, 'utf8');

  const picks = pickThree(md);
  if (!picks.length) {
    console.error('No picks parsed.');
    process.exit(1);
  }

  // dynamic import to avoid bundling issues
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  // Insert 3 new rows (one per pick)
  const { error } = await supabase.from('clawn_radar').insert(picks);
  if (error) throw error;

  console.log('Inserted clawn_radar picks:', picks.map((p) => p.symbol).join(', '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
