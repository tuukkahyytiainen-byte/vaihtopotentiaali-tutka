# Vaihtopotentiaali Codex dataset

Luotu: 2026-05-20T14:52:24.307322+00:00

Tämä kansio sisältää sovellukselle valmiiksi jalostetun datan. Päätaso on postinumeroalue, koska mainonnan kohdentaminen vaatii kuntaa tarkemman tason.

## Tärkeimmät tiedostot

| Tiedosto | Käyttö |
|---|---|
| `app_inputs/jspi_area_scores.parquet` | Kartan ja aluevertailun päätiedosto. Sisältää JSPI-pisteen 0-100. |
| `app_inputs/campaign_hotspots.parquet` | Top-alueet ja kampanjatyyppisuositukset. |
| `app_inputs/area_features.parquet` | Kaikki yhdistetyt mallimuuttujat analyysiin ja debugointiin. |
| `docs/data_dictionary.csv` | Sarakekohtainen datakatalogi. |
| `docs/model_config.json` | JSPI-mallin painot ja oletukset. |
| `docs/PIPELINE_REPORT.md` | Ajoraportti ja mahdolliset varoitukset. |

## JSPI-kaava

JSPI =

- 40 % siirtopotentiaali henkilöinä
- 25 % joukkoliikenteen alikäyttö suhteessa palvelutasoon
- 20 % henkilöautoliikenteen paine
- 10 % päästö- ja ruuhkavaikutus
- 5 % mainonnan toteutettavuus

Lopullinen pistemäärä on 0-100. Tämä on ensimmäisen version päätöksentekoindeksi, ei virallinen ennuste.

## Top 10 hotspotit

|   rank |   area_id | area_name                     |   municipality_code |   jspi_score |   estimated_switchers | recommended_campaign_type           | recommendation_reason                                                                                                             |
|-------:|----------:|:------------------------------|--------------------:|-------------:|----------------------:|:------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------|
|      1 |     00730 | Tapanila                      |                 091 |         91.9 |              1229.7   | liityntäpysäköinti + joukkoliikenne | suuri arvioitu siirtyjäpotentiaali; korkea autoilupaine; hyvä joukkoliikenteen palvelutaso; hyvä pysäkki- tai asemasaavutettavuus |
|      2 |     00700 | Malmi                         |                 091 |         91.6 |              1373.73  | liityntäpysäköinti + joukkoliikenne | suuri arvioitu siirtyjäpotentiaali; korkea autoilupaine; hyvä joukkoliikenteen palvelutaso; hyvä pysäkki- tai asemasaavutettavuus |
|      3 |     00520 | Itä- ja Keski-Pasila          |                 091 |         91.5 |              1107.14  | liityntäpysäköinti + joukkoliikenne | suuri arvioitu siirtyjäpotentiaali; korkea autoilupaine; hyvä joukkoliikenteen palvelutaso; hyvä pysäkki- tai asemasaavutettavuus |
|      4 |     00410 | Malminkartano                 |                 091 |         91.3 |               973.294 | liityntäpysäköinti + joukkoliikenne | suuri arvioitu siirtyjäpotentiaali; korkea autoilupaine; hyvä joukkoliikenteen palvelutaso; hyvä pysäkki- tai asemasaavutettavuus |
|      5 |     00240 | Länsi-Pasila                  |                 091 |         91.3 |              1259.46  | liityntäpysäköinti + joukkoliikenne | suuri arvioitu siirtyjäpotentiaali; korkea autoilupaine; hyvä joukkoliikenteen palvelutaso; hyvä pysäkki- tai asemasaavutettavuus |
|      6 |     00550 | Vallila - Hermanni            |                 091 |         91.2 |              1081.35  | liityntäpysäköinti + joukkoliikenne | suuri arvioitu siirtyjäpotentiaali; korkea autoilupaine; hyvä joukkoliikenteen palvelutaso; hyvä pysäkki- tai asemasaavutettavuus |
|      7 |     00740 | Siltamäki                     |                 091 |         90.6 |               948.883 | liityntäpysäköinti + joukkoliikenne | suuri arvioitu siirtyjäpotentiaali; korkea autoilupaine; hyvä joukkoliikenteen palvelutaso; hyvä pysäkki- tai asemasaavutettavuus |
|      8 |     00320 | Etelä-Haaga                   |                 091 |         90.6 |              1350.86  | liityntäpysäköinti + joukkoliikenne | suuri arvioitu siirtyjäpotentiaali; korkea autoilupaine; hyvä joukkoliikenteen palvelutaso; hyvä pysäkki- tai asemasaavutettavuus |
|      9 |     00100 | Helsinki keskusta - Etu-Töölö |                 091 |         90.4 |              2268.19  | liityntäpysäköinti + joukkoliikenne | suuri arvioitu siirtyjäpotentiaali; korkea autoilupaine; hyvä joukkoliikenteen palvelutaso; hyvä pysäkki- tai asemasaavutettavuus |
|     10 |     00710 | Pihlajamäki - Viikinmäki      |                 091 |         90.4 |              1236.84  | liityntäpysäköinti + joukkoliikenne | suuri arvioitu siirtyjäpotentiaali; korkea autoilupaine; hyvä joukkoliikenteen palvelutaso; hyvä pysäkki- tai asemasaavutettavuus |

## Tulkinta sovelluksessa

- `jspi_score`: mitä suurempi, sitä kiinnostavampi alue kampanjointiin.
- `estimated_switchers`: arvio henkilömäärästä, jolle joukkoliikenteeseen siirtyminen voisi olla realistinen viesti.
- `recommended_campaign_type`: suositeltu kampanjatapa.
- `message_angle`: ehdotettu viestikulma.
- `data_confidence_level`: matala/keskitaso/korkea sen mukaan, kuinka monesta lähteestä alueella on tietoa.

## Huomioita

- Tarkka avoin asuinalue-työpaikka-alue-kulkutapa-OD-matriisi ei ole käytössä, joten osa muuttujista on mallinnettu.
- Jos Digitransit-OD-dataa ei ole kaikille alueille, malli täydentää kilpailukykyä palvelutason ja saavutettavuuden perusteella.
- Tämä korjattu versio viimeistelee aiemmassa ajossa syntyneet välitaulut eikä hae uutta raakadataa.

---

## Päivitys v2: analyysinäkymät ja korjattu luottamus

Päivitetty: 2026-05-20T15:09:25.017889+00:00

Datasettiin on lisätty kaksi analyysinäkymää:

| Näkymä | Käyttö |
|---|---|
| `national_absolute_potential` | Suurin henkilömääräinen vaihtopotentiaali. |
| `underused_transit_potential` | Hyvä joukkoliikennetarjonta, mutta suhteessa korkea autoilupaine. |

Päätiedostossa `app_inputs/jspi_area_scores.parquet` on nyt mukana esimerkiksi:

- `national_absolute_potential_score`
- `national_absolute_potential_rank`
- `underused_transit_potential_score`
- `underused_transit_potential_rank`
- `jspi_score_original`
- `jspi_score_v2`
- `primary_analysis_view`
- `commuting_data_source`
- `confidence_missing_reasons`

`data_confidence_level` on laskettu uudelleen niin, että StatFin-pendelöinnin puuttuminen laskee luottamusta. LIIPI:n vaikutusta kampanjatyypin valintaan on pienennetty.

Lisädokumentaatio: `docs/VIEW_DEFINITIONS.md`.
