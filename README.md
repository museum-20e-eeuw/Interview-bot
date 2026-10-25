# Interview-bot

Informatiezuil en web-app voor het museum: een stem stelt bezoekers een paar korte vragen, de bezoeker antwoordt gesproken, en Gemini maakt er een categorisatie en korte samenvatting van.

## Modus instellen (`config.json`)

In `config.json` kies je tussen `"zuil"` en `"web"`:

```json
{
  "mode": "web"
}
```

- **`"zuil"`**: Geschikt voor een fysieke informatiezuil.
  - `python app.py` start Microsoft Edge automatisch schermvullend in kioskmodus.
  - In idle-modus spreekt de zuil elke 25 seconden een uitnodiging uit.
  - Na afloop van een gesprek keert het scherm na 6 seconden automatisch terug naar het startscherm voor de volgende bezoeker.
- **`"web"`**: Geschikt voor webhosting (zoals Netlify) en gebruik op mobiele telefoons.
  - Het scherm schaalt op smartphones schermvullend en toont op grotere schermen (desktop/laptop) een mobiele telefoon-weergave.
  - Geen automatische Edge-kiosk opstart, geen ongevraagde hardop uitgesproken lokroep in idle-modus, en geen automatische reset na 6 seconden.

## Hoe het werkt

1. In idle-modus (alleen bij `"zuil"`) spreekt de zuil afwisselende uitnodigingen uit, gevolgd door de instructie om op de oranje knop te drukken. De bezoeker drukt op "Start Gesprek"; een stem (Fenna in Edge) spreekt daarna een willekeurige welkomstzin uit.
2. De vragen uit `vragen.txt` worden één voor één voorgelezen. Na ieder antwoord volgt een kort, afwisselend bedankje (in dezelfde uiting als de volgende vraag, om haperen te voorkomen). Tijdens inspreken toont het scherm alleen de vraag, het herkende antwoord en een analoge volumemeter (die op de plek van het icoon staat).
3. Twee soorten speciale regels in `vragen.txt`:
   - `Optional: "key:horeca" ...` en `Optional: "key:Expositie" ...` worden direct gesteld nadat een antwoord (op welke vraag dan ook) horeca of een expositie noemt, ieder maximaal één keer.
   - `General: ...` is de algemene vraag (bijvoorbeeld om suggesties). Die wordt na de gewone vragen alleen gesteld als in geen enkel eerder antwoord horeca of een expositie is genoemd. Noemt het antwoord op de algemene vraag zelf horeca of een expositie, dan volgt alsnog de bijbehorende optionele vraag.
4. Na de laatste (eventuele optionele) vraag analyseert Gemini het gesprek en toont het scherm een korte samenvatting.
5. In `"zuil"`-modus gaat de zuil na 6 seconden automatisch terug naar het idle-startscherm (of via "Nieuwe Bezoeker"). In `"web"`-modus blijft de samenvatting staan tot op "Opnieuw starten" wordt getikt.

Bij lokaal draaien via `app.py` wordt elk gesprek met de analyse toegevoegd aan `resultaten.json`.

## Bestanden

| Bestand | Doel |
| --- | --- |
| `config.json` | Instelling voor `"mode": "zuil"` of `"mode": "web"` |
| `app.py` | Lokale FastAPI-server: pagina, vragen en analyse met Gemini |
| `index.html` | Kiosk- en mobiel scherm met spraakherkenning en spraaksynthese |
| `netlify.toml` | Configuratie voor hosting en redirects op Netlify |
| `netlify/functions/` | Serverless functies (`vragen.mjs` en `analyse.mjs`) voor Netlify |
| `static/` | Statische bestanden, waaronder het icoon dat in idle-modus animeert |
| `vragen.txt` | De vragen, één per regel (regels met `#` worden genegeerd) |
| `resultaten.json` | Opgeslagen gesprekken en analyses (wordt lokaal automatisch aangemaakt) |
| `.env` | Bevat `GEMINI_API_KEY` voor lokaal gebruik |

## Lokaal installeren en starten

```powershell
pip install fastapi uvicorn pydantic google-genai python-dotenv
```

Zet je API-sleutel in `.env`:

```
GEMINI_API_KEY=jouw_sleutel
```

Start de server:

```powershell
python app.py
```

## Hosten op Netlify

1. Zet in `config.json` de modus op `"web"`.
2. Koppel de Git-repository aan een nieuw project op [Netlify](https://app.netlify.com/) (of deploy via Netlify CLI). `netlify.toml` stelt automatisch de root in als publish-directory en gebruikt `netlify/functions` voor `/api/vragen` en `/api/analyse`.
3. Voeg in Netlify onder **Site configuration → Environment variables** de variabele `GEMINI_API_KEY` toe met je Gemini API-sleutel.

## Analyse

Gemini categoriseert elk gesprek met deze velden (`BezoekerAnalyse` in `app.py` en `netlify/functions/analyse.mjs`):

- `eerste_bezoek`: ja of nee
- `doel_bezoek_categorie`: Informatie, Aankoop, Service & Klacht, Rondkijken of Anders
- `alles_gevonden`: Ja, Deels, Nee of Onbekend
- `samenvatting`: één korte zin, die op het scherm wordt getoond

Er worden meerdere modellen geprobeerd (`BESCHIKBARE_MODELLEN`). Als een model weigert, schakelt de server direct door naar het volgende.

## Aanpassen

- **Modus (zuil of web):** pas `config.json` aan (`"zuil"` of `"web"`).
- **Vragen:** pas `vragen.txt` aan, een herstart is niet nodig.
- **Welkomstzinnen:** `INTRO_TEKSTEN` in `index.html`.
- **Idle-uitnodigingen en bedankjes:** `IDLE_TOESPRAKEN` en `BEDANK_TEKSTEN` in `index.html`.
- **Idle-icoon:** vervang `static/museum.ico` om een ander icoon te tonen.
- **Stem:** `VOORKEURSSTEMMEN` in `index.html`. Standaard staat de vrouwelijke Edge-stem "Fenna" vooraan, daarna Colette. Dat zijn online stemmen en hebben dus internet nodig; zonder internet valt de zuil terug op de lokale Windows-stem "Microsoft Frank".
- **Tijd tot terug naar het startscherm:** `SAMENVATTING_WEERGAVE_MS` in `index.html`.

## Let op

- Spraakherkenning werkt in Edge, Chrome en Safari (iOS) en vraagt toestemming voor de microfoon.
- De beschikbare stemmen hangen af van de browser en het besturingssysteem. Fenna en Colette zijn Edge-stemmen.
- `resultaten.json` bevat de antwoorden van bezoekers. Houd het bestand buiten publieke repositories.
