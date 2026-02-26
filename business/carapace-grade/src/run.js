import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function run(cmd, args, cwd) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd, shell: false });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("close", (code) => resolve({ code: code ?? 0, out, err }));
  });
}

async function main() {
  const repos = [];
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === "--repo") {
      repos.push(process.argv[i + 1]);
      i++;
    }
  }
  if (!repos.length) {
    console.error("Usage: node src/run.js --repo <path> [--repo <path>]");
    process.exit(1);
  }

  const stamp = nowStamp();
  const baseOutDir = path.resolve("reports", stamp);
  fs.mkdirSync(baseOutDir, { recursive: true });

  for (const repoRel of repos) {
    const repo = path.resolve(repoRel);
    const repoName = path.basename(repo);
    const outDir = path.join(baseOutDir, repoName);
    fs.mkdirSync(outDir, { recursive: true });

    console.log(`\n[carapace-grade] scanning ${repoName} (${repo})`);

    const carapaceRoot = path.resolve("vendor", "carapace");
    const cliPath = path.join(carapaceRoot, "packages", "cli", "dist", "cli.js");

    // Ensure vendored Carapace is installed + built (stubs + engine + cli)
    await run("corepack", ["enable"], carapaceRoot);
    await run("corepack", ["prepare", "pnpm@9.15.4", "--activate"], carapaceRoot);
    await run("pnpm", ["install"], carapaceRoot);
    await run("pnpm", ["--filter", "@carapacesecurity/engine", "build"], carapaceRoot);
    await run("pnpm", ["--filter", "@carapacesecurity/cli", "build"], carapaceRoot);

    // Scan (full)
    const scan = await run("node", [cliPath, "scan", ".", "--full"], repo);
    fs.writeFileSync(path.join(outDir, "scan.txt"), scan.out + "\n\n" + scan.err);

    // Attempt clean (non-fatal)
    const clean = await run("node", [cliPath, "clean", "."], repo);
    fs.writeFileSync(path.join(outDir, "clean.txt"), clean.out + "\n\n" + clean.err);

    // Rescan to capture improvement
    const rescan = await run("node", [cliPath, "scan", ".", "--full"], repo);
    fs.writeFileSync(path.join(outDir, "rescan.txt"), rescan.out + "\n\n" + rescan.err);

    // Tiny summary
    const summary = `# Carapace Grade Report — ${repoName}\n\nGenerated: ${new Date().toISOString()}\n\n## Scan (before)\n\n\`\`\`\n${scan.out.trim()}\n\`\`\`\n\n## Clean output\n\n\`\`\`\n${clean.out.trim()}\n\`\`\`\n\n## Scan (after)\n\n\`\`\`\n${rescan.out.trim()}\n\`\`\`\n`;
    fs.writeFileSync(path.join(outDir, "SUMMARY.md"), summary);

    console.log(`[carapace-grade] wrote ${outDir}`);
  }

  console.log(`\n[carapace-grade] done. reports at ${baseOutDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
