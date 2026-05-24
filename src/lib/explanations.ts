import type { AreaRecord } from "../types";
import { formatDistance } from "./format";

const reasonMap: Array<[RegExp, string]> = [
  [/suuri henkil/i, "paljon mahdollisia työmatkaliikkujia"],
  [/siirtyj/i, "merkittävä arvio mahdollisista vaihtajista"],
  [/alik/i, "joukkoliikenteen käyttöä voisi olla mahdollista vahvistaa"],
  [/autoilupaine/i, "autoilun paine on korkea"],
  [/palvelutaso/i, "joukkoliikenteen tarjonta on hyvä"],
  [/matka-aika/i, "joukkoliikenteen matka-aika näyttää kilpailukykyiseltä"],
  [/saavutettavuus|pys/i, "pysäkit ja asemat ovat lähellä"]
];

export function explainMissingReason(reason: string): string {
  const normalized = reason.trim();
  if (!normalized) {
    return "Ei puuttuvia signaaleja tiedossa.";
  }

  const translations: Record<string, string> = {
    statfin_commuting_missing: "Tarkka työmatkaliikkumisen tieto puuttuu.",
    od_sample_missing: "Tarkka matka-aikavertailu puuttuu.",
    traffic_missing: "Kaikkia liikennemäärätietoja ei ole saatavilla.",
    vehicle_missing: "Ajoneuvokantatieto puuttuu."
  };

  return translations[normalized] ?? normalized.replace(/_/g, " ");
}

export function explainMissingReasons(value: string): string[] {
  const parts = value
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return ["Ei puuttuvia signaaleja tiedossa."];
  }

  return parts.map(explainMissingReason);
}

export function explainCommutingSource(source: string): string {
  const normalized = source.toLowerCase();
  if (!source || normalized === "ei tietoa") {
    return "Ei tietoa";
  }
  if (normalized.includes("statfin")) {
    return "Työmatkatieto perustuu saatavilla olevaan tilastotietoon.";
  }
  if (normalized.includes("fallback") || normalized.includes("default")) {
    return "Työmatkatieto on osin mallin oletuksiin perustuva.";
  }
  return source.replace(/_/g, " ");
}

export function confidenceExplanation(level: string): string {
  const normalized = level.toLowerCase();
  if (normalized.includes("korkea")) {
    return "Useimmat tärkeät tietolähteet ovat käytössä.";
  }
  if (normalized.includes("matala")) {
    return "Tulosta pitää tulkita varovasti.";
  }
  if (normalized.includes("keskitaso")) {
    return "Osa tiedoista on arvioitu tai puuttuu.";
  }
  return "Luotettavuustietoa ei ole saatavilla.";
}

export function buildReasonText(area: AreaRecord): string {
  const translated = area.recommendation_reason
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => reasonMap.find(([pattern]) => pattern.test(part))?.[1] ?? part.toLowerCase())
    .filter((part, index, all) => all.indexOf(part) === index)
    .slice(0, 4);

  if (!translated.length) {
    return "Alue nousee esiin, koska useampi kampanjointia tukeva tekijä osuu samaan paikkaan.";
  }

  if (translated.length === 1) {
    return `Alue nousee esiin, koska siellä on ${translated[0]}.`;
  }

  const last = translated[translated.length - 1];
  const first = translated.slice(0, -1).join(", ");
  return `Alue nousee esiin, koska siellä on ${first} ja ${last}.`;
}

export function buildActionText(area: AreaRecord): string {
  const type = area.recommended_campaign_type || "kohdennettu joukkoliikennekampanja";
  const angle = area.message_angle || "Viestissä kannattaa korostaa joukkoliikenteen arjen hyötyjä.";
  return `Kampanja kannattaa toteuttaa muodossa: ${type}. Viestissä kannattaa korostaa: ${angle}`;
}

export function nearestPlaceSummary(area: AreaRecord): string {
  const stop = formatDistance(area.nearest_transit_stop_distance_m);
  const rail = formatDistance(area.rail_nearest_distance_m);
  const parking = formatDistance(area.liipi_nearest_distance_m);
  return `Lähin pysäkki ${stop}, asema ${rail}, liityntäpysäköinti ${parking}.`;
}
