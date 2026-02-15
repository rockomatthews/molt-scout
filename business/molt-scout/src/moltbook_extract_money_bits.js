import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node moltbook_extract_money_bits.js <markdownFile>');
  process.exit(2);
}

const text = fs.readFileSync(file, 'utf8');
const lines = text.split(/\r?\n/);

const keywords = [
  'monet', 'money', 'earn', 'revenue', 'subscribe', 'subscription', 'token', 'coin', 'airdrop', 'reward', 'points',
  'creator', 'affiliate', 'sponsor', 'sponsorship', 'market', 'pricing', 'launch', 'sell', 'buy'
];

const hits = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  const low = l.toLowerCase();
  if (keywords.some((k) => low.includes(k))) {
    // capture a small window
    const from = Math.max(0, i - 1);
    const to = Math.min(lines.length, i + 2);
    hits.push({ line: i + 1, snippet: lines.slice(from, to).join('\n') });
  }
}

console.log(JSON.stringify({ file, hitCount: hits.length, hits: hits.slice(0, 40) }, null, 2));
