/* ============================================================
   InCSEption 2.0 — Hackathon Timer Logic
   ============================================================ */

const TOTAL_SECONDS = 8 * 60 * 60; // 8 hours in seconds
const RING_CIRCUMFERENCE = 2 * Math.PI * 155; // matches r="155" in SVG

let secondsLeft = TOTAL_SECONDS;
let timerInterval = null;
let isPaused = false;
let started = false;

// ── DOM refs ──
const startScreen    = document.getElementById('startScreen');
const timerScreen    = document.getElementById('timerScreen');
const finishedScreen = document.getElementById('finishedScreen');

const hoursDisplay   = document.getElementById('hoursDisplay');
const minutesDisplay = document.getElementById('minutesDisplay');
const secondsDisplay = document.getElementById('secondsDisplay');
const mainDisplay    = document.getElementById('mainDisplay');
const elapsedDisplay = document.getElementById('elapsedDisplay');

const hoursBar   = document.getElementById('hoursBar');
const minutesBar = document.getElementById('minutesBar');
const secondsBar = document.getElementById('secondsBar');

const ringProgress = document.getElementById('ringProgress');
const pauseBtn     = document.getElementById('pauseBtn');

// Set ring total circumference
ringProgress.style.strokeDasharray  = RING_CIRCUMFERENCE;
ringProgress.style.strokeDashoffset = 0;

// ── screens helper ──
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ── Start ──
function startTimer() {
    started = true;
    secondsLeft = TOTAL_SECONDS;
    isPaused = false;
    showScreen('timerScreen');
    renderTimer();
    timerInterval = setInterval(tick, 1000);
}

// ── Tick ──
function tick() {
    if (isPaused) return;
    if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        showScreen('finishedScreen');
        return;
    }
    secondsLeft--;
    renderTimer();
}

// ── Render ──
function renderTimer() {
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;

    const hStr = String(h).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    const sStr = String(s).padStart(2, '0');

    hoursDisplay.textContent   = hStr;
    minutesDisplay.textContent = mStr;
    secondsDisplay.textContent = sStr;
    mainDisplay.textContent    = `${hStr}:${mStr}:${sStr}`;

    // Progress bars
    hoursBar.style.width   = `${(h / 8) * 100}%`;
    minutesBar.style.width = `${(m / 59) * 100}%`;
    secondsBar.style.width = `${(s / 59) * 100}%`;

    // Ring progress
    const fraction = secondsLeft / TOTAL_SECONDS;
    ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - fraction);

    // Elapsed
    const elapsed = TOTAL_SECONDS - secondsLeft;
    const eh = Math.floor(elapsed / 3600);
    const em = Math.floor((elapsed % 3600) / 60);
    const es = elapsed % 60;
    elapsedDisplay.textContent =
        `${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}:${String(es).padStart(2,'0')}`;

    // Danger mode (last 60 minutes = 3600s)
    if (secondsLeft <= 3600) {
        timerScreen.classList.add('danger');
    } else {
        timerScreen.classList.remove('danger');
    }
}

// ── Pause / Resume ──
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶ RESUME' : '⏸ PAUSE';
    if (isPaused) {
        pauseBtn.style.background = 'rgba(56,189,248,0.25)';
    } else {
        pauseBtn.style.background = 'rgba(14,165,233,0.15)';
    }
}

// ── Reset ──
function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    started = false;
    isPaused = false;
    secondsLeft = TOTAL_SECONDS;
    timerScreen.classList.remove('danger');
    pauseBtn.textContent = '⏸ PAUSE';
    pauseBtn.style.background = '';
    showScreen('startScreen');
}

// ── Particle Canvas ──
(function () {
    const canvas = document.getElementById('particleCanvas');
    const ctx    = canvas.getContext('2d');
    const particles = [];
    const COUNT = 55;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x:    Math.random() * window.innerWidth,
            y:    Math.random() * window.innerHeight,
            r:    Math.random() * 1.5 + 0.3,
            vx:   (Math.random() - 0.5) * 0.3,
            vy:   (Math.random() - 0.5) * 0.3,
            a:    Math.random(),
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width)  p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56, 189, 248, ${p.a * 0.6})`;
            ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
            ctx.shadowBlur  = 6;
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
})();
