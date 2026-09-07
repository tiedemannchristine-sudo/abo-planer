# LeNoKo Kaffee-Abo-Planer (PWA)

Berechnet aus Personenanzahl, Tassen/Tag und Zubereitungsart den monatlichen
Kaffeebedarf und vergleicht Monatsabo vs. Quartalslieferung inkl. Versandkosten.

## Struktur

```
kaffee-abo-planer-pwa/
├── index.html
├── manifest.json
├── sw.js
├── css/style.css
├── js/app.js
└── icons/icon-192.png, icon-512.png
```

## Rechenlogik (in `js/app.js`)

1. **Bedarf**: `Personen × Tassen/Tag × Gramm/Tasse × 30 Tage` = Bedarf/Monat
   (Quartal = ×3). Die Gramm/Tasse-Werte je Zubereitungsart sind Schätzwerte
   und im UI unter „Erweiterte Einstellungen" anpassbar.
2. **Packungskombination**: Bedarf wird auf ganze 250g-Einheiten aufgerundet
   und mit möglichst wenigen Packungen (1kg/500g/250g) abgedeckt.
3. **Preis, Rabatt & Versand**: Jede Packungsgröße hat einen eigenen Preis
   (250g 8,80€ / 500g 15,90€ / 1kg 31,50€). Eine kleine dynamische
   Programmierung (`berechneOptimalePackung`) sucht die wirklich günstigste
   Kombination, die den Bedarf mindestens deckt – nicht nur die mit den
   wenigsten Packungen. Auf den Warenwert wird der Abo-Rabatt (Default 10%)
   abgezogen. Ab der Versandschwelle (Default 45€, **nach** Rabatt) ist der
   Versand kostenlos, sonst werden die Versandkosten (Default 4,99€)
   aufgeschlagen.
4. **Empfehlung**: Es wird verglichen, welche Option den günstigeren
   Monatsdurchschnittspreis ergibt (Quartalslieferung nutzt die
   Versandkosten-Schwelle i. d. R. besser aus, Monatsabo ist frischer).
5. **Frische-Warnung**: Wenn die empfohlene Liefermenge länger als das
   Frischefenster (Default 6 Wochen) reichen würde, erscheint ein Hinweis.

Alle Zahlenwerte werden in `localStorage` gespeichert, sobald sie im
Einstellungen-Bereich geändert werden.

## Annahme zur Versandschwelle

Die 45€-Schwelle wird auf den Warenwert **nach** Abo-Rabatt angewendet, da
das dem tatsächlichen Bestellwert im Checkout entspricht. Falls ihr das
anders handhabt (Schwelle vor Rabatt), einfach Bescheid geben – lässt sich
in einer Zeile in `js/app.js` (`berechnePlan`) anpassen.

## Deployment auf GitHub Pages

Gleiches Vorgehen wie beim Kaffeeberater:

1. Repo anlegen, Inhalt pushen.
2. **Settings → Pages → Deploy from branch** (`main`, `/root`).
3. Optional eigene Subdomain (z. B. `abo.lenoko.de`): `CNAME`-Datei anlegen,
   DNS-CNAME-Eintrag setzen, in den Pages-Settings als Custom Domain
   eintragen und HTTPS erzwingen.

## Verlinkung

Der Button am Ende führt aktuell zu `lenoko.de/collections/kaffee`. Sobald
ihr eine dedizierte Abo-Seite/-Produkt auf Shopify habt, den Link in
`index.html` entsprechend anpassen.
