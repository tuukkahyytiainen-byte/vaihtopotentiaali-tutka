interface HelpBoxProps {
  title?: string;
  text: string;
}

export function HelpBox({ title = "Miten tätä tulkitaan?", text }: HelpBoxProps) {
  return (
    <aside className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-3 text-sm leading-relaxed text-slate-700">
      <div className="font-semibold text-slate-950">{title}</div>
      <p className="mt-1">{text}</p>
    </aside>
  );
}
