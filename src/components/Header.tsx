import { Info, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-[700] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-5">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-slate-950 sm:text-xl">Vaihtopotentiaali Tutka</h1>
        <p className="hidden truncate text-sm text-slate-500 sm:block">
          Löydä alueet, joissa joukkoliikennekampanjalla voi olla suurin vaikutus.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Info size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Mitä tämä tekee?</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[900] flex items-start justify-center bg-slate-950/30 p-4 pt-20">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-950">Mitä tämä tekee?</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Sulje"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Tämä työkalu yhdistää väestö-, liikenne-, joukkoliikenne- ja ajoneuvodataa. Sen avulla arvioidaan,
              missä alueilla ihmiset voisivat realistisesti vaihtaa henkilöautosta joukkoliikenteeseen. Tulokset ovat
              suuntaa-antavia päätöksenteon tueksi, eivät virallisia ennusteita.
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
