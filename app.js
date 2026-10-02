const playButton = document.getElementById('play');
const speedDown = document.getElementById('speedDown');
const speedUp = document.getElementById('speedUp');
const fontDown = document.getElementById('fontDown');
const fontUp = document.getElementById('fontUp');
const topButton = document.getElementById('top');

let playing = false;
let speed = 0.45; // pixels per animation frame at ~60 fps
let fontSize = window.innerWidth <= 420 ? 15 : 17;
let lastTime = 0;
let carry = 0;

function animate(time) {
  if (!playing) return;
  if (!lastTime) lastTime = time;
  const dt = Math.min(time - lastTime, 50);
  lastTime = time;
  carry += speed * (dt / 16.67);
  if (carry >= 1) {
    const pixels = Math.floor(carry);
    window.scrollBy(0, pixels);
    carry -= pixels;
  }
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) {
    playing = false;
    playButton.textContent = '▶ Scroll';
    lastTime = 0;
    return;
  }
  requestAnimationFrame(animate);
}

playButton.addEventListener('click', () => {
  playing = !playing;
  playButton.textContent = playing ? '⏸ Pause' : '▶ Scroll';
  lastTime = 0;
  if (playing) requestAnimationFrame(animate);
});

speedDown.addEventListener('click', () => { speed = Math.max(0.12, speed - 0.08); });
speedUp.addEventListener('click', () => { speed = Math.min(2.0, speed + 0.08); });

function applyFontSize() {
  document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
}
fontDown.addEventListener('click', () => { fontSize = Math.max(11, fontSize - 1); applyFontSize(); });
fontUp.addEventListener('click', () => { fontSize = Math.min(28, fontSize + 1); applyFontSize(); });
topButton.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
