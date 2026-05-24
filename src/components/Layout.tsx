import { BarChart3, Info, Map } from "lucide-react";
import type { ReactNode } from "react";
import { Header } from "./Header";

export type MobileTab = "map" | "areas" | "details";

interface LayoutProps {
  left: ReactNode;
  map: ReactNode;
  right: ReactNode;
  mobileTab: MobileTab;
  onMobileTabChange: (tab: MobileTab) => void;
}

const mobileTabs = [
  { id: "map" as const, label: "Kartta", icon: Map },
  { id: "areas" as const, label: "Alueet", icon: BarChart3 },
  { id: "details" as const, label: "Selitys", icon: Info }
];

export function Layout({ left, map, right, mobileTab, onMobileTabChange }: LayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-950">
      <Header />

      <nav className="grid h-12 grid-cols-3 border-b border-slate-200 bg-white lg:hidden" aria-label="Mobiilinäkymät">
        {mobileTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onMobileTabChange(id)}
            className={`inline-flex items-center justify-center gap-2 text-sm font-semibold ${
              mobileTab === id ? "text-slate-950" : "text-slate-500"
            }`}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      <main className="h-[calc(100vh-112px)] min-h-0 overflow-hidden lg:grid lg:h-[calc(100vh-64px)] lg:grid-cols-[260px_minmax(280px,1fr)_minmax(460px,42vw)] xl:grid-cols-[280px_minmax(320px,1fr)_minmax(700px,48vw)] 2xl:grid-cols-[300px_minmax(520px,1fr)_minmax(760px,36vw)]">
        <section
          className={`h-full min-h-0 overflow-y-auto border-r border-slate-200 bg-slate-50 ${
            mobileTab === "areas" ? "block" : "hidden"
          } lg:block`}
        >
          {left}
        </section>

        <section className={`h-full min-h-0 overflow-hidden bg-white ${mobileTab === "map" ? "block" : "hidden"} lg:block`}>
          {map}
        </section>

        <section
          className={`h-full min-h-0 overflow-y-auto border-l border-slate-200 bg-slate-50 p-4 ${
            mobileTab === "details" ? "block" : "hidden"
          } lg:block`}
        >
          {right}
        </section>
      </main>
    </div>
  );
}
