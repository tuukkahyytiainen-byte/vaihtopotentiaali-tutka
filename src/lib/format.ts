export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  if (!text || text.toLowerCase() === "nan" || text.toLowerCase() === "null") {
    return null;
  }

  const numberValue = Number(text.replace(",", "."));
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function normalizeCode(value: unknown, length: number): string {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }
  return text.padStart(length, "0");
}

export function stringValue(value: unknown, fallback = ""): string {
  const text = String(value ?? "").trim();
  return text || fallback;
}

const integerFormatter = new Intl.NumberFormat("fi-FI", {
  maximumFractionDigits: 0
});

const decimalFormatter = new Intl.NumberFormat("fi-FI", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const flexibleFormatter = new Intl.NumberFormat("fi-FI", {
  maximumFractionDigits: 1
});

const percentFormatter = new Intl.NumberFormat("fi-FI", {
  style: "percent",
  maximumFractionDigits: 0
});

function isMissing(value: number | null | undefined): boolean {
  return value === null || value === undefined || Number.isNaN(value);
}

export function formatNumber(value: number | null | undefined, maximumFractionDigits = 0): string {
  if (isMissing(value)) {
    return "Ei tietoa";
  }

  const numericValue = value as number;
  return new Intl.NumberFormat("fi-FI", {
    maximumFractionDigits
  }).format(numericValue);
}

export function formatInteger(value: number | null | undefined): string {
  if (isMissing(value)) {
    return "Ei tietoa";
  }
  return integerFormatter.format(value as number);
}

export function formatDecimal(value: number | null | undefined): string {
  if (isMissing(value)) {
    return "Ei tietoa";
  }
  return decimalFormatter.format(value as number);
}

export function formatScore(value: number | null | undefined): string {
  if (isMissing(value)) {
    return "Ei tietoa";
  }

  const numericValue = value as number;
  const normalized = numericValue <= 1 ? numericValue * 100 : numericValue;
  return `${flexibleFormatter.format(normalized)} / 100`;
}

export function formatRatioScore(value: number | null | undefined): string {
  return formatScore(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (isMissing(value)) {
    return "Ei tietoa";
  }

  const numericValue = value as number;
  const normalized = numericValue > 1 ? numericValue / 100 : numericValue;
  return percentFormatter.format(normalized);
}

export function formatDistance(value: number | null | undefined): string {
  if (isMissing(value)) {
    return "Ei tietoa";
  }
  const numericValue = value as number;
  if (numericValue >= 1000) {
    return `${decimalFormatter.format(numericValue / 1000)} km`;
  }
  return `${integerFormatter.format(numericValue)} m`;
}

export function formatArea(value: number | null | undefined): string {
  if (isMissing(value)) {
    return "Ei tietoa";
  }

  const numericValue = value as number;
  if (numericValue < 1) {
    return `${integerFormatter.format(numericValue * 1_000_000)} m²`;
  }
  return `${decimalFormatter.format(numericValue)} km²`;
}

export function truncateLabel(value: string, max = 24): string {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, Math.max(0, max - 3))}...`;
}

export function titleCaseConfidence(value: string | null | undefined): string {
  const normalized = stringValue(value, "ei tietoa").toLowerCase();
  if (normalized.includes("korkea")) {
    return "Korkea";
  }
  if (normalized.includes("keskitaso")) {
    return "Keskitaso";
  }
  if (normalized.includes("matala")) {
    return "Matala";
  }
  return "Ei tietoa";
}
