import type { AnalysisView, AnalysisViewConfig, MetricKey } from "../types";

export const VIEW_CONFIGS: Record<AnalysisView, AnalysisViewConfig & { interpretation: string; mapSentence: string }> = {
  overall: {
    id: "overall",
    label: "Paras kokonaispotentiaali",
    eyebrow: "1",
    description: "Yhdistää väestön, autoilun, joukkoliikenteen ja kampanjan toteutettavuuden.",
    sortMetric: "jspi_score",
    interpretation: "Käytä tätä, kun haluat kokonaiskuvan parhaista kampanja-alueista.",
    mapSentence: "Näet alueet, joissa kampanjointi näyttää kokonaisuutena vahvimmalta."
  },
  national: {
    id: "national",
    label: "Eniten mahdollisia vaihtajia",
    eyebrow: "2",
    description: "Korostaa alueita, joissa arvioitu vaihtajien määrä on suurin.",
    sortMetric: "national_absolute_potential_score",
    interpretation: "Käytä tätä, kun haluat löytää alueet, joissa kampanjalla voisi tavoittaa eniten ihmisiä.",
    mapSentence: "Näet alueet, joissa mahdollisten vaihtajien määrä painaa eniten."
  },
  underused: {
    id: "underused",
    label: "Hyvä joukkoliikenne, mutta paljon autoilua",
    eyebrow: "3",
    description: "Etsii alueita, joissa joukkoliikennettä on tarjolla, mutta autoilun paine näyttää suurelta.",
    sortMetric: "underused_transit_potential_score",
    interpretation:
      "Käytä tätä, kun haluat löytää alueet, joissa joukkoliikennettä voisi olla mahdollista saada parempaan käyttöön.",
    mapSentence: "Näet alueet, joissa hyvä joukkoliikenne ja vahva autoilu osuvat samalle alueelle."
  }
};

const metricLabels: Record<MetricKey, string> = {
  jspi_score: "Kokonaispotentiaali",
  national_absolute_potential_score: "Mahdolliset vaihtajat",
  underused_transit_potential_score: "Alikäytetty joukkoliikenne",
  estimated_switchers: "Arvio vaihtajista",
  car_pressure_score: "Autoilun paine",
  public_transport_service_score: "Joukkoliikenteen tarjonta",
  accessibility_score: "Pysäkkien ja asemien läheisyys",
  travel_time_competitiveness_score_final: "Matka-ajan kilpailukyky",
  data_confidence_score: "Datan luotettavuus"
};

const metricExplanations: Record<MetricKey, string> = {
  jspi_score: "Yhdistää alueen koon, autoilun paineen, joukkoliikenteen tarjonnan ja kampanjan toteutettavuuden.",
  national_absolute_potential_score: "Kuvaa, missä arvioitu mahdollisten vaihtajien määrä on suurin suhteessa muihin alueisiin.",
  underused_transit_potential_score:
    "Kuvaa alueita, joilla joukkoliikennettä on tarjolla, mutta autoilun paine näyttää suurelta.",
  estimated_switchers: "Mallin arvio ihmisistä, joille joukkoliikenne voisi olla realistinen vaihtoehto.",
  car_pressure_score: "Kuvaa, kuinka vahvasti alue näyttää nojaavan henkilöautoliikenteeseen.",
  public_transport_service_score:
    "Kuvaa pysäkkien, reittien ja vuorotarjonnan vahvuutta saatavilla olevan datan perusteella.",
  accessibility_score: "Kuvaa, kuinka lähellä alueen keskipistettä pysäkit, asemat tai liityntäpysäköinti ovat.",
  travel_time_competitiveness_score_final:
    "Kuvaa, kuinka hyvin joukkoliikenne voi kilpailla auton kanssa matka-ajassa. Kaikilla alueilla tieto voi olla osittain arvioitu.",
  data_confidence_score: "Kuvaa, kuinka monesta tärkeästä tietolähteestä alueelle löytyi käyttökelpoista tietoa."
};

export function getMetricLabel(metric: MetricKey | string): string {
  return metricLabels[metric as MetricKey] ?? metric;
}

export function getMetricExplanation(metric: MetricKey | string): string {
  return metricExplanations[metric as MetricKey] ?? "Tekninen kenttä, joka näytetään tarkempaa tarkastelua varten.";
}

export function getViewMetric(view: AnalysisView): MetricKey {
  return VIEW_CONFIGS[view].sortMetric;
}
