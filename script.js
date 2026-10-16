/* ==========================================================
   BIRTHDAY WEBSITE — PERSONALIZE THIS SECTION BEFORE SHARING
   ========================================================== */
const birthdayConfig = {
  name: "Bestie",
  date: "2026-10-17", // YYYY-MM-DD
  homeMessage: "Life is a little brighter, louder, and a whole lot better with you in it.",
  finalMessage: "May your smile stay bright, your heart stay kind, and this year surprise you in the best possible ways.",
  signature: "Your bestie ♡"
};

const $ = (id) => document.getElementById(id);
const settingsDialog = $("settingsDialog");
let audioContext = null;
let musicTimer = null;
let musicOn = false;
let noteIndex = 0;
let confettiPieces = [];
let confettiFrame = null;

function prettyDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString(undefined, {day:"numeric", month:"long", year:"numeric"});
}
function applyConfig() {
  const name = birthdayConfig.name.trim() || "Bestie";
  $("heroName").textContent = name;
  $("letterName").textContent = name;
  $("heroMessage").textContent = birthdayConfig.homeMessage;
  $("finalMessage").textContent = birthdayConfig.finalMessage;
  $("dateLabel").textContent = prettyDate(birthdayConfig.date);
  $("friendName").value = name === "Bestie" ? "" : name;
  $("birthdayDate").value = birthdayConfig.date;
  $("customMessage").value = birthdayConfig.homeMessage;
  $("signature").value = birthdayConfig.signature.replace(/\s*♡$/, "");
  const signoff = $("letterBody").querySelector(".letter-signoff span");
  if (signoff) signoff.textContent = birthdayConfig.signature;
  document.title = `Happy Birthday, ${name}! ✨`;
}
function updateCountdown() {
  const target = new Date(`${birthdayConfig.date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return;
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    $("days").textContent = "00"; $("hours").textContent = "00";
    $("minutes").textContent = "00"; $("seconds").textContent = "00";
    $("countdownText").textContent = "It's your day! Let the birthday magic begin. ✨";
    return;
  }
  const total = Math.floor(diff / 1000);
  $("days").textContent = String(Math.floor(total / 86400)).padStart(2, "0");
  $("hours").textContent = String(Math.floor((total % 86400) / 3600)).padStart(2, "0");
  $("minutes").textContent = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  $("seconds").textContent = String(total % 60).padStart(2, "0");
  $("countdownText").textContent = Number($("days").textContent) === 1
    ? "One more sleep until your day gets the spotlight."
    : "Every second brings us closer to celebrating you.";
}
function openMainGift() {
  const gift = $("mainGift");
  if (gift.classList.contains("gift-open")) return;
  gift.classList.add("gift-open");
  $("giftInstruction").textContent = "SURPRISE! A little bundle of birthday love ✨";
  setTimeout(() => {
    $("giftReveal").hidden = false;
    burstConfetti(150);
    $("giftReveal").scrollIntoView({behavior:"smooth", block:"center"});
  }, 420);
}
function openLetter() {
  $("letter").scrollIntoView({behavior:"smooth", block:"start"});
}
function makeAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  return audioContext || (audioContext = new AudioCtx());
}
// A small original synthesized tune; no external audio file is required.
const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5];
function playNote(freq, startAt, duration) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.075, startAt + 0.035);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain); gain.connect(audioContext.destination);
  osc.start(startAt); osc.stop(startAt + duration + 0.03);
}
async function toggleMusic() {
  if (musicOn) {
    musicOn = false;
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
    $("musicToggle").setAttribute("aria-pressed", "false");
    $("musicIcon").textContent = "♫";
    $("musicLabel").textContent = "Play a tune";
    return;
  }
  const ctx = makeAudioContext();
  if (!ctx) {
    $("musicLabel").textContent = "Audio unavailable";
    return;
  }
  if (ctx.state === "suspended") await ctx.resume();
  musicOn = true;
  $("musicToggle").setAttribute("aria-pressed", "true");
  $("musicIcon").textContent = "♪";
  $("musicLabel").textContent = "Pause tune";
  const playPhrase = () => {
    if (!musicOn || !audioContext) return;
    const now = audioContext.currentTime + 0.05;
    for (let i = 0; i < melody.length; i++) playNote(melody[(noteIndex + i) % melody.length], now + i * 0.28, 0.22);
    noteIndex = (noteIndex + 4) % melody.length;
  };
  playPhrase();
  musicTimer = setInterval(playPhrase, 3350);
}
function burstConfetti(amount=100) {
  const canvas = $("confetti");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  const colors = ["#ff83b5","#ffd9a0","#bba7ff","#ffffff","#ffb2d0","#8de1d3"];
  for (let i=0;i<amount;i++) confettiPieces.push({
    x: Math.random()*window.innerWidth, y: -20-Math.random()*window.innerHeight*.5,
    vx:(Math.random()-.5)*3, vy:2+Math.random()*4, size:3+Math.random()*5,
    rotation:Math.random()*6.28, spin:(Math.random()-.5)*.18,
    color:colors[Math.floor(Math.random()*colors.length)], life:0
  });
  if (!confettiFrame) animateConfetti();
}
function animateConfetti() {
  const canvas = $("confetti");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
  confettiPieces = confettiPieces.filter(p => p.life < 170 && p.y < window.innerHeight + 30);
  for (const p of confettiPieces) {
    p.x += p.vx; p.y += p.vy; p.rotation += p.spin; p.life++;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation); ctx.fillStyle=p.color;
    ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.65); ctx.restore();
  }
  if (confettiPieces.length) confettiFrame = requestAnimationFrame(animateConfetti);
  else { cancelAnimationFrame(confettiFrame); confettiFrame = null; ctx.clearRect(0,0,window.innerWidth,window.innerHeight); }
}
function saveSettings(event) {
  event.preventDefault();
  birthdayConfig.name = $("friendName").value.trim() || "Bestie";
  birthdayConfig.date = $("birthdayDate").value || "2026-10-17";
  birthdayConfig.homeMessage = $("customMessage").value.trim() || "Life is a little brighter, louder, and a whole lot better with you in it.";
  const signature = $("signature").value.trim() || "Your bestie";
  birthdayConfig.signature = signature.includes("♡") ? signature : `${signature} ♡`;
  applyConfig(); updateCountdown();
  try { localStorage.setItem("birthdayWebsiteConfig", JSON.stringify(birthdayConfig)); } catch (e) {}
  settingsDialog.close();
  burstConfetti(55);
}
function loadSavedSettings() {
  try {
    const saved = localStorage.getItem("birthdayWebsiteConfig");
    if (saved) Object.assign(birthdayConfig, JSON.parse(saved));
  } catch (e) {}
}
function openSettings() {
  if (typeof settingsDialog.showModal === "function") settingsDialog.showModal();
  else settingsDialog.setAttribute("open", "");
}
function wish() {
  const wishes = [
    "Wish sent to the universe. Now get ready for beautiful things. ✨",
    "Official birthday magic activated! Keep shining. 💖",
    "Your wish is on its way. Never stop believing in your own magic. 🌟",
    "A new chapter, a thousand possibilities, and so much love. 🎂"
  ];
  $("wishResult").textContent = wishes[Math.floor(Math.random()*wishes.length)];
  burstConfetti(180);
  $("wishButton").textContent = "Wish made ✓";
  setTimeout(() => $("wishButton").textContent = "Make another wish ✨", 2200);
}

$("openGiftTop").addEventListener("click", () => { $("surprise").scrollIntoView({behavior:"smooth"}); setTimeout(openMainGift, 350); });
$("heroGift").addEventListener("click", () => { $("surprise").scrollIntoView({behavior:"smooth"}); setTimeout(openMainGift, 350); });
$("mainGift").addEventListener("click", openMainGift);
$("letterButton").addEventListener("click", openLetter);
$("musicToggle").addEventListener("click", toggleMusic);
$("openSettings").addEventListener("click", openSettings);
$("footerSettings").addEventListener("click", openSettings);
$("settingsForm").addEventListener("submit", saveSettings);
$("wishButton").addEventListener("click", wish);
window.addEventListener("resize", () => {
  if (confettiPieces.length) {
    $("confetti").width = window.innerWidth * devicePixelRatio;
    $("confetti").height = window.innerHeight * devicePixelRatio;
  }
});
loadSavedSettings();
applyConfig();
updateCountdown();
setInterval(updateCountdown, 1000);
