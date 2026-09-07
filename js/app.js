// ---- Standardwerte (alle im Einstellungen-Bereich änderbar, werden in localStorage gespeichert) ----
const STANDARD_EINSTELLUNGEN = {
    preise: {           // € pro Packung
        250: 8.80,
        500: 15.90,
        1000: 31.50
    },
    aboRabatt: 10,       // % Rabatt auf Abo-Bestellungen
    versandschwelle: 45, // € (nach Abo-Rabatt) - ab hier kostenlose Lieferung
    versandkosten: 4.99, // € - unterhalb der Schwelle
    frischeWochen: 6,    // Warnung, wenn eine Lieferung länger als X Wochen reicht
    gPerTasse: {
        filter: 9,
        vollautomat: 8,
        siebtraeger: 9,
        frenchpress: 10,
        pad: 7,
        coldbrew: 12
    }
};

const PACK_EINHEITEN = { 1000: 4, 500: 2, 250: 1 }; // 1 Einheit = 250g

function ladeEinstellungen() {
    try {
        const gespeichert = localStorage.getItem('abo-planer-einstellungen');
        if (!gespeichert) return structuredClone(STANDARD_EINSTELLUNGEN);
        const geladen = JSON.parse(gespeichert);
        return {
            ...structuredClone(STANDARD_EINSTELLUNGEN),
            ...geladen,
            preise: { ...STANDARD_EINSTELLUNGEN.preise, ...(geladen.preise || {}) },
            gPerTasse: { ...STANDARD_EINSTELLUNGEN.gPerTasse, ...(geladen.gPerTasse || {}) }
        };
    } catch {
        return structuredClone(STANDARD_EINSTELLUNGEN);
    }
}

function speichereEinstellungen(einstellungen) {
    try {
        localStorage.setItem('abo-planer-einstellungen', JSON.stringify(einstellungen));
    } catch {
        // localStorage nicht verfügbar - Einstellungen gelten nur für diese Sitzung
    }
}

let einstellungen = ladeEinstellungen();

// ---- Einstellungen-Formular mit aktuellen Werten befüllen ----
function fuelleEinstellungsformular() {
    document.getElementById('einst-preis-250').value = einstellungen.preise[250];
    document.getElementById('einst-preis-500').value = einstellungen.preise[500];
    document.getElementById('einst-preis-1000').value = einstellungen.preise[1000];
    document.getElementById('einst-rabatt').value = einstellungen.aboRabatt;
    document.getElementById('einst-schwelle').value = einstellungen.versandschwelle;
    document.getElementById('einst-versand').value = einstellungen.versandkosten;
    document.getElementById('einst-frische').value = einstellungen.frischeWochen;
    document.getElementById('einst-g-filter').value = einstellungen.gPerTasse.filter;
    document.getElementById('einst-g-vollautomat').value = einstellungen.gPerTasse.vollautomat;
    document.getElementById('einst-g-siebtraeger').value = einstellungen.gPerTasse.siebtraeger;
    document.getElementById('einst-g-frenchpress').value = einstellungen.gPerTasse.frenchpress;
    document.getElementById('einst-g-pad').value = einstellungen.gPerTasse.pad;
    document.getElementById('einst-g-coldbrew').value = einstellungen.gPerTasse.coldbrew;
}

function speichereEinstellungsformular() {
    einstellungen = {
        preise: {
            250: parseFloat(document.getElementById('einst-preis-250').value) || STANDARD_EINSTELLUNGEN.preise[250],
            500: parseFloat(document.getElementById('einst-preis-500').value) || STANDARD_EINSTELLUNGEN.preise[500],
            1000: parseFloat(document.getElementById('einst-preis-1000').value) || STANDARD_EINSTELLUNGEN.preise[1000]
        },
        aboRabatt: parseFloat(document.getElementById('einst-rabatt').value) || 0,
        versandschwelle: parseFloat(document.getElementById('einst-schwelle').value) || STANDARD_EINSTELLUNGEN.versandschwelle,
        versandkosten: parseFloat(document.getElementById('einst-versand').value) || STANDARD_EINSTELLUNGEN.versandkosten,
        frischeWochen: parseFloat(document.getElementById('einst-frische').value) || STANDARD_EINSTELLUNGEN.frischeWochen,
        gPerTasse: {
            filter: parseFloat(document.getElementById('einst-g-filter').value) || STANDARD_EINSTELLUNGEN.gPerTasse.filter,
            vollautomat: parseFloat(document.getElementById('einst-g-vollautomat').value) || STANDARD_EINSTELLUNGEN.gPerTasse.vollautomat,
            siebtraeger: parseFloat(document.getElementById('einst-g-siebtraeger').value) || STANDARD_EINSTELLUNGEN.gPerTasse.siebtraeger,
            frenchpress: parseFloat(document.getElementById('einst-g-frenchpress').value) || STANDARD_EINSTELLUNGEN.gPerTasse.frenchpress,
            pad: parseFloat(document.getElementById('einst-g-pad').value) || STANDARD_EINSTELLUNGEN.gPerTasse.pad,
            coldbrew: parseFloat(document.getElementById('einst-g-coldbrew').value) || STANDARD_EINSTELLUNGEN.gPerTasse.coldbrew
        }
    };
    speichereEinstellungen(einstellungen);
}

// ---- Optimale (günstigste) Packungskombination für eine Zielmenge finden ----
// Da die drei Größen unterschiedliche €/kg haben können, wird per kleiner
// dynamischer Programmierung die wirklich günstigste Kombination gesucht,
// die die Zielmenge mindestens abdeckt (kleiner Puffer erlaubt, falls eine
// größere Packung am Ende günstiger ist als exaktes Auffüllen).
function berechneOptimalePackung(zielGramm, preise) {
    const zielEinheiten = Math.max(1, Math.ceil(zielGramm / 250));
    const maxEinheiten = zielEinheiten + 3;

    const kosten = new Array(maxEinheiten + 1).fill(Infinity);
    const wahl = new Array(maxEinheiten + 1).fill(null);
    kosten[0] = 0;

    for (let u = 1; u <= maxEinheiten; u++) {
        for (const groesse of [1000, 500, 250]) {
            const einheitenProPack = PACK_EINHEITEN[groesse];
            if (u - einheitenProPack >= 0) {
                const kandidat = kosten[u - einheitenProPack] + preise[groesse];
                if (kandidat < kosten[u] - 1e-9) {
                    kosten[u] = kandidat;
                    wahl[u] = groesse;
                }
            }
        }
    }

    let besteU = zielEinheiten;
    for (let u = zielEinheiten; u <= maxEinheiten; u++) {
        if (kosten[u] < kosten[besteU] - 1e-9) besteU = u;
    }

    const combo = { 1000: 0, 500: 0, 250: 0 };
    let u = besteU;
    while (u > 0) {
        const groesse = wahl[u];
        combo[groesse]++;
        u -= PACK_EINHEITEN[groesse];
    }

    return {
        anzahl1000: combo[1000],
        anzahl500: combo[500],
        anzahl250: combo[250],
        gesamtGramm: besteU * 250,
        rohpreis: kosten[besteU]
    };
}

function formatiereKombination(kombi) {
    const teile = [];
    if (kombi.anzahl1000 > 0) teile.push(`${kombi.anzahl1000}× 1kg`);
    if (kombi.anzahl500 > 0) teile.push(`${kombi.anzahl500}× 500g`);
    if (kombi.anzahl250 > 0) teile.push(`${kombi.anzahl250}× 250g`);
    return teile.join(' + ') || '–';
}

function formatPreis(betrag) {
    return betrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

// ---- Für eine Zielmenge: Packung, Rabatt, Versand, Gesamtkosten berechnen ----
function berechnePlan(zielGramm) {
    const kombi = berechneOptimalePackung(zielGramm, einstellungen.preise);
    const warenwertVorRabatt = kombi.rohpreis;
    const rabattBetrag = warenwertVorRabatt * (einstellungen.aboRabatt / 100);
    const warenwertNachRabatt = warenwertVorRabatt - rabattBetrag;
    const versandGratis = warenwertNachRabatt >= einstellungen.versandschwelle;
    const versandkosten = versandGratis ? 0 : einstellungen.versandkosten;
    const gesamt = warenwertNachRabatt + versandkosten;

    return { kombi, warenwertVorRabatt, rabattBetrag, warenwertNachRabatt, versandGratis, versandkosten, gesamt };
}

function berechne() {
    const personen = parseFloat(document.getElementById('personen').value);
    const tassenProTag = parseFloat(document.getElementById('tassen').value);
    const maschine = document.getElementById('maschine').value;

    if (!personen || !tassenProTag || personen <= 0 || tassenProTag <= 0) {
        return;
    }

    const gProTasse = einstellungen.gPerTasse[maschine];
    const bedarfProTag = personen * tassenProTag * gProTasse;
    const bedarfProMonat = bedarfProTag * 30; // durchschnittlicher Monat
    const bedarfProQuartal = bedarfProMonat * 3;

    const monatsplan = berechnePlan(bedarfProMonat);
    const quartalsplan = berechnePlan(bedarfProQuartal);
    const quartalMonatlich = quartalsplan.gesamt / 3;

    const quartalEmpfohlen = quartalMonatlich < monatsplan.gesamt;

    const wochenVorratMonat = (monatsplan.kombi.gesamtGramm / bedarfProTag) / 7;
    const wochenVorratQuartal = (quartalsplan.kombi.gesamtGramm / bedarfProTag) / 7;

    zeigeErgebnis({
        bedarfProMonat,
        monatsplan,
        quartalsplan,
        quartalMonatlich,
        quartalEmpfohlen,
        wochenVorratMonat,
        wochenVorratQuartal
    });
}

function zeigeErgebnis(daten) {
    document.getElementById('bedarf-menge').textContent =
        (daten.bedarfProMonat / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' kg';

    // Monatskarte
    document.getElementById('monat-kombi').textContent = formatiereKombination(daten.monatsplan.kombi);
    document.getElementById('monat-warenwert').textContent = formatPreis(daten.monatsplan.warenwertVorRabatt);
    document.getElementById('monat-rabatt').textContent = '−' + formatPreis(daten.monatsplan.rabattBetrag);
    document.getElementById('monat-versand').textContent = daten.monatsplan.versandGratis
        ? 'kostenlos'
        : formatPreis(daten.monatsplan.versandkosten);
    document.getElementById('monat-gesamt-wert').textContent = formatPreis(daten.monatsplan.gesamt);

    // Quartalskarte
    document.getElementById('quartal-kombi').textContent = formatiereKombination(daten.quartalsplan.kombi);
    document.getElementById('quartal-warenwert').textContent = formatPreis(daten.quartalsplan.warenwertVorRabatt);
    document.getElementById('quartal-rabatt').textContent = '−' + formatPreis(daten.quartalsplan.rabattBetrag);
    document.getElementById('quartal-versand').textContent = daten.quartalsplan.versandGratis
        ? 'kostenlos'
        : formatPreis(daten.quartalsplan.versandkosten);
    document.getElementById('quartal-gesamt-wert').textContent = formatPreis(daten.quartalsplan.gesamt);
    document.getElementById('quartal-monatlich').textContent = formatPreis(daten.quartalMonatlich) + ' / Monat';

    // Empfehlungs-Badge setzen
    document.getElementById('monat-karte').classList.toggle('empfohlen', !daten.quartalEmpfohlen);
    document.getElementById('quartal-karte').classList.toggle('empfohlen', daten.quartalEmpfohlen);
    document.getElementById('monat-badge').classList.toggle('hidden', daten.quartalEmpfohlen);
    document.getElementById('quartal-badge').classList.toggle('hidden', !daten.quartalEmpfohlen);

    // Frische-Warnung
    const warnungEl = document.getElementById('frische-warnung');
    const relevanteWochen = daten.quartalEmpfohlen ? daten.wochenVorratQuartal : daten.wochenVorratMonat;
    if (relevanteWochen > einstellungen.frischeWochen) {
        warnungEl.textContent = `⚠️ Die empfohlene Liefermenge reicht ca. ${relevanteWochen.toFixed(1)} Wochen. ` +
            `Für optimale Frische empfehlen wir, Kaffee innerhalb von ${einstellungen.frischeWochen} Wochen zu verbrauchen – ` +
            `ggf. lieber die kleinere Menge oder öfter bestellen.`;
        warnungEl.classList.remove('hidden');
    } else {
        warnungEl.classList.add('hidden');
    }

    document.getElementById('ergebnis').classList.add('sichtbar');
    document.getElementById('ergebnis').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    fuelleEinstellungsformular();

    document.getElementById('btn-berechnen').addEventListener('click', berechne);
    document.getElementById('einstellungen-form').addEventListener('change', speichereEinstellungsformular);
});

// PWA: Service Worker registrieren
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}
