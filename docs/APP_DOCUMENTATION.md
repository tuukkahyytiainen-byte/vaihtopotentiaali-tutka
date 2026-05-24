# Vaihtopotentiaali Tutka - tekninen ja toiminnallinen dokumentaatio

Paivitetty: 2026-05-24

Tama dokumentti kuvaa, miten Vaihtopotentiaali Tutka on rakennettu, mita dataa se kayttaa, miten kayttoliittyma toimii ja miten sovellusta kannattaa yllapitaa. Dokumentti on tarkoitettu seka kehittajalle etta henkilolle, joka haluaa ymmartaa, mita sovellus nayttaa paatoksenteon tueksi.

## 1. Sovelluksen tarkoitus

Vaihtopotentiaali Tutka auttaa tunnistamaan Suomen postinumeroalueita, joissa joukkoliikennekampanjalla voisi olla suurin vaikutus henkilautolla liikkuviin ihmisiin.

Sovellus vastaa kolmeen kayttajakysymykseen:

1. Missa kannattaa kampanjoida?
2. Miksi juuri siella?
3. Millainen viesti tai kampanjatyyppi voisi toimia?

Kayttoliittyma on rakennettu niin, etta peruskayttaja nakee ensin selkokielisen vastauksen. Tekniset kentat, datan luotettavuus ja raakadata ovat erillisessa tarkemmat tiedot -osiossa.

## 2. Nykyinen toteutus lyhyesti

Sovellus on staattinen React + TypeScript -frontend. Se ei tarvitse backendia normaalissa kaytossa.

Paapiirteet:

- React + TypeScript
- Vite-kehitysymparisto
- Tailwind CSS
- Leaflet + React-Leaflet
- OpenStreetMap-karttapohja
- staattinen CSV/JSON-data kansiossa `public/data`
- ei Mapboxia
- ei maksullisia karttapalveluita
- ei ajonaikaisia liikennedata-API-kutsuja

Sovellus lataa datan selaimessa, yhdistaa tiedostot client-puolella ja muodostaa kartan, rankingin, valitun alueen perustelut ja syvadatan samasta `AreaRecord`-rakenteesta.

## 3. Kaynnistys

Asenna riippuvuudet:

```bash
npm install
```

Kaynnista kehityspalvelin:

```bash
npm run dev
```

Vite avaa sovelluksen oletuksena osoitteeseen:

```text
http://localhost:5173/
```

Tassa tyoymparistossa kaytetty osoite on usein:

```text
http://127.0.0.1:5173/
```

Tuotantobuild:

```bash
npm run build
```

Build tarkistaa ensin TypeScriptin komennolla `tsc -b` ja rakentaa sen jalkeen Viten tuotantopaketin kansioon `dist`.

## 4. Jos sovellus ei kaynnisty

Yleisin syy on, etta Viten dev-palvelin ei ole kaynnissa. Selain voi silti osoittaa osoitteeseen `http://127.0.0.1:5173/`, mutta jos taustalla ei ole prosessia, selain nayttaa yhteysvirheen.

Tarkista seuraavat:

1. Olet projektin juuressa: `C:\Users\tuukk\OneDrive\Tiedostot\New project`
2. Riippuvuudet ovat asennettu: `node_modules` on olemassa.
3. Kaynnista palvelin: `npm run dev -- --host 127.0.0.1`
4. Avaa selainosoite: `http://127.0.0.1:5173/`

Jos portti on jo kaytossa, Vite voi ehdottaa toista porttia. Talla hetkella sovellus on suunniteltu kaytettavaksi portissa 5173, mutta se toimii myos muulla Viten antamalla portilla, kun avaat oikean URL:n.

Jos PowerShell ei loyda Nodea tai npm:aa, tassa ymparistossa toimiva tapa on kayttaa suoraa npm-polkua:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run dev -- --host 127.0.0.1
```

## 5. Projektin rakenne

Keskeiset tiedostot:

```text
src/
  App.tsx
  main.tsx
  styles.css
  types.ts
  lib/
    colors.ts
    data.ts
    explanations.ts
    filters.ts
    format.ts
    labels.ts
  components/
    AreaDrilldown.tsx
    AreaSummary.tsx
    ConfidenceBadge.tsx
    ControlPanel.tsx
    Header.tsx
    HelpBox.tsx
    KpiStrip.tsx
    Layout.tsx
    MapLegend.tsx
    MapPanel.tsx
    RankingList.tsx
    RawFieldsTable.tsx
    ScoreBars.tsx
public/data/
  area_base.csv
  area_polygons_preview.json
  campaign_hotspots.csv
  data_dictionary.csv
  jspi_area_scores.csv
  model_config.json
  municipalities_2026.json
  national_absolute_potential.csv
  README_FOR_CODEX.md
  underused_transit_potential.csv
  VIEW_DEFINITIONS.md
scripts/
  prepareData.js
  prepareData.ps1
  servePreview.ps1
```

## 6. Tarkeimmat koodivastuut

`src/App.tsx`

- pitaa ylatason sovellustilan
- lataa datan `loadAreaData`-funktiolla
- hallitsee valittua analyysinakymaa
- hallitsee suodattimia
- hallitsee valittua aluetta
- valittaa datan kartalle, rankingille ja aluekortille
- erottaa valitun alueen ja kartan aktiivisen zoom-kohteen, jotta aloitusnakyma voi olla Etela-Suomi eika yksittainen postialue

`src/lib/data.ts`

- lataa CSV- ja JSON-tiedostot
- parseaa numerot turvallisesti
- sailyttaa `area_id`, `postal_code` ja `municipality_code` merkkijonoina
- yhdistaa paatiedoston, hotspotit, nakymat, kuntanimet ja polygonit
- muodostaa `AreaRecord`-oliot
- laskee sovelluksen sisaisen kuntakokoluokituksen pohjaksi `municipality_population_total`

`src/lib/filters.ts`

- toteuttaa hakutekstin
- rajaa hotspotit
- rajaa isot/pienet kunnat
- rajaa kampanjatyypin
- jarjestaa alueet valitun paamittarin mukaan
- laskee KPI-yhteenvedot

`src/lib/labels.ts`

- kaantaa tekniset mittarit kayttajalle ymmarrettaviksi nimiksi
- sisaltaa kolmen paanakyma valintakorttien tekstit
- sisaltaa mittareiden selkokieliset selitykset

`src/lib/format.ts`

- muotoilee luvut, prosentit, etaisyydet, pinta-alat ja pisteet
- palauttaa puuttuvalle arvolle tekstin `Ei tietoa`
- sailyttaa postinumeroiden etunollat `normalizeCode`-funktion avulla

`src/lib/explanations.ts`

- muuntaa teknisia perusteluita selkokielelle
- kaantaa puuttuvien datalähteiden syita
- rakentaa peruskayttajalle luettavat "Miksi tama alue?" ja "Mita talla voisi tehda?" -tekstit

`src/components/MapPanel.tsx`

- renderoi Leaflet-kartan
- piirtaa postinumeroalueet polygonipintoina
- piirtaa kuntien valiset rajat kevyena viivakerroksena
- nayttaa postinumeroalueiden nimet lahella zoomatessa
- nayttaa kuntien nimet keskizoomissa
- piilottaa nimilaput, jos kayttaja ottaa ne pois paalta
- keskittaa kartan valittuun alueeseen vasta kayttajan valinnan jalkeen

`src/components/AreaSummary.tsx`

- nayttaa valitun alueen perusselityksen
- nayttaa paapisteen, arvioidut vaihtajat, kampanjatyypin, viestiehdotuksen, pinta-alan ja tekijapalkit
- ei nayta datan luotettavuutta perusnakymaan, koska se on siirretty syvadatan puolelle

`src/components/AreaDrilldown.tsx`

- nayttaa syvadatan
- sisaltaa valilehdet pisteiden laskentaan, liikenteeseen ja joukkoliikenteeseen, vaestoon ja potentiaaliin, datan luotettavuuteen ja raakakenttiin

`src/components/RankingList.tsx`

- nayttaa top 10 -rankinglistan
- antaa vaihtaa top 50 -nakymaan
- klikkaus valitsee alueen ja keskittaa kartan

## 7. Data-aineiston koko

Nykyinen `public/data`-aineisto sisaltaa:

| Asia | Maara |
|---|---:|
| Postinumeroalueita paatiedostossa | 3018 |
| Postinumeroalueiden polygonit | 3018 |
| Hotspot-riveja | 214 |
| National absolute potential -riveja | 3018 |
| Underused transit potential -riveja | 3018 |
| Datasanakirjan riveja | 269 |
| Kuntanimia lookupissa | 308 |

Kaikilla paatiedoston alueilla `data_confidence_level` on nykyisessa aineistossa `keskitaso`. Taman vuoksi perusnakymaan ei ole jatetty erillista luotettavuussuodatinta.

## 8. Data-tiedostot ja niiden roolit

### `jspi_area_scores.csv`

Paatiedosto. Sovellus rakentaa suurimman osan aluekortista ja rankingista taman tiedoston pohjalta.

Tarkeita kenttia:

- `area_id`
- `postal_code`
- `area_name`
- `municipality_code`
- `lat`
- `lon`
- `jspi_score`
- `estimated_switchers`
- `recommended_campaign_type`
- `recommendation_reason`
- `message_angle`
- `data_confidence_level`
- `data_confidence_score`

### `area_base.csv`

Taydentaa aluetietoja. Sovellus kayttaa tasta erityisesti:

- `area_m2`
- `area_km2`

Geometriaa ei lueta tasta suoraan, koska kartalle on erillinen kevennetty polygonitiedosto.

### `area_polygons_preview.json`

Kevennetty polygonitiedosto karttakayttoon.

Muoto:

```json
[
  {
    "a": "00100",
    "r": [
      [[60.16518, 24.939463], ...]
    ]
  }
]
```

Sovellus liittaa polygonit alueisiin `area_id` / `postal_code`-tunnisteen kautta. Kartalla postinumeroalueet naytetaan todellisina aluepintoina.

### `campaign_hotspots.csv`

Sisaltaa kampanjoinnin kannalta valmiiksi korostettuja top-alueita.

Kaytetaan erityisesti kenttiin:

- `isHotspot`
- `hotspot_rank`
- `hotspot_source_view`
- `priority`
- `campaign_lat`
- `campaign_lon`
- `campaign_point_type`

Kayttaja voi rajata kartan vain naihin kohteisiin valinnalla `Nayta vain parhaat kampanja-alueet`.

### `national_absolute_potential.csv`

Sisaltaa nakyman, joka korostaa henkilomaaraista potentiaalia.

Tarkein kentta:

- `national_absolute_potential_score`

Kayttajalle tama nakyy nimella `Mahdolliset vaihtajat`.

### `underused_transit_potential.csv`

Sisaltaa nakyman, joka etsii alueita, joilla joukkoliikenne on suhteellisen hyvaa, mutta autoilun paine on korkea.

Tarkein kentta:

- `underused_transit_potential_score`

Kayttajalle tama nakyy nimella `Alikaytetty joukkoliikenne`.

### `area_features.csv`

Laajempi yhdistetty muuttujataulu. Jos tiedosto on mukana, sovellus yhdistaa sen raakakenttiin ja tekniseen tarkasteluun.

Esimerkkeja sisallosta:

- vaesto ja kotitaloudet
- tyolliset asukkaat
- ajoneuvokanta
- liikennemaarat
- pysakkietaisyydet
- raideliikenne-etaisyydet
- joukkoliikenteen palvelutasomuuttujat
- saavutettavuuspisteet

### `municipalities_2026.json`

Staattinen lookup kuntakoodista kunnan nimeksi.

Sovellus kayttaa tata, jotta kayttajalle ei nayteta pelkkaa kuntanumeroa kuten `091`, vaan nimi kuten `Helsinki`.

### `model_config.json`

Kuvaa mallin painot ja oletukset.

Nykyiset paapainot:

| Tekija | Paino |
|---|---:|
| `potential_persons_score` | 40 % |
| `underuse_score` | 25 % |
| `car_pressure_score` | 20 % |
| `emission_congestion_score` | 10 % |
| `ad_feasibility_score` | 5 % |

Tiedostossa on myos luottamuspisteytyksen painot ja tieto siita, etta v2-versiossa pendelointidatan puuttuminen laskee luottamusta.

### `data_dictionary.csv`

Datasanakirja. Sisaltaa sarakkeiden nimet, datatyypit, non-null-maarat ja esimerkkiarvoja.

Sovellus ei nayta koko sanakirjaa perusnakymaan, mutta se toimii kehittajan ja asiantuntijan dokumentaationa.

### `VIEW_DEFINITIONS.md`

Kuvaa datasetin analyysinakymat:

- `national_absolute_potential`
- `underused_transit_potential`

### `README_FOR_CODEX.md`

Alkuperainen datasetin yhteenveto ja JSPI-mallin kuvaus.

## 9. Kayttajalle naytettavat paanakyma

Vasemmassa paneelissa on kolme paavalintaa.

### Paras kokonaispotentiaali

Tekninen jarjestyskentta:

```text
jspi_score
```

Kayttajalle:

```text
Kokonaispotentiaali
```

Tarkoitus:

Kayta, kun halutaan kokonaiskuva parhaista kampanja-alueista. Tama yhdistaa alueen koon, autoilun paineen, joukkoliikenteen tarjonnan ja kampanjan toteutettavuuden.

### Eniten mahdollisia vaihtajia

Tekninen jarjestyskentta:

```text
national_absolute_potential_score
```

Kayttajalle:

```text
Mahdolliset vaihtajat
```

Tarkoitus:

Kayta, kun halutaan loytaa alueet, joissa kampanjalla voisi tavoittaa eniten ihmisia.

### Hyva joukkoliikenne, mutta paljon autoilua

Tekninen jarjestyskentta:

```text
underused_transit_potential_score
```

Kayttajalle:

```text
Alikaytetty joukkoliikenne
```

Tarkoitus:

Kayta, kun halutaan loytaa alueita, joissa joukkoliikennetta on tarjolla, mutta autoilun paine nayttaa suurelta.

## 10. Kenttien selkokieliset nimet

| Tekninen kentta | Kayttajalle |
|---|---|
| `jspi_score` | Kokonaispotentiaali |
| `national_absolute_potential_score` | Mahdolliset vaihtajat |
| `underused_transit_potential_score` | Alikaytetty joukkoliikenne |
| `estimated_switchers` | Arvio vaihtajista |
| `car_pressure_score` | Autoilun paine |
| `public_transport_service_score` | Joukkoliikenteen tarjonta |
| `accessibility_score` | Pysakkien ja asemien laheisyys |
| `travel_time_competitiveness_score_final` | Matka-ajan kilpailukyky |
| `data_confidence_score` | Datan luotettavuus |

Kayttoliittyman paakielessa valtetaan teknisia termeja kuten `JSPI`, `proxy`, `fallback`, `normalisointi` ja `score`.

## 11. Suodattimet

Vasemman paneelin suodattimet:

| Suodatin | Vaikutus |
|---|---|
| Hakukentta | Hakee alueen nimesta, postinumerosta, alue-id:sta, kunnan nimesta tai kuntakoodista |
| Parhaat alueet: Kaikki | Nayttaa kaikki alueet |
| Parhaat alueet: Isot kunnat | Nayttaa kunnat, joiden sovelluksen aineistosta laskettu vaesto on vahintaan 50 000 |
| Parhaat alueet: Pienet kunnat | Nayttaa kunnat, joiden sovelluksen aineistosta laskettu vaesto on alle 50 000 |
| Nayta vain parhaat kampanja-alueet | Nayttaa vain hotspotiksi merkityt alueet |
| Nayta kuntien ja postinumeroiden nimet | Nayttaa tai piilottaa kartan nimilaput |
| Kampanjatyyppi | Rajaa valittuun kampanjatyyppiin |
| Nollaa valinnat | Palauttaa oletusrajaukset |

Kuntakoon raja on 50 000 asukasta. Tama lasketaan sovelluksen nykyisesta alueaineistosta summaten postinumeroalueiden `population_final` kunnittain.

## 12. Kampanjatyypit

Nykyisessa aineistossa on seuraavat kampanjatyypit:

- asema- ja junakampanja
- bussikaytava- ja pysakkikampanja
- kevyt alueellinen joukkoliikenneviesti
- laaja digitaalinen aluekampanja
- liityntapysakointi + joukkoliikenne
- paatien liittyma + digitaalinen geomainonta

Sovellus lukee kampanjatyypit datasta, joten dropdown paivittyy automaattisesti, jos aineistoon tulee uusia tyyppeja.

## 13. Kartta

Kartta on toteutettu Leafletilla ja React-Leafletilla.

Karttapohja:

```text
OpenStreetMap
```

Kartalla naytetaan:

- postinumeroalueet polygonipintoina
- valitun nakyman mukainen varitys
- hotspot-alueiden korostus
- kuntien valiset rajat
- kuntien nimet keskizoomissa
- postinumeroalueiden nimet lahella zoomatessa
- KPI-nauha kartan ylaosassa
- karttalegenda
- valitun nakyman lyhyt tulkintalaatikko

### Aloitusnakyma

Kartta avautuu Etela-Suomen yleisnakymaan:

```ts
center = [61.35, 25.2]
zoom = 6
```

Oikea paneeli voi silti nayttaa valitun top-alueen heti. Kartta ei kuitenkaan zoomaa siihen automaattisesti aloituksessa. Kartta keskittaa yksittaiseen alueeseen vasta, kun kayttaja valitsee alueen kartalta tai ranking-listasta.

### Postinumeroalueiden pinta-alat

Alueet piirretaan `area_polygons_preview.json`-tiedoston polygonirenkaista. Jokainen `AreaRecord` saa kentan:

```ts
polygon_rings: [number, number][][]
```

Jos alueella ei ole polygonia, kartta voi pudota piste-esitykseen.

### Kuntarajat

Sovellus ei lataa erillista kuntaraja-API:a. Kuntarajakerros johdetaan olemassa olevista postinumeroalueiden polygonirajoista.

Periaate:

1. Jokaisen polygonirenkaan vierekkainen pistepari muutetaan viivasegmentiksi.
2. Segmentit normalisoidaan koordinaattiavaimiksi.
3. Jos sama segmentti esiintyy kahden eri kunnan alueella, se tulkitaan kuntien valiseksi rajaksi.
4. Vain kuntien valiset rajat piirretaan erillisena `Polyline`-kerroksena.

Talla valtytaan piirtamasta jokaista postinumeroalueiden sisarajaa kuntarajana.

### Nimilaput

Nimilappujen logiikka:

| Zoom | Nimet |
|---:|---|
| alle 7 | ei kuntien tai postinumeroiden nimia |
| 7-9 | kuntien nimet |
| 10 tai enemman | postinumeroalueiden nimet |

Lisaksi kayttaja voi piilottaa kaikki nimilaput vasemman paneelin valinnalla.

Nimilappujen maaria rajoitetaan suorituskyvyn vuoksi:

- kuntien nimia enintaan 80 kerrallaan
- postinumeroalueiden nimia enintaan 120 kerrallaan

## 14. Varitys

Karttapisteiden ja polygonien vari perustuu valittuun paamittariin.

Periaate:

- matala = vaalea sininen
- keskitaso = oranssi
- korkea = punainen/purppura

Varit maaritetaan `src/lib/colors.ts`-tiedostossa.

## 15. KPI-kortit

Kartan ylaosassa naytetaan kolme KPI-arvoa:

- Nakyvissa olevat alueet
- Arvio vaihtajista yhteensa
- Korkein potentiaali

Namat lasketaan suodatetusta ja valitun nakyman mukaan jarjestetysta aluejoukosta.

## 16. Oikean paneelin perusnakyma

Kun alue on valittu, oikea paneeli nayttaa:

- alueen nimi
- postinumero
- kunta
- valitun nakyman paapiste
- arvio vaihtajista
- postinumeroalueen pinta-ala
- suositeltu kampanja
- viestiehdotus
- "Miksi tama alue?" -kortti
- "Mita talla voisi tehda?" -kortti
- paatekijat vaakapalkkeina
- painike tarkempiin tietoihin

Datan luotettavuus ei ole perusnakymaan jatkuvasti nakyva tieto. Se on siirretty tarkemmat tiedot -osioon, jotta perusnakyma pysyy rauhallisena.

## 17. Tekijapalkit

`ScoreBars` nayttaa seuraavat tekijat:

- Autoilun paine
- Joukkoliikenteen tarjonta
- Pysakkien ja asemien laheisyys
- Matka-ajan kilpailukyky
- Kokonaispotentiaali

Jokaisella palkilla on infoikoni ja tooltip-selitys.

## 18. Syvadata

Painike:

```text
Katso tarkemmat tiedot
```

Avaa `AreaDrilldown`-nakymaan.

Valilehdet:

1. Pisteiden laskenta
2. Liikenne ja joukkoliikenne
3. Vaesto ja potentiaali
4. Datan luotettavuus
5. Raakakentat

### Pisteiden laskenta

Nayttaa paatekijat korteissa ja tekniset kenttanimet pienella tekstilla.

Mukana esimerkiksi:

- `estimated_switchers`
- `car_pressure_score`
- `public_transport_service_score`
- `accessibility_score`
- `travel_time_competitiveness_score_final`
- `jspi_score`
- `national_absolute_potential_score`
- `underused_transit_potential_score`

### Liikenne ja joukkoliikenne

Nayttaa:

- autoilun paine
- joukkoliikenteen tarjonta
- lahimman pysakin etaisyys
- lahimman aseman etaisyys
- lahimman liityntapysakoinnin etaisyys
- matka-ajan kilpailukyky

Etäisyydet muotoillaan metreina alle 1000 m ja kilometreina yli 1000 m.

### Vaesto ja potentiaali

Nayttaa:

- vaesto
- tyolliset asukkaat
- arvio tyomatkalaisista
- arvio mahdollisista vaihtajista
- arvioitu auton kayttoosuus
- postinumeroalueen pinta-ala

Mukana on huomautus siita, etta mahdolliset vaihtajat on mallin arvio eika varma ennuste.

### Datan luotettavuus

Nayttaa:

- datan luotettavuustaso
- luotettavuuden numero
- tyomatkadatan lahde
- puuttuvat signaalit selkokielella

Tekniset puutekoodit kaannetaan esimerkiksi:

| Tekninen syy | Selkokielinen teksti |
|---|---|
| `statfin_commuting_missing` | Tarkka tyomatkaliikkumisen tieto puuttuu. |
| `od_sample_missing` | Tarkka matka-aikavertailu puuttuu. |
| `traffic_missing` | Kaikkia liikennemaaratietoja ei ole saatavilla. |
| `vehicle_missing` | Ajoneuvokantatieto puuttuu. |

### Raakakentat

Nayttaa kaikki valitun alueen kentat taulukkona.

Toiminnot:

- hakukentta raakakentille
- kopioi JSON -painike

Tama osio on tarkoitettu asiantuntijalle ja tekniseen tarkasteluun.

## 19. Ranking

Ranking-lista nayttaa oletuksena top 10 -alueet.

Painikkeella voi vaihtaa top 50 -nakymaan.

Yksi ranking-rivi sisaltaa:

- sijoitus
- alueen nimi
- postinumero
- kunnan nimi
- arvio vaihtajista
- valitun nakyman piste
- kampanjatyyppi
- hotspot-merkinta, jos alue kuuluu hotspot-aineistoon

Klikkaus valitsee alueen, paivittaa oikean paneelin ja keskittaa kartan.

## 20. Tilan hallinta

Sovellus pitaa tilan `App.tsx`-tasolla.

Tarkeimmat tilat:

```ts
areas
activeView
filters
selectedAreaId
mapFocusAreaId
detailsOpen
mobileTab
```

`selectedAreaId` tarkoittaa aluetta, jonka tiedot naytetaan oikealla paneelissa.

`mapFocusAreaId` tarkoittaa aluetta, johon kartta halutaan aktiivisesti keskittaa. Talla erotuksella aloitusnakyma voi olla Etela-Suomi, vaikka oikea paneeli nayttaa jo ensimmaisen parhaan alueen.

## 21. Tietojen yhdistaminen

Data yhdistetaan `loadAreaData`-funktiossa.

Yhdistysjarjestys:

1. Lue paatiedosto `jspi_area_scores.csv`.
2. Lue taydentavat taulut.
3. Tee lookupit `area_id`-kentalla.
4. Liita polygonit `area_polygons_preview.json`-tiedostosta.
5. Kaanna kuntakoodi kuntanimeksi `municipalities_2026.json`-tiedostolla.
6. Merkitse hotspotit.
7. Laske kuntien kokonaisvaesto sovelluksen alueaineistosta.
8. Palauta `DataBundle`.

Puuttuva sarake ei saa kaataa sovellusta. Numerot luetaan `parseNumber`-funktiolla, ja puuttuvat arvot naytetaan muodossa `Ei tietoa`.

## 22. Tarkeimmat datatyypit

`AreaRecord` on sovelluksen ydinrakenne.

Se sisaltaa muun muassa:

- tunnisteet
- nimet
- koordinaatit
- polygonit
- vaesto- ja potentiaalikentat
- joukkoliikenne- ja liikennekentat
- kampanjasuositukset
- luotettavuuskentat
- hotspot-tiedot
- alkuperaiset raakakentat

`Filters` sisaltaa:

```ts
{
  searchText: string;
  campaignType: string;
  onlyHotspots: boolean;
  municipalitySize: "all" | "large" | "small";
  showMapLabels: boolean;
}
```

## 23. Mallin tulkinta

JSPI eli joukkoliikenteen siirtopotentiaali-indeksi on paatoksenteon apuindeksi. Se ei ole virallinen ennuste siita, kuinka moni ihminen varmasti vaihtaa kulkutapaa.

Mallin paapainot ovat:

- 40 % mahdollisten vaihtajien henkilomaara
- 25 % joukkoliikenteen alikaytto suhteessa palvelutasoon
- 20 % autoilun paine
- 10 % paasto- ja ruuhkavaikutus
- 5 % mainonnan toteutettavuus

Tuloksia kannattaa tulkita vertailevana priorisointina:

- korkea piste = alue kannattaa nostaa tarkempaan tarkasteluun
- matala piste = kampanjapotentiaali on taman mallin perusteella heikompi
- keskitasoinen datan luotettavuus = osa signaaleista voi olla arvioitu tai puuttua

## 24. Rajoitteet

Sovelluksella on tarkoituksella rajattu tulkintarooli.

Tarkeimmat rajoitteet:

- Tulokset ovat suuntaa-antavia, eivat virallisia ennusteita.
- Kaikille alueille ei ole kaikkia tietolahteita.
- Matka-aikakilpailukyvyn tieto voi olla osittain arvioitu.
- Kuntarajat johdetaan postinumeroalueiden yhteisista polygonisegmenteista, ei erillisesta virallisesta kuntarajashapesta.
- Kuntien koko luokitellaan sovelluksen alueaineiston perusteella, ei erillisesta ajantasaisesta vaestorekisterista.
- Kartan OpenStreetMap-tiilet haetaan OpenStreetMapin julkisesta tile-palvelusta selaimessa.
- Sovellus ei tee ajonaikaisia liikennedata-API-kutsuja.

## 25. Suorituskyky

Suorituskykya on huomioitu seuraavasti:

- Kartta kayttaa kevennettya `area_polygons_preview.json`-geometriaa.
- Kartta kayttaa `preferCanvas`-asetusta Leafletissa.
- Nimilappuja naytetaan vain zoom-tason mukaan.
- Nimilappujen maara on rajattu.
- Kuntarajakerros piirtaa vain kuntien valiset yhteiset segmentit, ei kaikkia postialueiden sisarajoja.
- Paneelit skrollaavat sisaisesti, jotta koko sivun skrollaus ei ole normaalissa desktop-kaytossa tarpeen.

## 26. Muutosten tekeminen

Uuden datakentan lisaaminen:

1. Lisaa kentta `AreaRecord`-tyyppiin `src/types.ts`.
2. Lue kentta `parseArea`-funktiossa tai yhdista se `mergeNumeric` / `mergeText`-funktiolla.
3. Lisaa selkokielinen nimi tarvittaessa `src/lib/labels.ts`.
4. Muotoile arvo `src/lib/format.ts`-helperilla.
5. Nayta kentta sopivassa komponentissa.

Uuden suodattimen lisaaminen:

1. Lisaa kentta `Filters`-tyyppiin.
2. Lisaa oletusarvo `defaultFilters`-olioon `App.tsx`.
3. Lisaa UI `ControlPanel.tsx`-komponenttiin.
4. Toteuta vaikutus `applyFilters`-funktiossa, jos se muuttaa aluejoukkoa.
5. Jos se on vain kartan esitystapa, valita arvo suoraan `MapPanel`-komponentille.

Uuden analyysinakyman lisaaminen:

1. Lisaa uusi arvo `AnalysisView`-tyyppiin.
2. Lisaa konfiguraatio `VIEW_CONFIGS`-olioon.
3. Varmista, etta valittu `sortMetric` loytyy `AreaRecord`-tyypista.
4. Lisaa selkokielinen nimi ja selitys `metricLabels` ja `metricExplanations` -rakenteisiin.

## 27. Testaus ja tarkistuslista

Ennen luovutusta kannattaa ajaa:

```bash
npm run build
```

Kayttoliittymasta kannattaa tarkistaa:

- sovellus latautuu osoitteessa `http://127.0.0.1:5173/`
- kartta nakyy
- vasemman paneelin kolme paavalintaa toimivat
- haku toimii postinumerolla ja kunnan nimella
- isot/pienet kunnat -rajaus muuttaa aluejoukkoa
- nimilappujen naytto/piilotus toimii
- rankingin klikkaus vaihtaa valitun alueen
- kartta keskittaa valittuun alueeseen vasta kayttajan valinnan jalkeen
- oikea paneeli nayttaa alueen perustelut
- tarkemmat tiedot avautuvat
- raakakenttien haku ja JSON-kopiointi toimivat
- selainkonsolissa ei ole virheita

## 28. Sovelluksen paatavoite

Sovelluksen ei ole tarkoitus olla datatiedostojen selain. Sen tarkoitus on tiivistaa monesta aineistosta paatoksenteon apu:

```text
Tassa ovat kiinnostavimmat alueet joukkoliikennekampanjalle.
Tassa on syy.
Tassa on suositeltu tapa vaikuttaa.
Tassa ovat tekniset tiedot, jos haluat tarkistaa mallin taustan.
```
