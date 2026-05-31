/**
 * Patches the @workspace/api-client-react customFetch so that on static
 * hosts (Surge, Netlify, GitHub Pages) where there is no /api backend,
 * every generated API hook returns a sensible empty value instead of
 * throwing an ApiError that crashes the React tree.
 *
 * Strategy: wrap window.fetch so that any request to a relative /api/*
 * path that fails (network error OR non-2xx) returns a synthetic 200
 * response with an empty payload appropriate for the expected shape.
 */

const EMPTY_SHAPES: Record<string, unknown> = {
  "/api/courses":          [],
  "/api/progress/review":  { total: 0 },
  "/api/progress/summary": {
    totalXp: 0, streakDays: 0, lessonsCompleted: 0,
    challengesCompleted: 0, coursesCompleted: 0,
    weeklyActivity: [], reviewDue: 0,
  },
  "/api/leaderboard":      [],
  "/api/profile":          null,
};

function emptyFor(url: string): unknown {
  // Exact match first
  if (url in EMPTY_SHAPES) return EMPTY_SHAPES[url];
  // Prefix match (e.g. /api/courses/1, /api/lessons/5)
  for (const [prefix, val] of Object.entries(EMPTY_SHAPES)) {
    if (url.startsWith(prefix + "/")) return val;
  }
  return null;
}

function syntheticResponse(url: string): Response {
  const body = JSON.stringify(emptyFor(url) ?? null);
  return new Response(body, {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

let patched = false;

export function patchFetchForStaticHost() {
  if (patched) return;
  patched = true;

  const original = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request).url;

    // Only intercept relative /api/* paths
    if (!url.startsWith("/api/")) return original(input, init);

    try {
      const res = await original(input, init);
      if (res.ok) return res;
      // Non-2xx → return synthetic empty
      console.warn(`[Lumina] API ${url} → ${res.status}, using empty mock`);
      return syntheticResponse(url);
    } catch {
      // Network error (no backend running)
      console.warn(`[Lumina] API ${url} unreachable, using empty mock`);
      return syntheticResponse(url);
    }
  };
}
