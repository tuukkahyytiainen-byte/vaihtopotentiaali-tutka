# Vaihtopotentiaali-datasetin näkymät v2

Luotu: 2026-05-20T15:09:24.927006+00:00

## Näkymät

| Näkymä | Käyttö |
|---|---|
| `national_absolute_potential` | Missä on suurin henkilömääräinen potentiaali. |
| `underused_transit_potential` | Missä joukkoliikennettä on hyvin, mutta autoilu näyttää suhteessa liian suurelta. |

## Muutokset

- `data_confidence_level` lasketaan uudelleen realistisemmin.
- StatFin-pendelöinnin puute näkyy kentissä `commuting_data_source` ja `confidence_missing_reasons`.
- LIIPI:n vaikutusta kampanjatyypin valintaan on pienennetty.
- `jspi_score_original` säilyttää vanhan pisteen.
- `jspi_score_v2` on uusi korjattu piste.
- `jspi_score` käyttää nyt v2-pistettä.

## Top 10 national_absolute_potential

|   area_id | area_name                     |   municipality_code |   national_absolute_potential_score |   estimated_switchers | recommended_campaign_type        | data_confidence_level   |
|----------:|:------------------------------|--------------------:|------------------------------------:|----------------------:|:---------------------------------|:------------------------|
|     00100 | Helsinki keskusta - Etu-Töölö |                 091 |                               100   |               2268.19 | asema- ja junakampanja           | keskitaso               |
|     01600 | Myyrmäki                      |                 092 |                               100   |               1687.55 | asema- ja junakampanja           | keskitaso               |
|     01620 | Martinlaakso                  |                 092 |                               100   |               1382.39 | asema- ja junakampanja           | keskitaso               |
|     00700 | Malmi                         |                 091 |                               100   |               1373.73 | asema- ja junakampanja           | keskitaso               |
|     70820 | Litmanen                      |                 297 |                               100   |               1134.07 | bussikäytävä- ja pysäkkikampanja | keskitaso               |
|     15140 | Kartano-Paavola               |                 398 |                               100   |               1097.79 | asema- ja junakampanja           | keskitaso               |
|     60200 | Törnävä                       |                 743 |                               100   |               1025    | asema- ja junakampanja           | keskitaso               |
|     01300 | Tikkurila                     |                 092 |                                99.9 |               2651.52 | asema- ja junakampanja           | keskitaso               |
|     00530 | Kallio                        |                 091 |                                99.9 |               2246.43 | asema- ja junakampanja           | keskitaso               |
|     00320 | Etelä-Haaga                   |                 091 |                                99.9 |               1350.86 | asema- ja junakampanja           | keskitaso               |

## Top 10 underused_transit_potential

|   area_id | area_name             |   municipality_code |   underused_transit_potential_score |   estimated_switchers | recommended_campaign_type   | data_confidence_level   |
|----------:|:----------------------|--------------------:|------------------------------------:|----------------------:|:----------------------------|:------------------------|
|     00730 | Tapanila              |                 091 |                                98.5 |              1229.7   | asema- ja junakampanja      | keskitaso               |
|     00520 | Itä- ja Keski-Pasila  |                 091 |                                98.5 |              1107.14  | asema- ja junakampanja      | keskitaso               |
|     00410 | Malminkartano         |                 091 |                                98.3 |               973.294 | asema- ja junakampanja      | keskitaso               |
|     00240 | Länsi-Pasila          |                 091 |                                98.2 |              1259.46  | asema- ja junakampanja      | keskitaso               |
|     00700 | Malmi                 |                 091 |                                98.1 |              1373.73  | asema- ja junakampanja      | keskitaso               |
|     00170 | Kruununhaka           |                 091 |                                97.9 |               914.783 | asema- ja junakampanja      | keskitaso               |
|     00550 | Vallila - Hermanni    |                 091 |                                97.8 |              1081.35  | asema- ja junakampanja      | keskitaso               |
|     00120 | Punavuori - Bulevardi |                 091 |                                97.8 |               894.058 | asema- ja junakampanja      | keskitaso               |
|     00320 | Etelä-Haaga           |                 091 |                                97.7 |              1350.86  | asema- ja junakampanja      | keskitaso               |
|     00640 | Oulunkylä - Patola    |                 091 |                                97.7 |               935.719 | asema- ja junakampanja      | keskitaso               |
