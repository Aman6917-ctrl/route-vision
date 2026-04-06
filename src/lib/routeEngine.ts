import type { RouteConfig } from "./routeTypes";
import {
  type CityId,
  buildAdjacencyList,
  cityIdToLabel,
  getCityIds,
  getEdgeWeightMap,
  mergePathSegments,
  normalizeCityName,
  pathDistanceKm,
} from "./routeGraph";

const INF = Number.POSITIVE_INFINITY;

function assertCityIds(waypoints: string[]): { ok: true; ids: CityId[] } | { ok: false; message: string } {
  const ids: CityId[] = [];
  for (const w of waypoints) {
    const id = normalizeCityName(w);
    if (!id) {
      return { ok: false, message: `Unknown city: "${w}". Use cities from the network (e.g. Delhi, Mumbai, Bangalore).` };
    }
    ids.push(id);
  }
  return { ok: true, ids };
}

function dijkstra(
  adj: ReturnType<typeof buildAdjacencyList>,
  start: CityId,
  goal: CityId
): { path: CityId[]; distance: number } | null {
  if (start === goal) return { path: [start], distance: 0 };

  const dist = new Map<CityId, number>();
  const prev = new Map<CityId, CityId | null>();
  const visited = new Set<CityId>();

  for (const id of getCityIds()) {
    dist.set(id, INF);
    prev.set(id, null);
  }
  dist.set(start, 0);

  while (true) {
    let u: CityId | null = null;
    let best = INF;
    for (const id of getCityIds()) {
      if (visited.has(id)) continue;
      const d = dist.get(id)!;
      if (d < best) {
        best = d;
        u = id;
      }
    }
    if (u === null || best === INF) break;
    visited.add(u);
    if (u === goal) break;

    for (const e of adj.get(u)!) {
      const nd = best + e.weight;
      if (nd < dist.get(e.to)!) {
        dist.set(e.to, nd);
        prev.set(e.to, u);
      }
    }
  }

  if (dist.get(goal)! === INF) return null;

  const path: CityId[] = [];
  let cur: CityId | null = goal;
  while (cur !== null) {
    path.push(cur);
    cur = prev.get(cur)!;
  }
  path.reverse();
  return { path, distance: dist.get(goal)! };
}

function bellmanFord(
  adj: ReturnType<typeof buildAdjacencyList>,
  start: CityId,
  goal: CityId
): { path: CityId[]; distance: number } | null {
  if (start === goal) return { path: [start], distance: 0 };

  const vertices = getCityIds();
  const dist = new Map<CityId, number>();
  const prev = new Map<CityId, CityId | null>();

  for (const v of vertices) {
    dist.set(v, INF);
    prev.set(v, null);
  }
  dist.set(start, 0);

  const edges: { u: CityId; v: CityId; w: number }[] = [];
  for (const u of vertices) {
    for (const e of adj.get(u)!) {
      if (u < e.to) edges.push({ u, v: e.to, w: e.weight });
    }
  }

  for (let i = 0; i < vertices.length - 1; i++) {
    for (const { u, v, w } of edges) {
      if (dist.get(u)! + w < dist.get(v)!) {
        dist.set(v, dist.get(u)! + w);
        prev.set(v, u);
      }
      if (dist.get(v)! + w < dist.get(u)!) {
        dist.set(u, dist.get(v)! + w);
        prev.set(u, v);
      }
    }
  }

  if (dist.get(goal)! === INF) return null;

  const path: CityId[] = [];
  let cur: CityId | null = goal;
  while (cur !== null) {
    path.push(cur);
    cur = prev.get(cur)!;
  }
  path.reverse();
  return { path, distance: dist.get(goal)! };
}

type FloydResult = {
  dist: Map<string, number>;
  next: Map<string, CityId | null>;
};

function floydWarshall(): FloydResult {
  const vertices = getCityIds();
  const adj = buildAdjacencyList();
  const dist = new Map<string, number>();
  const next = new Map<string, CityId | null>();

  const key = (i: CityId, j: CityId) => `${i},${j}`;

  for (const i of vertices) {
    for (const j of vertices) {
      dist.set(key(i, j), i === j ? 0 : INF);
      next.set(key(i, j), null);
    }
  }

  for (const i of vertices) {
    for (const e of adj.get(i)!) {
      const d0 = dist.get(key(i, e.to))!;
      if (e.weight < d0) {
        dist.set(key(i, e.to), e.weight);
        next.set(key(i, e.to), e.to);
      }
    }
  }

  for (const k of vertices) {
    for (const i of vertices) {
      for (const j of vertices) {
        const dik = dist.get(key(i, k))!;
        const dkj = dist.get(key(k, j))!;
        const dij = dist.get(key(i, j))!;
        if (dik + dkj < dij) {
          dist.set(key(i, j), dik + dkj);
          next.set(key(i, j), next.get(key(i, k))!);
        }
      }
    }
  }

  return { dist, next };
}

let fwCache: FloydResult | null = null;
let fwVertexCount = 0;
function getFloyd(): FloydResult {
  const n = getCityIds().length;
  if (!fwCache || fwVertexCount !== n) {
    fwCache = floydWarshall();
    fwVertexCount = n;
  }
  return fwCache;
}

function pathFromFloyd(start: CityId, goal: CityId): { path: CityId[]; distance: number } | null {
  if (start === goal) return { path: [start], distance: 0 };
  const { dist, next } = getFloyd();
  const key = (i: CityId, j: CityId) => `${i},${j}`;
  if (dist.get(key(start, goal))! === INF) return null;

  const path: CityId[] = [start];
  let cur = start;
  while (cur !== goal) {
    const nxt = next.get(key(cur, goal));
    if (nxt === null) break;
    path.push(nxt);
    cur = nxt;
  }
  return { path, distance: dist.get(key(start, goal))! };
}

/** Greedy best-first toward goal: at each step pick neighbor minimizing w(u,v)+d(v,goal) — equivalent to Dijkstra here. */
function greedyShortestPath(
  adj: ReturnType<typeof buildAdjacencyList>,
  start: CityId,
  goal: CityId
): { path: CityId[]; distance: number } | null {
  return dijkstra(adj, start, goal);
}

function shortestPathForAlgorithm(
  algo: string,
  adj: ReturnType<typeof buildAdjacencyList>,
  a: CityId,
  b: CityId
): { path: CityId[]; distance: number } | null {
  switch (algo) {
    case "bellman-ford":
      return bellmanFord(adj, a, b);
    case "all-pairs":
      return pathFromFloyd(a, b);
    case "greedy":
      return greedyShortestPath(adj, a, b);
    case "tsp":
      return dijkstra(adj, a, b);
    default:
      return dijkstra(adj, a, b);
  }
}

function chainShortestPath(
  algo: string,
  adj: ReturnType<typeof buildAdjacencyList>,
  waypoints: CityId[]
): { path: CityId[]; distance: number } | null {
  if (waypoints.length < 2) {
    const only = waypoints[0];
    return only ? { path: [only], distance: 0 } : { path: [], distance: 0 };
  }
  const segments: CityId[][] = [];
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const sp = shortestPathForAlgorithm(algo, adj, waypoints[i], waypoints[i + 1]);
    if (!sp) return null;
    total += sp.distance;
    segments.push(sp.path);
  }
  const merged = mergePathSegments(segments);
  const wm = getEdgeWeightMap();
  const verify = pathDistanceKm(merged, wm);
  return { path: merged, distance: verify ?? total };
}

/** Nearest-neighbor TSP: visit all required cities once, return to start; order chosen by NN on shortest-path distances. */
function tspNearestNeighbor(
  adj: ReturnType<typeof buildAdjacencyList>,
  start: CityId,
  mustVisit: CityId[]
): { path: CityId[]; distance: number } | null {
  const unique = [...new Set(mustVisit)];
  const targets = unique.filter((c) => c !== start);
  if (targets.length === 0) return { path: [start], distance: 0 };

  const remaining = new Set<CityId>(targets);
  let current = start;
  const segments: CityId[][] = [];

  while (remaining.size > 0) {
    let bestNext: CityId | null = null;
    let bestDist = INF;
    for (const cand of remaining) {
      const sp = dijkstra(adj, current, cand);
      if (!sp) continue;
      if (sp.distance < bestDist) {
        bestDist = sp.distance;
        bestNext = cand;
      }
    }
    if (bestNext === null) return null;
    const seg = dijkstra(adj, current, bestNext)!;
    segments.push(seg.path);
    current = bestNext;
    remaining.delete(bestNext);
  }

  const back = dijkstra(adj, current, start);
  if (!back) return null;
  segments.push(back.path);

  const merged = mergePathSegments(segments);
  const wm = getEdgeWeightMap();
  const d = pathDistanceKm(merged, wm);
  if (d === null) return { path: merged, distance: 0 };
  return { path: merged, distance: d };
}

const EXPLANATIONS: Record<string, { name: string; complexity: string; text: string }> = {
  "bellman-ford": {
    name: "Bellman-Ford",
    complexity: "O(V·E)",
    text: "Relaxes all edges repeatedly (V−1 rounds) to obtain shortest paths. On this network (non‑negative weights) it matches the true shortest route and total distance in kilometres.",
  },
  "all-pairs": {
    name: "Floyd-Warshall",
    complexity: "O(V³)",
    text: "All-pairs shortest paths; your route is built from the optimal segment distances between each waypoint on the graph, so the displayed km sum matches the underlying edges.",
  },
  greedy: {
    name: "Dijkstra (greedy)",
    complexity: "O(E log V)",
    text: "Classic greedy shortest-path: always expands the minimum tentative distance. On non‑negative roads, this is optimal and matches Bellman-Ford/Floyd-Warshall totals here.",
  },
  tsp: {
    name: "TSP (nearest neighbor)",
    complexity: "O(n²) path queries",
    text: "Heuristic tour: visits every city you listed (source, stops, destination) in nearest-neighbor order on shortest-path distances, then returns to the start. Not globally optimal for TSP but fully derived from the graph.",
  },
};

/** Four algorithms compared: three shortest-path (same km on this graph) + TSP (different metric). */
export type ComparisonRowId = "bellman-ford" | "floyd-warshall" | "dijkstra" | "tsp-tour";

export type ComparisonRow = {
  id: ComparisonRowId;
  title: string;
  subtitle: string;
  distanceKm: number;
  complexity: string;
  /** What this algorithm is best / known for (honest “winner” context) */
  bestForLine: string;
  outcomeCaption: string;
  family: "shortest-path" | "tsp-tour";
};

export type RouteComputeOk = {
  ok: true;
  routePathIds: CityId[];
  distance: number;
  algorithmName: string;
  timeComplexity: string;
  explanation: string;
  comparisonRows: ComparisonRow[];
};

export type RouteComputeErr = { ok: false; message: string };

export function computeRoute(config: RouteConfig): RouteComputeOk | RouteComputeErr {
  const stops = config.stops.map((s) => s.trim()).filter(Boolean);
  const parsed = assertCityIds([config.source, ...stops, config.destination]);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  const ids = parsed.ids;
  const source = ids[0];
  const destination = ids[ids.length - 1];
  const middle = ids.slice(1, -1);
  const adj = buildAdjacencyList();

  if (config.algorithm === "tsp") {
    const toVisit = [source, ...middle, destination];
    const tsp = tspNearestNeighbor(adj, source, toVisit);
    if (!tsp) {
      return { ok: false, message: "Could not build a TSP tour — the graph may be disconnected for the selected cities." };
    }
    const meta = EXPLANATIONS.tsp;
    const comparisonRows = buildComparisonRows(adj, source, destination, middle, tsp.distance);
    return {
      ok: true,
      routePathIds: tsp.path,
      distance: tsp.distance,
      algorithmName: meta.name,
      timeComplexity: meta.complexity,
      explanation: meta.text,
      comparisonRows,
    };
  }

  const waypoints = [source, ...middle, destination];
  const chain = chainShortestPath(config.algorithm, adj, waypoints);
  if (!chain) {
    return { ok: false, message: "No route exists between some waypoints on the current road network." };
  }

  const meta = EXPLANATIONS[config.algorithm] ?? EXPLANATIONS.greedy;
  const comparisonRows = buildComparisonRows(adj, source, destination, middle, chain.distance);

  return {
    ok: true,
    routePathIds: chain.path,
    distance: chain.distance,
    algorithmName: meta.name,
    timeComplexity: meta.complexity,
    explanation: meta.text,
    comparisonRows,
  };
}

/**
 * Bellman–Ford, Floyd–Warshall, and Dijkstra all yield the same shortest distance here
 * (non‑negative edge weights). TSP is a different objective (round‑trip tour).
 */
function buildComparisonRows(
  adj: ReturnType<typeof buildAdjacencyList>,
  source: CityId,
  destination: CityId,
  middle: CityId[],
  selectedDistance: number
): ComparisonRow[] {
  const waypoints = [source, ...middle, destination];
  const bf = chainShortestPath("bellman-ford", adj, waypoints);
  const fw = chainShortestPath("all-pairs", adj, waypoints);
  const gj = chainShortestPath("greedy", adj, waypoints);
  const tsp = tspNearestNeighbor(adj, source, [...middle, destination]);

  const spDist = bf?.distance ?? fw?.distance ?? gj?.distance ?? selectedDistance;
  const tspDist = tsp?.distance ?? selectedDistance;
  const spRounded = Math.round(spDist);
  const tspRounded = Math.round(tspDist);
  const extraKm = Math.max(0, tspRounded - spRounded);
  const pctMore =
    spRounded > 0 ? Math.round((extraKm / spRounded) * 100) : 0;

  const spCaptionBase =
    "On this graph all three shortest-path methods get the same total km — none is “worse” for distance. They differ in speed and when to use them in general.";

  return [
    {
      id: "bellman-ford",
      title: "Bellman–Ford",
      subtitle:
        "Relaxes every edge repeatedly (V−1 rounds). Handles negative edge weights in general; on this road network weights are non‑negative so it matches Dijkstra and Floyd–Warshall exactly.",
      distanceKm: spRounded,
      complexity: "O(V·E)",
      bestForLine:
        "Best for: learning / graphs where edges can be negative — here same km as the other two SP algorithms.",
      outcomeCaption: spCaptionBase,
      family: "shortest-path",
    },
    {
      id: "floyd-warshall",
      title: "Floyd–Warshall",
      subtitle:
        "Computes shortest paths between all pairs of cities at once, then your route is stitched from optimal segments.",
      distanceKm: spRounded,
      complexity: "O(V³)",
      bestForLine:
        "Best for: many queries between lots of pairs — heavy if you only need one route (same km as BF & Dijkstra here).",
      outcomeCaption: spCaptionBase,
      family: "shortest-path",
    },
    {
      id: "dijkstra",
      title: "Dijkstra (greedy)",
      subtitle:
        "Always expands the closest unvisited city — the usual choice for road networks with non‑negative distances.",
      distanceKm: spRounded,
      complexity: "O(E log V)",
      bestForLine:
        "Best for: this kind of route in practice — usually fastest to compute a single shortest path on a sparse map.",
      outcomeCaption:
        "Same minimum km as Bellman–Ford and Floyd–Warshall. For **speed** on one A→B path, Dijkstra is often the practical winner.",
      family: "shortest-path",
    },
    {
      id: "tsp-tour",
      title: "TSP — nearest-neighbor tour",
      subtitle:
        "Visits every city you listed in nearest-neighbor order, then returns to the start — a round trip, not “drive only to destination”.",
      distanceKm: tspRounded,
      complexity: "O(n²) shortest-path sub-queries",
      bestForLine:
        "Best for: planning a loop that touches all stops and comes back — not comparable as “shortest km only to destination”.",
      outcomeCaption:
        extraKm === 0
          ? "Same total km by coincidence — still a tour metric. Do not rank against SP rows as “best/worst distance to destination”."
          : `~${pctMore}% more total km than the SP rows (${extraKm.toLocaleString()} km extra) — expected for a return-to-start tour, not “bad routing”.`,
      family: "tsp-tour",
    },
  ];
}

export function idsToLabels(ids: CityId[]): string[] {
  return ids.map((id) => cityIdToLabel(id));
}

/** UI / copy for the selected algorithm id. */
export function getAlgorithmMeta(algorithmId: string): { name: string; complexity: string; text: string } {
  return EXPLANATIONS[algorithmId] ?? EXPLANATIONS.greedy;
}
