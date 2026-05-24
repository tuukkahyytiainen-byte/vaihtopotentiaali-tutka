# Vaihtopotentiaali Tutka

Vaihtopotentiaali Tutka on React + TypeScript -dashboard, joka auttaa löytämään Suomen alueet, joissa joukkoliikennekampanjalla voi olla suurin vaikutus henkilöautolla liikkuviin ihmisiin.

Sovellus on staattinen frontend. Se lukee CSV- ja JSON-aineiston client-puolella kansiosta `public/data/` eikä hae uutta liikennedataa API:eista. Kartta käyttää Leafletia ja OpenStreetMap-karttapohjaa.

## Käynnistys

```bash
npm install
npm run dev
```

Vite käynnistyy oletuksena osoitteeseen:

```text
http://localhost:5173
```

Tuotantobuild:

```bash
npm run build
```

Laajempi tekninen ja toiminnallinen dokumentaatio on tiedostossa:

```text
docs/APP_DOCUMENTATION.md
```

## Käytetty data

Sovellus käyttää näitä tiedostoja kansiosta `public/data/`:

```text
jspi_area_scores.csv
area_base.csv
area_polygons_preview.json
campaign_hotspots.csv
national_absolute_potential.csv
underused_transit_potential.csv
municipalities_2026.json
model_config.json
data_dictionary.csv
VIEW_DEFINITIONS.md
README_FOR_CODEX.md
```

Tärkein tiedosto on `jspi_area_scores.csv`, joka sisältää alueen koordinaatit, pääpisteet, kampanjasuosituksen, viestiehdotuksen ja datan luotettavuuden. Kartta käyttää `area_polygons_preview.json`-tiedostoa, jotta postinumeroalueet näkyvät todellisina aluepintoina. Kuntakoodit näytetään käyttäjälle kuntien niminä `municipalities_2026.json`-lookupin avulla. `area_id`, `postal_code` ja `municipality_code` käsitellään merkkijonoina, jotta postinumeroiden etunollat säilyvät.

`municipalities_2026.json` perustuu Tilastokeskuksen Kunnat 2026 -luokitukseen. Se on mukana staattisena lookup-tiedostona, joten sovellus ei hae kuntanimiä ajonaikaisesti rajapinnasta.

## Näkymien tulkinta

**Paras kokonaispotentiaali**
Käytä tätä, kun haluat kokonaiskuvan parhaista kampanja-alueista. Se yhdistää väestön, autoilun, joukkoliikenteen ja kampanjan toteutettavuuden.

**Eniten mahdollisia vaihtajia**
Käytä tätä, kun haluat löytää alueet, joissa kampanjalla voisi tavoittaa eniten ihmisiä.

**Hyvä joukkoliikenne, mutta paljon autoilua**
Käytä tätä, kun haluat löytää alueet, joissa joukkoliikennettä voisi olla mahdollista saada parempaan käyttöön.

## Käyttöliittymä

Dashboardissa on neljä pääosaa:

- yläpalkki, jossa on lyhyt selitys työkalusta
- vasen ohjauspaneeli, jossa valitaan tavoite ja rajaukset
- keskellä Leaflet-kartta, jossa postinumeroalueet näkyvät aluepintoina
- oikea paneeli, jossa näkyvät valitun alueen selitys, ranking ja tarkemmat tiedot rinnakkain leveillä näytöillä

Perusnäkymä vastaa kysymyksiin: missä kannattaa kampanjoida, miksi juuri siellä, millainen viesti toimisi ja kuinka luotettava data on. Syvädata avautuu erillisellä painikkeella eikä häiritse peruskäyttöä.

Ohjauspaneelin “Parhaat alueet” -rajauksella voi tarkastella kaikkia kuntia, isoja kuntia tai pieniä kuntia. Iso kunta tarkoittaa tässä sovelluksen omasta alueväestöstä laskettua kuntaa, jossa on vähintään 50 000 asukasta.

## Datan epävarmuus

`data_confidence_level` näkyy jokaisessa alueessa. Tulkinta:

- Korkea = useimmat tärkeät tietolähteet ovat käytössä.
- Keskitaso = osa tiedoista on arvioitu tai puuttuu.
- Matala = tulosta pitää tulkita varovasti.

`estimated_switchers` on mallin arvio mahdollisista vaihtajista. Se ei tarkoita, että näin moni varmasti vaihtaisi kulkutapaa.
