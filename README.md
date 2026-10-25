# Interview-bot

Informatiezuil en mobiele web-app voor het museum: een stem stelt bezoekers een paar korte vragen, de bezoeker antwoordt gesproken, en Gemini maakt er een categorisatie en korte samenvatting van.

## Automatische modus (`zuil` of `mobiel`)

Bij het opstarten detecteert `index.html` automatisch op wat voor apparaat en scherm de app draait:

- **`zuil`** (groter scherm / desktop):
  - Geschikt voor een fysieke informatiezuil.
  - `python app.py` start Microsoft Edge automatisch schermvullend in kioskmodus.
  - In idle-modus spreekt de zuil elke 25 seconden een uitnodiging uit.
  - Na afloop van een gesprek keert het scherm na 6 seconden automatisch terug naar het startscherm voor de volgende bezoeker.
- **`mobiel`** (mobiele telefoon / klein scherm `<= 768px`):
  - Het scherm schaalt automatisch schermvullend voor smartphones.
  - Op het beginscherm verschijnt een melding dat het geluid van de telefoon aangezet moet worden (`🔊 Zet het geluid van uw telefoon aan voordat u start.`).
  - Geen automatische hardop uitgesproken lokroep in idle-modus, en geen automatische reset na 6 seconden.

## Hoe het werkt

1. In idle-modus (alleen bij `zuil`) spreekt de zuil afwisselende uitnodigingen uit, gevolgd door de instructie om op de oranje knop te drukken. De bezoeker drukt op "Start Gesprek"; een stem (Fenna in Edge) spreekt daarna een willekeurige welkomstzin uit.
2. De vragen uit `vragen.txt` worden één voor één voorgelezen. Na ieder antwoord volgt een kort, afwisselend bedankje (in dezelfde uiting als de volgende vraag, om haperen te voorkomen). Tijdens inspreken toont het scherm alleen de vraag, het herkende antwoord en een analoge volumemeter (die op de plek van het icoon staat).
3. Twee soorten speciale regels in `vragen.txt`:
   - `Optional: "key:horeca" ...` en `Optional: "key:Expositie" ...` worden direct gesteld nadat een antwoord (op welke vraag dan ook) horeca of een expositie noemt, ieder maximaal één keer.
   - `General: ...` is de algemene vraag (bijvoorbeeld om suggesties). Die wordt na de gewone vragen alleen gesteld als in geen enkel eerder antwoord horeca of een expositie is genoemd. Noemt het antwoord op de algemene vraag zelf horeca of een expositie, dan volgt alsnog de bijbehorende optionele vraag.
4. Na de laatste (eventuele optionele) vraag slaat de app het gesprek (inclusief datum, tijd en ongeanalyseerde tekst) en de Gemini-analyse op in `resultaten.json`.
5. In `zuil`-modus gaat de zuil na 6 seconden automatisch terug naar het idle-startscherm (of via "Nieuwe Bezoeker"). In `mobiel`-modus blijft het eindscherm staan tot op "Opnieuw starten" wordt getikt.

## Bestanden

| Bestand | Doel |
| --- | --- |
| `app.py` | Lokale FastAPI-server: pagina, vragen en analyse met Gemini |
| `index.html` | Kiosk- en mobiel scherm met spraakherkenning en spraaksynthese |
| `config.json` | Lokale configuratie voor API-sleutels (`GEMINI_API_KEY`, `GITHUB_TOKEN`, etc.) |
| `netlify.toml` | Configuratie voor hosting en redirects op Netlify |
| `netlify/functions/` | Serverless functies (`vragen.mjs` en `analyse.mjs`) voor Netlify |
| `static/` | Statische bestanden, waaronder het icoon dat in idle-modus animeert |
| `vragen.txt` | De vragen, één per regel (regels met `#` worden genegeerd) |
| `resultaten.json` | Opgeslagen gesprekken, ongeanalyseerde tekst en analyses |
| `.env` | Bevat `GEMINI_API_KEY` (fallback voor lokaal gebruik) |

## Lokaal installeren en starten

```powershell
pip install fastapi uvicorn pydantic google-genai python-dotenv
```

Zet je API-sleutel in `config.json` of `.env`:

```
GEMINI_API_KEY=jouw_sleutel
```

Start de server:

```powershell
python app.py
```

## Hosten op Netlify

1. Koppel de Git-repository aan een project op [Netlify](https://app.netlify.com/). `netlify.toml` stelt automatisch de root in als publish-directory en gebruikt `netlify/functions` voor `/api/vragen` en `/api/analyse`.
2. Voeg in Netlify onder **Site configuration → Environment variables** de variabelen `GEMINI_API_KEY` en `GITHUB_TOKEN` toe. Elk afgerond gesprek op Netlify wordt daarmee automatisch bijgeschreven in `resultaten.json` in de GitHub-repository.
