import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * A single, global admin network indicator. It watches Supabase REST/storage
 * requests so every save/update/delete action gives immediate visual feedback
 * without requiring every dashboard page to implement its own spinner.
 */
export function AdminNetworkActivity() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalFetch = window.fetch.bind(window);
    let active = 0;
    let disposed = false;

    const isTrackedRequest = (input: RequestInfo | URL) => {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
      return /supabase\.co\/(rest|storage|auth)\//i.test(url);
    };

    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const track = isTrackedRequest(input);
      if (track) {
        active += 1;
        if (!disposed) setPending(active);
      }
      try {
        return await originalFetch(input, init);
      } finally {
        if (track) {
          active = Math.max(0, active - 1);
          if (!disposed) setPending(active);
        }
      }
    }) as typeof window.fetch;

    return () => {
      disposed = true;
      window.fetch = originalFetch;
    };
  }, []);

  if (!pending) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[100] flex min-h-11 items-center justify-center border-b border-primary/20 bg-slate-950 px-4 py-2 text-center text-xs font-bold text-white shadow-lg sm:text-sm"
    >
      <Loader2 className="me-2 h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      <span>جارٍ تنفيذ العملية…</span>
      <span className="mx-2 text-slate-400">/</span>
      <span className="text-slate-300">Processing…</span>
    </div>
  );
}
