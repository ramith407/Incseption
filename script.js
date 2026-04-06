/* ============================================================
   InCSEption 2.0 — Hackathon Timer
   Counts down to 3:30 PM (15:30:00) today, auto-starts on load
   ============================================================ */

const RING_CIRCUMFERENCE = 2 * Math.PI * 155; // matches r="155" in SVG

// ── Target: 3:30 PM today ──
function getTarget() {
    const t = new Date();
    t.setHours(15, 30, 0, 0);
    return t;
}

// Total duration from midnight to 3:30 PM = used for ring progress baseline
const TARGET_TIME = getTarget();

// Compute total seconds from page-load until target (for the ring's 100% baseline)
const LOAD_SECONDS_LEFT = Math.max(0, Math.floor((TARGET_TIME - Date.now()) / 1000));

// ── DOM refs ──
const timerScreen    = document.getElementById('timerScreen');
const finishedScreen = document.getElementById('finishedScreen');

const hoursDisplay   = document.getElementById('hoursDisplay');
const minutesDisplay = document.getElementById('minutesDisplay');
const secondsDisplay = document.getElementById('secondsDisplay');
const mainDisplay    = document.getElementById('mainDisplay');

const hoursBar   = document.getElementById('hoursBar');
const minutesBar = document.getElementById('minutesBar');
const secondsBar = document.getElementById('secondsBar');

const ringProgress = document.getElementById('ringProgress');

// Set ring circumference
ringProgress.style.strokeDasharray  = RING_CIRCUMFERENCE;
ringProgress.style.strokeDashoffset = 0;

// ── Screens helper ──
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ── Render ──
function renderTimer() {
    const now = Date.now();
    const secondsLeft = Math.max(0, Math.floor((TARGET_TIME - now) / 1000));

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
    hoursBar.style.width   = LOAD_SECONDS_LEFT > 0 ? `${(secondsLeft / LOAD_SECONDS_LEFT) * 100}%` : '0%';
    minutesBar.style.width = `${(m / 59) * 100}%`;
    secondsBar.style.width = `${(s / 59) * 100}%`;

    // Ring — shrinks from full to 0 as time elapses
    const fraction = LOAD_SECONDS_LEFT > 0 ? secondsLeft / LOAD_SECONDS_LEFT : 0;
    ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - fraction);


    // Danger mode (last 30 minutes)
    if (secondsLeft <= 1800 && secondsLeft > 0) {
        timerScreen.classList.add('danger');
    } else {
        timerScreen.classList.remove('danger');
    }

    // Done?
    if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        mainDisplay.textContent = '00:00:00';
        hoursDisplay.textContent = minutesDisplay.textContent = secondsDisplay.textContent = '00';
        hoursBar.style.width = minutesBar.style.width = secondsBar.style.width = '0%';
        ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE;
        showScreen('finishedScreen');
    }
}

// ── Auto-start on load ──
renderTimer(); // render immediately so there's no flicker
const timerInterval = setInterval(renderTimer, 1000);

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
            x:  Math.random() * window.innerWidth,
            y:  Math.random() * window.innerHeight,
            r:  Math.random() * 1.5 + 0.3,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            a:  Math.random(),
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
