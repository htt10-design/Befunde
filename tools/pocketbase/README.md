# Befunde · Server-Einrichtung (PocketBase)

Befunde nutzt **denselben PocketBase-Server und dieselben Benutzer wie Zettel-Job**
(z.B. Heimserver über Tailscale). Dazu kommen zwei eigene Collections: `bf_items` und `bf_files`.
Die Zettel-Job-Collections (`zj_items`, `zj_files`) bleiben unberührt.

## 1. Collections anlegen (einmalig)

Im selben Ordner wie bei Zettel-Job (dort, wo die `docker-compose.yml` von PocketBase liegt, z.B. `~/server/pocketbase`):

```bash
cd ~/server/pocketbase
mkdir -p pb_migrations
curl -fsSL -o pb_migrations/1763200000_befunde.js \
  https://raw.githubusercontent.com/htt10-design/Befunde/main/tools/pocketbase/pb_migrations/1763200000_befunde.js
docker compose up -d --force-recreate
docker compose logs --tail=50
```

Der Ordner `pb_migrations` ist bei Zettel-Job schon eingebunden (`./pb_migrations:/pb/pb_migrations`).
PocketBase führt die neue Migration beim Start automatisch aus.
Im Admin (`https://heimserver.<tailnet>.ts.net/_/`) erscheinen danach `bf_items` und `bf_files`.

### Falls die Migration nicht greift: von Hand im Admin anlegen

**bf_items** (Typ *Base*): Felder `key` (Text, Pflicht), `kind` (Text), `data` (JSON, max. Größe z.B. 10 MB),
`ts` (Number), `deleted` (Bool), `device` (Text), dazu `created`/`updated` (Autodate).
Index: eindeutig auf `key`. API-Regeln List/View/Create/Update: `@request.auth.id != ''`, Delete: leer lassen (gesperrt).

**bf_files** (Typ *Base*): `fileId` (Text, Pflicht, eindeutiger Index), `name` (Text), `file` (Datei, 1 Datei, max. 25 MB),
`created`/`updated` (Autodate). Gleiche API-Regeln wie oben.

## 2. In der App anmelden

Befunde → **Einstellungen → Synchronisation**:
- Ist Zettel-Job auf demselben Gerät schon angemeldet: **„Anmeldung von Zettel-Job übernehmen“** antippen – fertig.
- Sonst: Server-Adresse, E-Mail, Passwort (dieselben wie in Zettel-Job) → **Anmelden & abgleichen**.

Das Gerät braucht die Tailscale-App und muss im Tailnet sein.

## Was wird abgeglichen?

- Aufträge (Kopfdaten, Motoren, Bericht-Fazit), jedes Blatt einzeln, Fotos, gemerkte Sollwerte, Logo
- Pro Gerät bleiben: Prüfername, eigene Unterschrift, Hell/Dunkel
- Beispielaufträge bleiben nur auf dem Gerät
- Gelöschte Einträge werden auf dem Server als `deleted` markiert (nicht entfernt)
- Backup des Servers: Ordner `pb_data` sichern (gilt für beide Apps)
