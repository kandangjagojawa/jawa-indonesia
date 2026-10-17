let KAMUS_TALING = {};
let isKamusLoaded = false;

// Memuat kamustaling.json secara asinkron
async function muatKamusTaling() {
    try {
        const response = await fetch('./kamustaling.json');
        if (response.ok) {
            KAMUS_TALING = await response.json();
            isKamusLoaded = true;
        }
    } catch (err) {
        console.warn('Gagal memuat kamustaling.json, transliterasi menggunakan mode standar:', err);
    }
}

// Fungsi pembantu untuk menyesuaikan format huruf kapital pada kata hasil substitusi
function sesuaikanKapital(original, target) {
    if (original[0] === original[0].toUpperCase()) {
        return target.charAt(0).toUpperCase() + target.slice(1);
    }
    return target;
}

// Fungsi pembantu untuk mengurai awalan dan alomorf (peluruhan fonem)
function dapatkanKandidatKataDasar(kata, prefixes) {
    let kandidat = [];
    for (let pref of prefixes) {
        if (kata.startsWith(pref) && kata.length > pref.length + 2) {
            let sisa = kata.slice(pref.length);

            // Penanganan alomorf/peluruhan fonem pada meN- dan peN-
            if (pref === 'meny' || pref === 'peny') {
                kandidat.push({ prefix: pref, dasar: 's' + sisa });
            } else if (pref === 'mem' || pref === 'pem') {
                kandidat.push({ prefix: pref, dasar: sisa });
                kandidat.push({ prefix: pref.slice(0, -1), dasar: 'p' + sisa });
            } else if (pref === 'men' || pref === 'pen') {
                kandidat.push({ prefix: pref, dasar: sisa });
                kandidat.push({ prefix: pref.slice(0, -1), dasar: 't' + sisa });
            } else if (pref === 'meng' || pref === 'peng') {
                kandidat.push({ prefix: pref, dasar: sisa });
                kandidat.push({ prefix: pref.slice(0, -2), dasar: 'k' + sisa });
            } else {
                kandidat.push({ prefix: pref, dasar: sisa });
            }
        }
    }
    return kandidat;
}

// Mengoreksi e pepet menjadi e taling berdasarkan kamus & analisis afiksasi (imbuhan) tanpa merusak huruf kapital
function normalisasiETaling(teks) {
    if (!isKamusLoaded || !teks) return teks;

    const PREFIXES = [
        'meny', 'meng', 'mem', 'men', 'me',
        'peny', 'peng', 'pem', 'pen', 'pe',
        'ber', 'bel', 'ter', 'per', 'di', 'se', 'ke'
    ];

    const SUFFIXES = [
        'wati', 'wan', 'man', 'nya', 'kan', 'iah', 'an', 'wi', 'i'
    ];

    return teks.replace(/[a-zA-Z]+/g, function(word) {
        let lowerWord = word.toLowerCase();

        // 1. Cek langsung kata utuh di kamus
        if (KAMUS_TALING[lowerWord]) {
            return sesuaikanKapital(word, KAMUS_TALING[lowerWord]);
        }

        // 2. Cek pelepasan akhiran
        let stemSuffix = lowerWord;
        let matchedSuffix = "";
        for (let suf of SUFFIXES) {
            if (stemSuffix.endsWith(suf) && stemSuffix.length > suf.length + 2) {
                stemSuffix = stemSuffix.slice(0, -suf.length);
                matchedSuffix = suf;
                break;
            }
        }

        if (KAMUS_TALING[stemSuffix]) {
            let replacedStem = KAMUS_TALING[stemSuffix];
            return sesuaikanKapital(word, replacedStem + matchedSuffix);
        }

        // 3. Cek pelepasan awalan (pada kata dasar atau kata yang sudah dilepas akhirannya)
        let kandidatStem = dapatkanKandidatKataDasar(stemSuffix, PREFIXES);
        for (let stem of kandidatStem) {
            if (KAMUS_TALING[stem.dasar]) {
                let stemTaling = KAMUS_TALING[stem.dasar];
                let hasil = stem.prefix + stemTaling + matchedSuffix;
                return sesuaikanKapital(word, hasil);
            }
        }

        // 4. Cek pelepasan awalan langsung (jika tidak ada akhiran terdeteksi)
        if (matchedSuffix === "") {
            let kandidatAwal = dapatkanKandidatKataDasar(lowerWord, PREFIXES);
            for (let stem of kandidatAwal) {
                if (KAMUS_TALING[stem.dasar]) {
                    let stemTaling = KAMUS_TALING[stem.dasar];
                    let hasil = stem.prefix + stemTaling;
                    return sesuaikanKapital(word, hasil);
                }
            }
        }

        return word;
    });
}

// Proses utama transliterasi
function jalankanTransliterasi() {
    const inputElem = document.getElementById('inputLatin');
    const outputElem = document.getElementById('outputJawa');
    const charCounter = document.getElementById('charCounter');
    const btnClear = document.getElementById('btnClear');

    if (!inputElem || !outputElem) return;

    let rawInput = inputElem.value;

    // Update Counter & Tombol Clear
    if (charCounter) charCounter.innerText = `${rawInput.length} karakter`;
    if (btnClear) btnClear.style.display = rawInput.length > 0 ? 'flex' : 'none';

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

// Fungsi untuk tombol Salin + Toast Notification
function salinAksara() {
    const outputElem = document.getElementById('outputJawa');
    if (!outputElem || outputElem.innerText === '-') return;

    navigator.clipboard.writeText(outputElem.innerText).then(() => {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2500);
        }
    });
}

/* =========================================================================
 * INTERAKTIVITAS VISUAL: 3D CARD TILT & CANVAS PARTIKEL
 * ========================================================================= */

// 1. Efek 3D Tilt Kartu mengikuti kursor
function init3DTilt() {
    const card = document.getElementById('tiltCard');
    if (!card || window.innerWidth < 768) return;

    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const rotateX = ((clientY - innerHeight / 2) / innerHeight) * -10;
        const rotateY = ((clientX - innerWidth / 2) / innerWidth) * 10;

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
}

// 2. Animasi Canvas Partikel Melayang
function initParticleCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 45 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2
    }));

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(129, 140, 248, ${p.alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#818cf8';
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// Event Listeners & Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    const inputElem = document.getElementById('inputLatin');
    const btnClear = document.getElementById('btnClear');

    if (inputElem) {
        inputElem.addEventListener('input', jalankanTransliterasi);
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (inputElem) {
                inputElem.value = '';
                jalankanTransliterasi();
                inputElem.focus();
            }
        });
    }

    init3DTilt();
    initParticleCanvas();

    muatKamusTaling().then(() => {
        jalankanTransliterasi();
    });
});
