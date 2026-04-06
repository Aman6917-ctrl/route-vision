import { useState, useEffect } from "react";
import { searchIndiaPlaces, type IndiaPlace } from "@/lib/indiaPlaceSearch";

export function useIndiaPlaceSearch(query: string, enabled: boolean) {
  const [results, setResults] = useState<IndiaPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!enabled || q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const r = await searchIndiaPlaces(q, ac.signal);
        setResults(r);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 320);

    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [query, enabled]);

  return { results, loading };
}
