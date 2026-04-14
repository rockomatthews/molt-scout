import { z } from "zod";

const INFO_URL = "https://api.hyperliquid.xyz/info";

async function post<T>(body: any): Promise<T> {
  const res = await fetch(INFO_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`hyperliquid_info_http_${res.status}`);
  return (await res.json()) as T;
}

export async function hlAllMids(): Promise<Record<string, string>> {
  return await post({ type: "allMids" });
}

const MetaSchema = z.object({
  universe: z.array(
    z.object({
      name: z.string(),
      szDecimals: z.number().int().optional(),
      maxLeverage: z.number().optional(),
      onlyIsolated: z.boolean().optional(),
    })
  ),
});

// metaAndAssetCtxs returns [meta, assetCtxs]
export async function hlMetaAndAssetCtxs(): Promise<{ meta: z.infer<typeof MetaSchema>; assetCtxs: any[] }> {
  const out = await post<any>({ type: "metaAndAssetCtxs" });
  const meta = MetaSchema.parse(out[0]);
  const assetCtxs = Array.isArray(out[1]) ? out[1] : [];
  return { meta, assetCtxs };
}

export async function hlFundingHistory(coin: string, startTimeMs: number, endTimeMs: number) {
  return await post<any>({ type: "fundingHistory", coin, startTime: startTimeMs, endTime: endTimeMs });
}
