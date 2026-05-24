# Vercel-julkaisu

Tämä kansio on puhdas Vercel-paketti sovellukselle **Vaihtopotentiaali Tutka**.

Mukaan on otettu vain:

- React + TypeScript -sovelluksen lähdekoodi kansiosta `src/`
- staattinen data kansiosta `public/data/`
- Vite-, Tailwind- ja TypeScript-konfiguraatiot
- `package.json` ja `package-lock.json`
- README ja tekninen dokumentaatio
- `vercel.json`, jossa määritellään build-komento ja output-kansio

Mukaan ei ole otettu vanhoja ANS-, lento-, freight-, backend-, preview- tai Snake-tiedostoja.

## Vercelin asetukset

Vercelin pitäisi tunnistaa projekti Vite-sovellukseksi automaattisesti. Jos asetukset pitää antaa käsin:

```text
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
```

## Julkaisu GitHubin kautta

1. Tee tästä kansiosta oma GitHub-repositorio.
2. Pushaa kansion sisältö repositorioon.
3. Valitse Vercelissä "Add New Project".
4. Importoi GitHub-repositorio.
5. Tarkista, että build-komento on `npm run build` ja output-kansio `dist`.
6. Deploy.

## Julkaisu Vercel CLI:llä

Suorita komennot tämän kansion sisällä:

```bash
npm ci
npm run build
vercel
vercel --prod
```

## Paikallinen tarkistus

```bash
npm ci
npm run dev
```

Paikallinen osoite on yleensä:

```text
http://localhost:5173
```

## Huomio datasta

Sovellus ei käytä backendia eikä hae uutta liikennedataa API:eista. Kaikki sovelluksen tarvitsema data on mukana staattisina tiedostoina kansiossa `public/data/`.
