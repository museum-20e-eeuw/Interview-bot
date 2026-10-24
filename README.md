# Interview-bot

Informatiezuil voor het museum: een stem stelt bezoekers een paar korte vragen, de bezoeker antwoordt gesproken of getypt, en Gemini maakt er een categorisatie en korte samenvatting van.

## Hoe het werkt

1. De bezoeker drukt op "Start Gesprek". Een stem (Colette in Edge, Google Nederlands in Chrome) spreekt een willekeurige welkomstzin uit.
2. De vragen uit `vragen.txt` worden één voor één voorgelezen. De bezoeker antwoordt met de microfoon (stopt automatisch na ongeveer 2 seconden stilte) of typt het antwoord.
3. Na de laatste vraag analyseert Gemini het gesprek en toont het scherm een korte samenvatting.
4. Na 10 seconden gaat de zuil automatisch terug naar het startscherm. Dit kan ook met "Nieuwe Bezoeker".

Elk gesprek met de analyse wordt toegevoegd aan `resultaten.json`.

## Bestanden

| Bestand | Doel |
| --- | --- |
| `app.py` | FastAPI-server: pagina, vragen en analyse met Gemini |
| `index.html` | Kioskscherm met spraakherkenning en spraaksynthese |
| `vragen.txt` | De vragen, één per regel (regels met `#` worden genegeerd) |
| `resultaten.json` | Opgeslagen gesprekken en analyses (wordt automatisch aangemaakt) |
| `.env` | Bevat `GEMINI_API_KEY` |

## Installeren en starten

```powershell
pip install fastapi uvicorn pydantic google-genai python-dotenv
```

Zet je API-sleutel in `.env`:

```
GEMINI_API_KEY=jouw_sleutel
```

Start de server en open http://127.0.0.1:8000 in Edge of Chrome:

```powershell
python app.py
```

## Analyse

Gemini categoriseert elk gesprek met deze velden (`BezoekerAnalyse` in `app.py`):

- `eerste_bezoek`: ja of nee
- `doel_bezoek_categorie`: Informatie, Aankoop, Service & Klacht, Rondkijken of Anders
- `alles_gevonden`: Ja, Deels, Nee of Onbekend
- `samenvatting`: één korte zin, die op het scherm wordt getoond

Er worden meerdere modellen geprobeerd (`BESCHIKBARE_MODELLEN`). Als een model weigert, schakelt de server direct door naar het volgende.

## Aanpassen

- **Vragen:** pas `vragen.txt` aan, een herstart is niet nodig.
- **Welkomstzinnen:** `INTRO_TEKSTEN` in `index.html`.
- **Stem:** `VOORKEURSSTEMMEN` in `index.html`.
- **Tijd tot terug naar het startscherm:** `TERUG_NA_MS` in `index.html`.

## Let op

- Spraakherkenning werkt alleen in Chrome en Edge en vraagt eenmalig toestemming voor de microfoon.
- De beschikbare stemmen hangen af van de browser en het besturingssysteem. Colette is een Edge-stem.
- `resultaten.json` bevat de antwoorden van bezoekers. Houd het bestand buiten publieke repositories.

