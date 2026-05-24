import { Copy } from "lucide-react";
import { useMemo, useState } from "react";
import type { AreaRecord } from "../types";
import { getMetricLabel } from "../lib/labels";

interface RawFieldsTableProps {
  area: AreaRecord;
}

export function RawFieldsTable({ area }: RawFieldsTableProps) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return Object.entries(area.raw)
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(([key, value]) => {
        if (!normalized) {
          return true;
        }
        return `${key} ${value}`.toLowerCase().includes(normalized);
      });
  }, [area.raw, query]);

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(area.raw, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Hae kenttää"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-200 focus:ring-2"
        />
        <button
          type="button"
          onClick={copyJson}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Copy size={15} aria-hidden="true" />
          {copied ? "Kopioitu" : "Kopioi JSON"}
        </button>
      </div>

      <div className="max-h-[360px] overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 font-semibold">Kenttä</th>
              <th className="px-3 py-2 font-semibold">Arvo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(([key, value]) => (
              <tr key={key}>
                <td className="w-2/5 px-3 py-2 align-top font-mono text-[11px] text-slate-500">
                  <div>{key}</div>
                  <div className="font-sans text-[11px] text-slate-400">{getMetricLabel(key)}</div>
                </td>
                <td className="px-3 py-2 align-top text-slate-800">{value || "Ei tietoa"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
