/**
 * Google Gemini — route tips via Generative Language API (REST).
 * Key: VITE_GEMINI_API_KEY in .env.local (AIza…).
 *
 * Default stack uses **free-tier** models (Flash-Lite first — higher daily limits).
 * Override with VITE_GEMINI_MODEL for a single model.
 */

function normalizeKey(raw: string | undefined): string {
  if (!raw) return "";
  let s = raw.trim().replace(/\r?\n/g, "");
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export function isGeminiConfigured(): boolean {
  return Boolean(normalizeKey(import.meta.env.VITE_GEMINI_API_KEY as string | undefined));
}

export type RouteInsightResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

type GeminiGenerateContentResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { code?: number; message?: string; status?: string };
};

/** Prefer lite + older flash — usually best free-tier availability. */
const FREE_TIER_MODEL_CHAIN = [
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
] as const;

function parseRetrySecondsFromMessage(msg: string): number | null {
  const m = /retry in ([\d.]+)\s*s/i.exec(msg);
  if (!m) return null;
  const s = parseFloat(m[1]);
  if (!Number.isFinite(s) || s < 0) return null;
  return Math.min(s, 90);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isQuotaOrRateLimit(status: number, msg: string): boolean {
  return (
    status === 429 ||
    /quota|rate limit|RESOURCE_EXHAUSTED|too many requests/i.test(msg)
  );
}

function quotaHintLine(apiMsg: string): string {
  if (!/quota|rate limit|RESOURCE_EXHAUSTED|429|free_tier|limit:\s*0/i.test(apiMsg)) return "";
  return (
    " Free tier help: https://ai.google.dev/gemini-api/docs/rate-limits — default uses `gemini-2.5-flash-lite`. " +
    "If all models show limit 0, link billing on the Google Cloud project."
  );
}

function shouldTryNextFreeModel(error: string): boolean {
  if (/API key|authentication|PERMISSION_DENIED|API_KEY_INVALID|401|invalid.*key/i.test(error)) {
    return false;
  }
  if (/not found|NOT_FOUND|Unknown model|not supported|404|was not found/i.test(error)) return true;
  if (/quota|limit:\s*0|RESOURCE_EXHAUSTED|free_tier|rate limit/i.test(error)) return true;
  return false;
}

export async function fetchRouteInsight(summary: {
  pathLabel: string;
  distanceKm: number;
  durationMin?: number;
  mode?: "live" | "graph";
}): Promise<RouteInsightResult> {
  const key = normalizeKey(import.meta.env.VITE_GEMINI_API_KEY as string | undefined);
  if (!key) {
    return { ok: false, error: "No VITE_GEMINI_API_KEY in .env.local" };
  }

  const override = (import.meta.env.VITE_GEMINI_MODEL as string | undefined)?.trim();
  const models: readonly string[] = override ? [override] : [...FREE_TIER_MODEL_CHAIN];

  const timePart =
    summary.durationMin != null
      ? ` ~${Math.round(summary.durationMin)} min driving time`
      : "";
  const context =
    summary.mode === "graph"
      ? `Distance is from a simplified hub network (approximate), not live GPS.`
      : `Distance and time come from real road routing (OpenStreetMap).`;

  const km = Math.round(summary.distanceKm);
  const longTrip = km >= 400;

  const prompt = `You are an India road-trip guide. Reply in English only (no Hindi).

Route: ${summary.pathLabel}. Distance: about ${km} km.${timePart}
${context}

Write a very short travel briefing: at most 3 sentences, plain English, no markdown, no bullets, no lists.

Sentence 1: From where to where, about ${km} km${summary.mode === "graph" ? " (approximate)" : ""}.
${longTrip ? `Sentence 2: One line on typical direction (e.g. major NH south through key states) and only 2–3 overnight or rest cities. Sentence 3: One practical tip (tyres, breaks, or pacing).` : `Sentence 2: One or two rest-stop ideas. Sentence 3: One short tip if it fits.`}

Keep the whole reply under 75 words. Do not mention Gemini, Google, or any model name.`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.45,
      maxOutputTokens: 180,
    },
  });

  async function callOneModel(model: string): Promise<RouteInsightResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

        let raw: GeminiGenerateContentResponse;
        try {
          raw = (await res.json()) as GeminiGenerateContentResponse;
        } catch {
          return { ok: false, error: `Gemini returned non-JSON (HTTP ${res.status}) [${model}]` };
        }

        const apiMsg = raw.error?.message ?? res.statusText ?? `HTTP ${res.status}`;

        if (!res.ok) {
          if (attempt === 0 && isQuotaOrRateLimit(res.status, apiMsg)) {
            const wait = parseRetrySecondsFromMessage(apiMsg);
            if (wait != null && wait > 0) {
              await sleep(Math.ceil(wait * 1000) + 250);
              continue;
            }
          }
          const keyHint =
            /API key|PERMISSION|403|401|invalid/i.test(apiMsg)
              ? " Check key at https://aistudio.google.com/apikey — set VITE_GEMINI_API_KEY=AIza… in .env.local (no quotes), enable Generative Language API, restart npm run dev."
              : "";
          const qHint = quotaHintLine(apiMsg);
          return { ok: false, error: `${apiMsg}${keyHint}${qHint} [model: ${model}]` };
        }

        const text = raw.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("")?.trim();
        if (!text) {
          return { ok: false, error: `Empty response from Gemini [${model}]` };
        }
        return { ok: true, text };
      }
      return { ok: false, error: `Gemini: rate limit after retry [${model}]` };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      return { ok: false, error: `${msg} [model: ${model}]` };
    }
  }

  let last: RouteInsightResult = { ok: false, error: "No model attempted" };
  for (const model of models) {
    last = await callOneModel(model);
    if (last.ok) return last;
    if (override) return last;
    if (shouldTryNextFreeModel(last.error)) continue;
    return last;
  }
  return last;
}
