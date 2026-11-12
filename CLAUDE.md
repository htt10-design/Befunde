# Befunde

Offline-fähige Single-Page-PWA für Mess- und Befundblätter an Motoren (Laufbuchsen, Kurbelwelle, Nockenwelle,
Endoskopie, Düsen, Seriennummern, allgemeine Durchsicht). Design, Aufbau und Konventionen wie **Zettel-Job**
(Schwester-App, später verknüpft). Kein Server, kein Build-Schritt, keine Abhängigkeiten. UI-Sprache und Kommentare: Deutsch.

## Aufbau

| Datei | Inhalt |
|---|---|
| 01-core | `appData` (settings, orders, specs), IndexedDB `befunde` (Stores `store` + `files` für Fotos), `showView`, Theme, Modal, Toast |
| 02-helpers | `escapeHtml`, Datum, Zahlen mit Komma (`parseNum`/`formatNum`), µm-Schnelleingabe (`expandQuick`), `formatOrderNo` (wie Zettel-Job), Motorpositionen (`positions`: cyl/main/rod/cam), Bewertungen (`RATINGS` ok/obs/bad), UI-Bausteine (`field`, `ratingSeg` …) |
| 03-types | **Alle Blattarten in `SHEET_TYPES`** + Auswertung (`computeGrid/Points/Clearance`, `sheetAutoRating`) |
| 04-orders | Auftragsliste, Neuer Auftrag, Übernahme aus Zettel-Job (liest IndexedDB `zettel-job` nur lesend), Auftrag mit Motoren, Blatt hinzufügen (Modus mess/befund/beides, Pakete), `createSheet` |
| 05-editor | Blatt-Editor: `bindForm` (data-bind/data-set/data-tag, Event-Delegation), Messtabellen + `refreshMeasure`, Sichtbefund, Befunde & Fotos, Ergebnis, Blatt-Menü |
| 06-special | Endoskopie (SVG Draufsicht, KS links, A oben), Düsen, Seriennummern, Allgemeines Befundblatt |
| 07-photos | Fotos verkleinern → Store `files`, im Blatt nur IDs in `photos`-Arrays; `collectPhotoIds` |
| 08-signature | Unterschrift (aus Zettel-Job übernommen) |
| 09-print | Druck A4 im Stil der SDT-Papierblätter: `printHeadHtml` (Logo mittig, Titel unterstrichen, zweisprachige Kopftabelle Auftraggeber/Auftrags-Nr./Neubau-Nr./Klassifikation · Motorfabrikat/Motortyp/Motornr./Leistung), `printFootBlock` (Bemerkung/Empfehlung, Messwerkzeug, Seitenzahl, Datum, Unterschrift, Sonstiges), Titel über `printDocTitle` („Messblatt Überstand Laufbuchse“), Deckblatt mit Handlungsbedarf (`sheetIssues`) |
| 10-settings | Prüfer, Logo für den Kopf (`settings.logo`: null = SDT-Standard `img/sdt-logo.svg`, '' = ohne, sonst Data-URL), eigene Unterschrift, gemerkte Sollwerte, Sicherung/Import (mit Fotos), Beispielauftrag |

## Datenmodell

- `order`: { id, orderNo, customer, vessel, newbuild, classification, location, contact, reason, date, status 'offen'|'fertig', engines[], sheets[] }
- `engine`: { name, make, model, number, hours, power, rpm, layout 'V'|'R', cylinders, count 'KS'|'KGS' } – Motortyp „16V…“ setzt V/16.
- `sheet`: { id, type, mode 'beides'|'mess'|'befund'|null, engine (Index), date, subtitle, data{}, findings[], rating, summary, advice, signWorker, signCustomer }
- Messwerte: `sheet.data[cfg.key] = { spec, rows: { [Position]: { 'I_L': '170,012', … } }, count }` – Werte als Text mit Komma.
- Gemerkte Sollwerte: `appData.specs["mtu 16v 4000 m63"][typeId] = { [cfg.key]: spec }`.
- V-Motor: Zylinder A1…An/2, B1…; Grundlager n/2+1, Hublager n/2, NW-Lager n/2+1 (änderbar je Blatt).

## Neues Blatt ergänzen

Eintrag in `SHEET_TYPES` (03-types): `measure` (grid/points/clearance; points mit nur 1 Punkt = Einzelwert ohne Mittel/Streuung, `note: true` = Bemerkung je Zeile), `inspect` (Positionen + Befund-Chips),
`extra` (Zusatzangaben im Kopf), `printLabel` (Name im Drucktitel) – Editor, Auswertung und Druck kommen automatisch. Nur für ganz eigene Blätter
`special` + Funktionen in 06-special und `specialPrintHtml` (09-print).

## Konventionen

- Klassische `<script>`-Dateien, globaler Scope; aus `onclick` aufgerufene Funktionen über `Object.assign(window, …)`.
- Benutzertext in `innerHTML` immer mit `escapeHtml()`. Datenmodell abwärtskompatibel halten (`normalizeData`).
- Neue Datei in `js/` → in `index.html` UND in `sw.js` `APP_SHELL_FILES`.
- **Bei jeder Änderung an index.html / js / style.css `CACHE_VERSION` in `sw.js` hochzählen.**

## Prüfen

```
for f in js/*.js; do node --check "$f"; done
node tools/smoke-test.js   # legt alle Blätter an, prüft Auswertung, Druck (PDF) → .smoke/
```
