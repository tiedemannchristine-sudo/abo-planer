# Deployment auf abo-planer.lenoko.de (GitHub Pages)

Der Ordner ist bereits ein lokales Git-Repo mit einem ersten Commit
(inkl. Bugfix, SEO-Tags, `robots.txt`, `sitemap.xml`, `CNAME`). Es fehlt
nur noch: GitHub-Repo anlegen, pushen, Pages aktivieren, DNS setzen.

## 1. Repo auf GitHub anlegen
1. Auf github.com einloggen → **New repository** (z. B. `abo-planer` oder
   `kaffee-abo-planer-pwa`), **öffentlich**, ohne README/`.gitignore`
   (haben wir schon lokal).
2. Lokal den Remote setzen und pushen (im Ordner, z. B. mit Git Bash oder
   VS Code Terminal):

   ```
   git branch -M main
   git remote add origin https://github.com/<DEIN-USERNAME>/<REPO-NAME>.git
   git push -u origin main
   ```

   (Bei der ersten Anmeldung fragt GitHub nach Login/Token –
   Personal Access Token statt Passwort verwenden, falls nötig.)

## 2. GitHub Pages aktivieren
1. Im Repo: **Settings → Pages**.
2. **Source**: „Deploy from a branch" → Branch `main`, Ordner `/ (root)`.
3. Speichern.

## 3. Custom Domain setzen
1. Weiterhin unter **Settings → Pages** → Feld **Custom domain**:
   `abo-planer.lenoko.de` eintragen und speichern (die `CNAME`-Datei im
   Repo ist bereits vorhanden, GitHub übernimmt den Wert meist automatisch).
2. **Enforce HTTPS** aktivieren, sobald das Zertifikat verfügbar ist
   (kann nach dem DNS-Schritt ein paar Minuten bis Stunden dauern).

## 4. DNS-Eintrag setzen
Beim DNS-Provider von `lenoko.de` einen **CNAME-Eintrag** anlegen:

| Name/Host        | Typ   | Ziel                        |
|-------------------|-------|------------------------------|
| `abo-planer`      | CNAME | `<DEIN-USERNAME>.github.io.` |

Danach kann DNS-Propagation + SSL-Zertifikat von GitHub bis zu 24h dauern
(meist deutlich schneller).

## 5. Shopify-Weiterleitung (bereits erledigt ✅)
`lenoko.de/pages/abo-planer` leitet bereits per URL-Redirect auf
`https://abo-planer.lenoko.de` weiter (im Shopify Admin unter
**Online Store → Navigation → URL-Weiterleitungen** einsehbar/änderbar).
Sobald die Seite live ist, kann z. B. ein Navigationspunkt oder ein
Produkt-/Collection-Link auf `/pages/abo-planer` verweisen.

## Änderungen in diesem Update
- **Bugfix**: „Bedarf berechnen" zeigte kein Ergebnis mehr, weil das
  Setzen von `quartal-gesamt.textContent` das verschachtelte
  `#quartal-monatlich`-Element gelöscht hat – der darauffolgende
  `getElementById` lieferte `null` und die Funktion brach mit einem
  Fehler ab, bevor das Ergebnis eingeblendet wurde. Fix: eigenes
  `<span id="monat-gesamt-wert">` / `<span id="quartal-gesamt-wert">`
  für die Zahl, `<small>` bleibt unangetastet.
- **SEO**: Canonical-URL, Open-Graph- & Twitter-Tags, JSON-LD
  (`WebApplication`), `<h1>` statt `<h2>`, `robots.txt`, `sitemap.xml`.
- **Deployment**: `CNAME`-Datei für `abo-planer.lenoko.de` angelegt,
  lokales Git-Repo initialisiert.
