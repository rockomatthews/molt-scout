import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const p = path.resolve(process.cwd(), "public", "leads", "latest.json");
  try {
    const raw = await fs.readFile(p, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ ok: false, error: "missing_latest" }, { status: 404 });
  }
}
