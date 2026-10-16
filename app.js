let KAMUS_TALING = {};
let isKamusLoaded = false;

// Memuat kamustaling.json secara asinkron
async function muatKamusTaling() {
    try {
        const response = await fetch('kamustaling.json');
        if (response.ok) {
            KAMUS_TALING = await response.json();
            isKamusLoaded = true;
        }
    } catch (err) {
        console.warn('Gagal memuat kamustaling.json, transliterasi menggunakan mode standar:', err);
    }
}

// Mengoreksi e pepet menjadi e taling berdasarkan kamus tanpa merusak huruf kapital
function normalisasiETaling(teks) {
    if (!isKamusLoaded || !teks) return teks;

    return teks.replace(/[a-zA-ZA-Z]+/g, function(word) {
        let lowerWord = word.toLowerCase();
        if (KAMUS_TALING[lowerWord]) {
            let replacement = KAMUS_TALING[lowerWord];
            // Preservasi kapitalisasi huruf pertama
            if (word[0] === word[0].toUpperCase()) {
                return replacement.charAt(0).toUpperCase() + replacement.slice(1);
            }
            return replacement;
        }
        return word;
    });
}

// Proses utama transliterasi
function jalankanTransliterasi() {
    const inputElem = document.getElementById('inputLatin');
    const outputElem = document.getElementById('outputJawa');
    if (!inputElem || !outputElem) return;

    let rawInput = inputElem.value;
    if (!rawInput.trim()) {
        outputElem.innerText = '-';
        return;
    }

    // Pre-processing e-taling otomatis
    let inputNormalized = normalisasiETaling(rawInput);

    // Memanggil fungsi dari jawaindo.js
    if (typeof transliterasiKalimat === 'function') {
        outputElem.innerText = transliterasiKalimat(inputNormalized);
    }
}

// Fungsi untuk tombol Salin
function salinAksara() {
    const outputElem = document.getElementById('outputJawa');
    const btnSalin = document.getElementById('btnSalin');
    if (!outputElem || outputElem.innerText === '-') return;

    navigator.clipboard.writeText(outputElem.innerText).then(() => {
        let originalText = btnSalin.innerText;
        btnSalin.innerText = '✅ Tersalin!';
        setTimeout(() => {
            btnSalin.innerText = originalText;
        }, 2000);
    });
}

// Event Listeners & Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    const inputElem = document.getElementById('inputLatin');
    if (inputElem) {
        inputElem.addEventListener('input', jalankanTransliterasi);
    }

    muatKamusTaling().then(() => {
        jalankanTransliterasi();
    });
});
