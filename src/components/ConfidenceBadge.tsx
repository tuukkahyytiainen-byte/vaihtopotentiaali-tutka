import { titleCaseConfidence } from "../lib/format";
import { confidenceTone } from "../lib/colors";

interface ConfidenceBadgeProps {
  level: string;
  compact?: boolean;
}

export function ConfidenceBadge({ level, compact = false }: ConfidenceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 ${confidenceTone(level)} ${
        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      {titleCaseConfidence(level)}
    </span>
  );
}
