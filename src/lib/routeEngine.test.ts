import { describe, expect, it } from "vitest";
import { computeRoute, getAlgorithmMeta } from "./routeEngine";

describe("computeRoute", () => {
  it("matches graph edge sum for Delhi → Jaipur (direct)", () => {
    const out = computeRoute({
      source: "Delhi",
      destination: "Jaipur",
      stops: [],
      algorithm: "greedy",
    });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.distance).toBe(280);
    expect(out.routePathIds).toEqual(["del", "jai"]);
  });

  it("agrees across Bellman-Ford, Floyd-Warshall, and Dijkstra for Delhi → Chennai", () => {
    const algos = ["bellman-ford", "all-pairs", "greedy"] as const;
    const distances = algos.map((algorithm) => {
      const out = computeRoute({
        source: "Delhi",
        destination: "Chennai",
        stops: [],
        algorithm,
      });
      expect(out.ok).toBe(true);
      return out.ok ? out.distance : -1;
    });
    expect(distances[0]).toBe(distances[1]);
    expect(distances[1]).toBe(distances[2]);
  });

  it("getAlgorithmMeta returns known algorithm names", () => {
    expect(getAlgorithmMeta("all-pairs").name).toBe("Floyd-Warshall");
    expect(getAlgorithmMeta("unknown-id").name).toBe("Dijkstra (greedy)");
  });

  it("comparisonRows: four algorithms — three SP tie + TSP tour", () => {
    const out = computeRoute({
      source: "Delhi",
      destination: "Jaipur",
      stops: [],
      algorithm: "greedy",
    });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.comparisonRows).toHaveLength(4);
    const bf = out.comparisonRows.find((r) => r.id === "bellman-ford");
    const fw = out.comparisonRows.find((r) => r.id === "floyd-warshall");
    const dj = out.comparisonRows.find((r) => r.id === "dijkstra");
    const tsp = out.comparisonRows.find((r) => r.id === "tsp-tour");
    expect(bf?.distanceKm).toBe(280);
    expect(fw?.distanceKm).toBe(280);
    expect(dj?.distanceKm).toBe(280);
    expect(bf?.title).toContain("Bellman");
    expect(fw?.title).toContain("Floyd");
    expect(dj?.title).toContain("Dijkstra");
    expect(tsp?.title).toContain("TSP");
    expect(tsp?.distanceKm).toBeGreaterThanOrEqual(280);
    expect(bf?.complexity).toMatch(/O\(/);
    expect(dj?.bestForLine.length).toBeGreaterThan(10);
  });
});
