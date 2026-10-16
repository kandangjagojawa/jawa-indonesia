/**
 * JAWAINDO.JS
 * Engine Transliterasi Aksara Jawa Khusus Bahasa Indonesia & Jawa Modern.
 * Hasil penggabungan praktis.js, morfologi.js (fungsi singkatan), & app.js (sintaks perlindungan singkatan).
 * 
 * KETENTUAN LOGIKA & MAPPING:
 * 1. Scripto Continua Murni -> Penulisan menyambung alami antar-kata menggunakan pasangan/tumpuk.
 * 2. Vokal Awal Kata & Hiatus -> Otomatis menggunakan Aksara Swara (ꦄ, ꦆ, ꦈ, ꦌ, ꦎ).
 * 3. Diftong ai & au -> 
 *    - Setelah konsonan: Sandhangan Dirga Mure (ꦻ) & Sandhangan Au (ꦻꦴ).
 *    - Awal kata / tanpa konsonan: Aksara Swara AI (ꦍ) & AU (ꦎꦴ).
 * 4. Panambang Natural -> Meleburkan konsonan akhir kata dasar ke vokal panambang secara alami 
 *    tanpa dobel konsonan dan tanpa Pangkon (mangan-e -> ꦩꦔꦤ꺺).
 * 5. Tembung Dwilingga Mandiri -> Kata ulang ber-tanda hubung diproses terpisah (alun-alun -> ꦄꦭꦸꦤ꧀ꦄꦭꦸꦤ꧀).
 * 6. Ater-ater Anuswara Literal -> Ditulis murni sesuai ketikan tanpa penyisipan Aksara Ha di depan (ngombe -> ꦔꦺꦴꦩ꧀ꦧꦺ).
 * 7. Huruf Kapital & Murda -> Huruf kapital tidak otomatis memicu aksara Murda. Aksara Murda diakses via konsonan ganda (nn, kk, tt, ss, pp, gg, bb, cc, nyy, jj, rr).
 * 8. Penulisan Huruf D Bahasa Indonesia -> Memakai U+A99D (ꦝ). Aksara Da (ꦢ / U+A9A2) diakses via 'dx'.
 * 9. Dukungan Singkatan Otomatis -> Deteksi kata kapital [A-Z]{2,} & sintaks «...», dikonversi ke ejaan bunyi ber-Pada Lingsa (꧈) dan terisolasi dari pangkon kata sebelumnya via \u200C.
 */

const KAMUS_AKSARA = {
    'h':'ꦲ', 'n':'ꦤ', 'c':'ꦕ', 'r':'ꦫ', 'k':'ꦏ',
    'd':'ꦝ', 't':'ꦠ', 's':'ꦱ', 'w':'ꦮ', 'l':'ꦭ',
    'p':'ꦥ', 'dh':'\uA9A3', 'j':'ꦗ', 'y':'ꦪ', 'ny':'ꦚ',
    'm':'ꦩ', 'g':'ꦒ', 'b':'ꦧ', 'th':'ꦛ', 'ng':'ꦔ', 'nx':'ꦔ',
    'f':'ꦥ꦳', 'v':'ꦮ꦳', 'z':'ꦗ꦳',
    'kh':'ꦏ꦳', 'dz':'ꦢ꦳', 'gh':'ꦒ꦳',
    'sy':'ꦯ', 'sh':'ꦰ',
    'kx':'ꦏ', 'rx':'ꦫ', 'hx':'ꦲ', 'ngx':'ꦔ', 'dx':'ꦢ',
    'q': 'ꦐ', 'hh': 'ꦲ꦳', 'xng': 'ꦔ꦳', 'ts': 'ꦱ꦳', 'shh': 'ꦰ꦳',
    'xsy': 'ꦯ꦳', 'dl': 'ꦭ꦳', 'tth': 'ꦡ꦳', 'zh': 'ꦣ꦳', 'x': 'ꦑ꦳',
    'nn':'ꦟ', 'kk':'ꦑ', 'tt':'ꦡ', 'ss':'ꦯ', 'pp':'ꦦ',
    'gg':'ꦓ', 'bb':'ꦨ', 'cc':'ꦖ', 'nyy':'ꦘ', 'jj':'ꦙ', 'rr':'ꦬ'
};

const AKSARA_MURDA = {
    'n':'ꦟ', 'k':'ꦑ', 't':'ꦡ', 's':'ꦯ', 'p':'ꦦ',
    'g':'ꦓ', 'b':'ꦨ', 'c':'ꦖ', 'ny':'ꦘ', 'j':'ꦙ',
    'r':'ꦬ'
};

const SWARA_MAP = {
    'A':'ꦄ', 'I':'ꦆ', 'U':'ꦈ', 'E':'ꦄꦼ', 'É':'ꦌ', 'È':'ꦌ', 'Ê':'ꦄꦼ', 'O':'ꦎ',
    'AI':'ꦍ', 'AU':'ꦎꦴ',
    'AA':'ꦄꦴ', 'II':'ꦇ', 'UU':'ꦈꦴ', 'REE':'ꦉꦴ', 'LEE':'ꦋ'
};

const ANGKA = ['꧐','꧑','꧒','꧓','꧔','꧕','꧖','꧗','꧘','꧙'];

/* =========================================================================
 * PEMETAAN & FUNGSI SINGKATAN (INTEGRASI MORFOLOGI.JS & APP.JS)
 * ========================================================================= */

const MAP_SINGKATAN_BIASA = {
    'A':'ꦄ', 'B':'ꦧ', 'C':'ꦕ', 'D':'ꦝ', 'E':'ꦌ', 'F':'ꦥ', 'G':'ꦒ', 'H':'ꦲ',
    'I':'ꦆ', 'J':'ꦗ', 'K':'ꦏ', 'L':'ꦭ', 'M':'ꦩ', 'N':'ꦤ', 'O':'ꦎ', 'P':'ꦥ',
    'Q':'ꦏ', 'R':'ꦫ', 'S':'ꦱ', 'T':'ꦠ', 'U':'ꦈ', 'V':'ꦮ', 'W':'ꦮ', 'X':'ꦏ',
    'Y':'ꦪ', 'Z':'ꦗ'
};

const MAP_SINGKATAN_BIASA_REKAN = {
    'A':'ꦄ', 'B':'ꦧ', 'C':'ꦕ', 'D':'ꦝ', 'E':'ꦌ', 'F':'ꦥ꦳', 'G':'ꦒ', 'H':'ꦲ',
    'I':'ꦆ', 'J':'ꦗ', 'K':'ꦏ', 'L':'ꦭ', 'M':'ꦩ', 'N':'ꦤ', 'O':'ꦎ', 'P':'ꦥ',
    'Q':'ꦏ꦳', 'R':'ꦫ', 'S':'ꦱ', 'T':'ꦠ', 'U':'ꦈ', 'V':'ꦮ꦳', 'W':'ꦮ', 'X':'ꦏ꦳',
    'Y':'ꦪ', 'Z':'ꦗ꦳'
};

const MAP_SINGKATAN_MURDA_REKAN = {
    'A':'ꦄ', 'B':'ꦨ', 'C':'ꦕ', 'D':'ꦝ', 'E':'ꦌ', 'F':'ꦥ꦳', 'G':'ꦓ', 'H':'ꦲ',
    'I':'ꦆ', 'J':'ꦗ', 'K':'ꦑ', 'L':'ꦭ', 'M':'ꦩ', 'N':'ꦟ', 'O':'ꦎ', 'P':'ꦦ',
    'Q':'ꦑ꦳', 'R':'ꦫ', 'S':'ꦯ', 'T':'ꦡ', 'U':'ꦈ', 'V':'ꦮ꦳', 'W':'ꦮ', 'X':'ꦑ꦳',
    'Y':'ꦪ', 'Z':'ꦗ꦳'
};

const MAP_SINGKATAN_KAWI = {
    'A':'ꦄ', 'B':'ꦨ', 'C':'ꦕ', 'D':'ꦝ', 'E':'ꦌ', 'F':'ꦥ', 'G':'ꦓ', 'H':'ꦲ',
    'I':'ꦆ', 'J':'ꦗ', 'K':'ꦑ', 'L':'ꦭ', 'M':'ꦟ', 'N':'ꦟ', 'O':'ꦎ', 'P':'ꦦ',
    'Q':'ꦏ', 'R':'ꦫ', 'S':'ꦱ', 'T':'ꦡ', 'U':'ꦈ', 'V':'ꦮ', 'W':'ꦮ', 'X':'ꦏ',
    'Y':'ꦪ', 'Z':'ꦗ'
};

const MAP_SINGKATAN_BUNYI = {
    'A':'ꦄ', 'B':'ꦧꦺ', 'C':'ꦕꦺ', 'D':'ꦝꦺ', 'E':'ꦌ', 'F':'ꦌꦥ꦳꧀', 'G':'ꦒꦺ', 'H':'ꦲꦃ',
    'I':'ꦆ', 'J':'ꦗꦺ', 'K':'ꦏꦺ', 'L':'ꦌꦭ꧀', 'M':'ꦌꦩ꧀', 'N':'ꦌꦤ꧀', 'O':'ꦎ', 'P':'ꦥꦺ',
    'Q':'ꦏꦶꦈ', 'R':'ꦌꦂ', 'S':'ꦌꦱ꧀', 'T':'ꦠꦺ', 'U':'ꦈ', 'V':'ꦮ꦳ꦺ', 'W':'ꦮꦺ', 'X':'ꦌꦏ꧀ꦱ꧀',
    'Y':'ꦪꦺ', 'Z':'ꦗ꦳ꦺ'
};

function prosesSingkatan(rawInput, opsi) {
    if (!rawInput) return "";
    let clean = rawInput.toUpperCase().replace(/[^A-Z]/g, '');
    if (!clean) return "";

    if (opsi === 'latin') {
        return '«' + clean + '»';
    }

    let result = "";
    for (let i = 0; i < clean.length; i++) {
        let char = clean[i];
        if (opsi === 'murda_rekan' || opsi === 'murda') {
            result += (MAP_SINGKATAN_MURDA_REKAN[char] || char) + '꧈';
        } else if (opsi === 'biasa_rekan') {
            result += (MAP_SINGKATAN_BIASA_REKAN[char] || char) + '꧈';
        } else if (opsi === 'kawi_biasa' || opsi === 'kawi') {
            result += (MAP_SINGKATAN_KAWI[char] || char) + '꧈';
        } else if (opsi === 'bunyi') {
            result += (MAP_SINGKATAN_BUNYI[char] || char) + '꧈';
        } else { // 'biasa'
            result += (MAP_SINGKATAN_BIASA[char] || char) + '꧈';
        }
    }
    return result;
}

function scrollToParamasastra() {
    let el = document.getElementById('paramasastra-app');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function ubahFont() {
    let fontSel = document.getElementById('fontSelect');
    if (!fontSel) return;
    let fontTerpilih = fontSel.value;
    let outJawa = document.getElementById('outputJawa');
    let outParam = document.getElementById('outParamJawa');
    if (outJawa) outJawa.style.fontFamily = fontTerpilih;
    if (outParam) outParam.style.fontFamily = fontTerpilih;
}

function ubahUkuranFont() {
    let slider = document.getElementById('fontSizeSlider');
    if (!slider) return;
    let ukuran = slider.value;
    let outJawa = document.getElementById('outputJawa');
    if (outJawa) outJawa.style.fontSize = ukuran + 'rem';
}

function ubahJarakBaris() {
    let lineH = document.getElementById('lineHeightSlider');
    if (!lineH) return;
    let val = lineH.value;
    let outJawa = document.getElementById('outputJawa');
    let outParam = document.getElementById('outParamJawa');
    if (outJawa) outJawa.style.lineHeight = val;
    if (outParam) outParam.style.lineHeight = val;
}

function hapusSemua() {
    let inp = document.getElementById('inputLatin');
    if (inp) inp.value = '';
    prosesTransliterasi();
}

function salinAksara() {
    let el = document.getElementById('outputJawa');
    if (!el) return;
    let teksAksara = el.innerText;
    if (!teksAksara) return;
    navigator.clipboard.writeText(teksAksara).then(() => {
        let btn = document.getElementById('btnSalin');
        if (btn) {
            let originalText = btn.innerText;
            btn.innerText = 'Tersalin!';
            setTimeout(() => { btn.innerText = originalText; }, 2000);
        }
    });
}

function salinParamLatin() {
    let el = document.getElementById('outParamLatin');
    if (!el) return;
    let teksLatin = el.value;
    if (!teksLatin) return;
    navigator.clipboard.writeText(teksLatin);
}

function salinParamJawa() {
    let el = document.getElementById('outParamJawa');
    if (!el) return;
    let teksAksara = el.innerText;
    if (!teksAksara) return;
    navigator.clipboard.writeText(teksAksara).then(() => {
        let btn = document.getElementById('btnSalinParam');
        if (btn) {
            let originalText = btn.innerText;
            btn.innerText = 'Tersalin!';
            setTimeout(() => { btn.innerText = originalText; }, 2000);
        }
    });
}

function updateParamFromManualInput() {
    let inp = document.getElementById('outParamLatin');
    let out = document.getElementById('outParamJawa');
    if (inp && out) {
        out.innerText = transliterasiKalimat(inp.value);
    }
}

function prosesParamasastra() {
    let selAter = document.getElementById('selAter');
    let inDasar = document.getElementById('inDasar');
    let selPanam = document.getElementById('selPanam');
    if (!selAter || !inDasar || !selPanam) return;

    let ater = selAter.value;
    let dasarRaw = inDasar.value.trim();
    let dasar = dasarRaw.replace(/e'/g, 'é').replace(/E'/g, 'É').toLowerCase();
    let panam = selPanam.value;

    let warnArea = document.getElementById('paramWarningArea');
    let outLat = document.getElementById('outParamLatin');
    let outJaw = document.getElementById('outParamJawa');

    if (warnArea) warnArea.innerHTML = "";

    if(!dasar) {
        if (outLat) outLat.value = "";
        if (outJaw) outJaw.innerHTML = "";
        return;
    }

    let stem = dasar;
    let prefixAppended = ater !== '' ? ater : '';
    let resultLatin = panam !== '' ? `${prefixAppended}${stem}-${panam}` : `${prefixAppended}${stem}`;

    if (outLat) outLat.value = resultLatin;
    if (outJaw) outJaw.innerText = transliterasiKalimat(resultLatin);
}

function prosesTransliterasi() {
    let inp = document.getElementById('inputLatin');
    let out = document.getElementById('outputJawa');
    if (!inp || !out) return;
    let teksInput = inp.value;
    let hasil = transliterasiKalimat(teksInput);
    out.innerText = hasil;
}

function transliterasiKalimat(teks) {
    if (!teks) return "";
    let teksDiolah = teks.replace(/e'/g, 'é').replace(/E'/g, 'É');

    // Pre-processing: Resolusi Sintaks Kontrol & Simbol Khusus
    teksDiolah = teksDiolah
        .replace(/\[[a-zA-ZéèêÉÈÊ]+\*([a-zA-ZéèêÉÈÊ]+)\]/gi, '$1')
        .replace(/[\~!\#\^]/g, '');

    // Mapping Simbol & Unicode Aksara Jawa
    teksDiolah = teksDiolah
        .replace(/\|\|/g, '\uA9CB')
        .replace(/\|/g, '\uA9CA')
        .replace(/\(\(/g, '\uA9C1') .replace(/\)\)/g, '\uA9C2')
        .replace(/<_/g, '\uA9C3')
        .replace(/<>/g, '\uA9C4')
        .replace(/>\^/g, '\uA9C5')
        .replace(/\(o\)/g, '\uA9C6')
        .replace(/:/g, '\uA9C7')
        .replace(/\[\\/g, '\uA9CC') .replace(/\\\]/g, '\uA9CD')
        .replace(/\^2/g, '\uA9CE')
        .replace(/_2/g, '\uA9CF')
        .replace(/~~/g, '\uA9DE')
        .replace(/##/g, '\uA9DF')
        .replace(/\^3/g, '\uA980')
        .replace(/\+3/g, '\uA9B3');

    let baris = teksDiolah.split('\n');
    let hasilBaris = baris.map(line => {
        // Penanganan sintaks singkatan «...» dan Akronim Kapital [A-Z]{2,}
        // Disertai \u200C agar terisolasi dari pangkon kata sebelumnya
        let processedLine = line.replace(/(«[^»]+»|\b[A-Z]{2,}\b)/g, function(match) {
            let hasilSingkatan = "";
            if (match.startsWith('«') && match.endsWith('»')) {
                let inner = match.slice(1, -1);
                if (inner.includes('|')) {
                    let parts = inner.split('|');
                    let rawSingk = parts[0];
                    let tagInfo = parts[1] || '';
                    let optNum = tagInfo.split(':')[1] || '1';
                    let opsi = 'bunyi';
                    if (optNum === '2') opsi = 'biasa_rekan';
                    else if (optNum === '3') opsi = 'murda_rekan';
                    else if (optNum === '4') opsi = 'latin';
                    if (opsi === 'latin') return rawSingk;
                    hasilSingkatan = prosesSingkatan(rawSingk, opsi);
                } else {
                    hasilSingkatan = inner;
                }
            } else if (/^[A-Z]{2,}$/.test(match)) {
                hasilSingkatan = prosesSingkatan(match, 'bunyi');
            } else {
                return match;
            }
            return '\u200C' + hasilSingkatan;
        });

        let kataKata = processedLine.split(/\s+/);
        let kataJawa = kataKata.map(kata => transliterasiKata(kata));
        
        // Scripto Continua Murni: kata disambung langsung tanpa penyisipan ZWNJ manual
        let lineJoined = kataJawa.join('');
        
        lineJoined = lineJoined.replace(/꧀([\u200C\uE000]*)ꦣ/g, '꧀$1ꦝ');

        return lineJoined;
    });
    return hasilBaris.join('\n');
}

function transliterasiKata(rawLatin) {
    if (!rawLatin) return "";
    return transliterasiSingleKata(rawLatin);
}

function transliterasiSingleKata(rawLatin) {
    if (!rawLatin) return "";

    let latinProcessed = rawLatin
        .replace(/\[[a-zA-ZéèêÉÈÊ]+\*([a-zA-ZéèêÉÈÊ]+)\]/gi, '$1')
        .replace(/[\~!\#\^]/g, '');

    let isKataNingrat = latinProcessed.toLowerCase().includes('ningrat');

    // Singkatan titik (a.b.c.) -> Aksara Swara / Nglegena + Pada Lingsa
    if (/^([a-zA-Z]\.)+$/.test(latinProcessed)) {
        let abbr = "";
        for (let j = 0; j < latinProcessed.length; j += 2) {
            let h = latinProcessed[j];
            let hLower = h.toLowerCase();
            let isVowel = ['a','i','u','e','o','é','è','ê'].includes(hLower);
            let charAksara = "";
            if (isVowel) {
                let vKey = hLower === 'o' ? 'O' : (['é','è'].includes(hLower) ? 'É' : (['e','ê'].includes(hLower) ? 'E' : hLower.toUpperCase()));
                charAksara = SWARA_MAP[vKey] || 'ꦄ';
            } else {
                charAksara = KAMUS_AKSARA[hLower] || '';
            }
            if (charAksara) abbr += `${charAksara}꧈`; 
        }
        return abbr;
    }

    // 1. DETEKSI TEMBUNG DWILINGGA (KATA ULANG)
    let dwiMatch = latinProcessed.match(/^([a-zA-ZéèêÉÈÊ]+)-([a-zA-ZéèêÉÈÊ]+)([^a-zA-ZéèêÉÈÊ]*)$/i);
    if (dwiMatch) {
        let root = dwiMatch[1];
        let suffix = dwiMatch[2];
        let rest = dwiMatch[3] || "";
        let r = root.toLowerCase();
        let s = suffix.toLowerCase();

        if (r === s || (s.startsWith(r) && r.length >= 2)) {
            return transliterasiSingleKata(root) + transliterasiSingleKata(suffix + rest);
        }
    }

    // 2. PANAMBANG NATURAL & ATER-ATER (LEBUR TANPA DOBEL KONSONAN / HAPUS TANDA HUBUNG KATA DASAR)
    latinProcessed = latinProcessed.replace(/([a-zA-ZéèêÉÈÊ]+)-([a-zA-ZéèêÉÈÊ]+)/g, '$1$2');

    let res = "";
    let i = 0;
    let latin = latinProcessed;
    let isFirstAksara = true; 

    while (i < latin.length) {
        if (latin[i] >= '0' && latin[i] <= '9') {
            if (!res.endsWith('꧇') && !/[꧐-꧙]$/.test(res)) { res += '꧇'; }
            res += ANGKA[parseInt(latin[i])];
            i++;
            if (i >= latin.length || !(latin[i] >= '0' && latin[i] <= '9')) { res += '꧇'; }
            continue;
        }

        if (latin[i] === ',') { 
            if (res.endsWith('꧀')) { res += '\u200C'; } else { res += '꧈'; }
            i++; continue; 
        }
        if (latin[i] === '.') { 
            if (res.endsWith('꧀')) { res += '꧈\u200C'; } else { res += '꧉'; }
            i++; continue; 
        }

        if (latin[i] === '-') {
            i++; continue;
        }

        if (/[\~!\#\^\[\]\*]/.test(latin[i])) {
            i++;
            continue;
        }
        
        if (!/[a-zA-ZéèêÉÈÊ]/.test(latin[i])) {
            res += latin[i]; i++; continue; 
        }

        let c = "";
        let jump = 0;
        let isSwara = false;

        let c3_raw = i+2 < latin.length ? latin.substring(i, i+3) : ""; 
        let c2_raw = i+1 < latin.length ? latin.substring(i, i+2) : "";
        let c1_raw = latin[i];

        let c3 = c3_raw.toLowerCase();
        let c2 = c2_raw.toLowerCase();
        let c1 = c1_raw.toLowerCase();

        let c3_upper = c3_raw.toUpperCase();
        let c2_upper = c2_raw.toUpperCase();

        // Cek Vokal Panjang Swara Mandiri (REE, LEE, AA, II, UU, AI, AU)
        if ((c3_upper === 'REE' || c3_upper === 'LEE') && c3_raw === c3_upper && SWARA_MAP[c3_upper]) {
            c = c3_upper; isSwara = true; jump = 3;
        } 
        else if (SWARA_MAP[c2_upper] && c2_raw === c2_upper && ['AA', 'II', 'UU', 'AI', 'AU'].includes(c2_upper)) {
            c = c2_upper; isSwara = true; jump = 2;
        } 
        else if (['ngx', 'xng', 'shh', 'xsy', 'tth', 'nyy'].includes(c3)) {
            c = c3; jump = 3;
        } else if (['ng','ny','dh','th','nx','kh','dz','gh','kx','rx','hx','ngx','dx','sy','sh','hh','ts','dl','zh','nn','kk','tt','ss','pp','gg','bb','cc','jj','rr'].includes(c2)) {
            c = c2; jump = 2;
        } else if (KAMUS_AKSARA[c1]) {
            c = c1; jump = 1;
        } else if (['A','I','U','E','O','É','È','Ê'].includes(c1_raw)) {
            c = c1_raw; isSwara = true; jump = 1;
        }

        // 3. VOKAL AWAL KATA & HIATUS (VOKAL MANDIRI/RANGKAP -> OTOMATIS AKSARA SWARA)
        if (c === "" && /[aieéèêou]/i.test(c1)) {
            let sub2V_raw = i+1 < latin.length ? latin.substring(i, i+2) : "";
            let sub2V_upper = sub2V_raw.toUpperCase();
            
            if (sub2V_upper === 'AI') {
                c = 'AI'; isSwara = true; jump = 2;
            } else if (sub2V_upper === 'AU') {
                c = 'AU'; isSwara = true; jump = 2;
            } else {
                let vUpper = c1_raw.toUpperCase();
                if (vUpper === 'A') { c = 'A'; isSwara = true; jump = 1; }
                else if (vUpper === 'I') { c = 'I'; isSwara = true; jump = 1; }
                else if (vUpper === 'U') { c = 'U'; isSwara = true; jump = 1; }
                else if (vUpper === 'O') { c = 'O'; isSwara = true; jump = 1; }
                else if (['É', 'È'].includes(vUpper)) { c = 'É'; isSwara = true; jump = 1; }
                else if (['E', 'Ê'].includes(vUpper)) { c = 'E'; isSwara = true; jump = 1; }
                else { c = 'A'; isSwara = true; jump = 1; }
            }
            i += jump;
        } else if (c !== "") {
            i += jump;
        } else {
            res += latin[i]; i++; continue;
        }

        let lowerLatin = latin.toLowerCase();
        let medial = "";
        
        // Medial Konsonan (Pengkal / Cakra)
        if (!isSwara && i < lowerLatin.length && (lowerLatin[i] === 'y' || lowerLatin[i] === 'r')) {
            if (i+1 < lowerLatin.length && /[aieéèêou]/.test(lowerLatin[i+1])) {
                medial = lowerLatin[i]; 
                i++; 
            } else if (c === 'h') {
                c = lowerLatin[i]; i++;
            }
        }

        // 4. PENANGANAN SANDHANGAN VOKAL SETELAH KONSONAN (TERMASUK DIFTONG AI & AU)
        let v = "";
        if (!isSwara && i < lowerLatin.length) {
            let sub3V = lowerLatin.substring(i, i+3);
            let sub2V = lowerLatin.substring(i, i+2);
            
            if (sub3V === 'ree' || sub3V === 'lee') {
                v = sub3V; i += 3;
            } else if (['aa', 'ii', 'uu', 'ai', 'au'].includes(sub2V)) {
                v = sub2V; i += 2;
            } else if (/[aieéèêou]/.test(lowerLatin[i])) {
                v = lowerLatin[i]; i += 1;
            }
        }

        let canTakeSandhangan = !/([꧀ꦁꦂꦃ\u200C]|^)$/.test(res);

        if (medial !== "") {
            let isExplicitX = (c3_raw.toLowerCase() === 'ngx' || c2_raw.toLowerCase() === 'hx' || c2_raw.toLowerCase() === 'rx' || c2_raw.toLowerCase() === 'kx' || c2_raw.toLowerCase() === 'dx');
            
            if (!isExplicitX && !isFirstAksara && canTakeSandhangan) {
                if (c === 'ng') {
                    if (!(isKataNingrat && medial === 'r')) {
                        res += 'ꦁ'; c = medial; medial = "";
                    }
                } else if (c === 'r') {
                    res += 'ꦂ'; c = medial; medial = "";
                } else if (c === 'h') {
                    res += 'ꦃ'; c = medial; medial = "";
                }
            }
        }

        // Konsonan Mati (Tanpa Vokal)
        if (v === "" && !isSwara) {
            if (c === 'ng' && !isFirstAksara && canTakeSandhangan) res += 'ꦁ'; 
            else if (c === 'r' && !isFirstAksara && canTakeSandhangan) res += 'ꦂ'; 
            else if (c === 'h' && !isFirstAksara && canTakeSandhangan) res += 'ꦃ'; 
            else if (c !== "") {
                let base = (c === 'dh' && res.endsWith('꧀')) ? 'ꦝ' : KAMUS_AKSARA[c];
                res += base + '꧀'; 
            }
            
            if (medial !== "") res += KAMUS_AKSARA[medial] + '꧀';
            if (c !== "") isFirstAksara = false;
            continue;
        }

        if (c === 'l' && (v === 'e' || v === 'ê') && medial === "") {
            if (res.endsWith('꧀')) {
                res += 'ꦭꦼ';
            } else {
                res += 'ꦊ';
            }
        } else if (c === 'r' && (v === 'e' || v === 'ê') && medial === "") {
            if (res.endsWith('꧀')) {
                res += 'ꦿꦼ';
            } else {
                res += 'ꦉ';
            }
        } else {
            let base = (c === 'dh' && res.endsWith('꧀')) ? 'ꦝ' : (isSwara ? SWARA_MAP[c] : KAMUS_AKSARA[c]);
            res += base;

            if (medial === 'y') res += 'ꦾ';
            else if (medial === 'r') {
                if (v === 'e' || v === 'ê') { res += 'ꦽ'; v = ''; } 
                else res += 'ꦿ'; 
            }

            if (!isSwara) {
                if (v === 'i') res += 'ꦶ';
                else if (v === 'ii') res += 'ꦷ';
                else if (v === 'u') res += 'ꦸ';
                else if (v === 'uu') res += 'ꦹ';
                else if (v === 'aa') res += 'ꦴ';
                else if (v === 'ai') res += 'ꦻ';   // Sandhangan Dirga Mure
                else if (v === 'au') res += 'ꦻꦴ';  // Sandhangan Au
                else if (v === 'ree') res += 'ꦉꦴ';
                else if (v === 'lee') res += 'ꦋ';
                else if (v === 'é' || v === 'è') res += 'ꦺ';
                else if (v === 'e' || v === 'ê') res += 'ꦼ';
                else if (v === 'o') res += 'ꦺꦴ';
            }
        }
        
        if (c !== "") isFirstAksara = false;
    }
    return res;
}

if (typeof window !== 'undefined') {
    window.transliterasiKalimat = transliterasiKalimat;
    window.prosesParamasastra = prosesParamasastra;
    window.updateParamFromManualInput = updateParamFromManualInput;
    window.salinParamLatin = salinParamLatin;
    window.salinParamJawa = salinParamJawa;
    window.prosesSingkatan = prosesSingkatan;
    window.prosesDwipurwa = typeof prosesDwipurwa !== 'undefined' ? prosesDwipurwa : function(){};
    window.salinDwipurwaLatin = typeof salinDwipurwaLatin !== 'undefined' ? salinDwipurwaLatin : function(){};
    window.salinDwipurwaJawa = typeof salinDwipurwaJawa !== 'undefined' ? salinDwipurwaJawa : function(){};
    window.updateDwipurwaFromManualInput = typeof updateDwipurwaFromManualInput !== 'undefined' ? updateDwipurwaFromManualInput : function(){};
}
