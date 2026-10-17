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

// Mengoreksi e pepet menjadi e taling berdasarkan kamus tanpa merusak huruf kapital
function normalisasiETaling(teks) {
    if (!isKamusLoaded || !teks) return teks;

    return teks.replace(/[a-zA-Z]+/g, function(word) {
        let lowerWord = word.toLowerCase();
        if (KAMUS_TALING[lowerWord]) {
            let replacement = KAMUS_TALING[lowerWord];
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
