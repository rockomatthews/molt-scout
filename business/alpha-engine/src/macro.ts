import { execFile } from "node:child_process";
import path from "node:path";

export type MacroRegime = {
  ts: string;
  source: "binance";
  symbols: Array<{
    symbol: string;
    current_price?: number;
    rsi?: number;
    sma_20?: number;
    sma_50?: number;
    support?: number;
    resistance?: number;
  }>;
  note: string;
};

function run(cmd: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd, timeout: 60_000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(Object.assign(err, { stdout, stderr }));
      resolve({ stdout: String(stdout || ""), stderr: String(stderr || "") });
    });
  });
}

export async function getMacroRegime(rootDir: string): Promise<MacroRegime | null> {
  // Use the installed skill as a deterministic data tool.
  const skillDir = path.resolve(rootDir, "..", "..", "skills", "crypto-market-analyzer");
  const py = path.join(skillDir, ".venv", "bin", "python");
  const script = path.join(skillDir, "scripts", "fetch_crypto_data.py");

  try {
    const { stdout } = await run(py, [script], skillDir);
    const json = JSON.parse(stdout);

    const symbols: MacroRegime["symbols"] = [];
    for (const k of Object.keys(json || {})) {
      const ind = json?.[k]?.indicators || {};
      const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : undefined);
      symbols.push({
        symbol: k,
        current_price: num(ind.current_price),
        rsi: num(ind.rsi),
        sma_20: num(ind.sma_20),
        sma_50: num(ind.sma_50),
        support: num(ind.support),
        resistance: num(ind.resistance),
      });
    }

    return {
      ts: new Date().toISOString(),
      source: "binance",
      symbols,
      note: "Macro regime snapshot from crypto-market-analyzer (Binance klines). Use as a risk-on/risk-off context signal.",
    };
  } catch {
    return null;
  }
}
