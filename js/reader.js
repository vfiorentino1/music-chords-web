const params = new URLSearchParams(location.search);
const songId = params.get('song');
const songText = document.getElementById('songText');
const title = document.getElementById('songTitle');
const meta = document.getElementById('songMeta');

async function loadSong() {
  try {
    const catalogResponse = await fetch('songs/songs.json', { cache: 'no-store' });
    if (!catalogResponse.ok) throw new Error('catalog');
    const songs = await catalogResponse.json();
    const song = songs.find(s => s.id === songId);
    if (!song) throw new Error('not found');
    title.textContent = song.title;
    meta.textContent = `${song.artist} · Tono ${song.key}`;
    document.title = `${song.title} | Mi Cancionero`;
    const textResponse = await fetch(`songs/${song.file}`, { cache: 'no-store' });
    if (!textResponse.ok) throw new Error('song');
    songText.textContent = await textResponse.text();
  } catch (e) {
    title.textContent = 'Error';
    songText.textContent = 'No se pudo cargar la canción. Volvé a la biblioteca e intentá nuevamente.';
  }
}
loadSong();

const play = document.getElementById('play');
let playing = false;
let speed = 26;
let fontSize = 16;
let previous = 0;

function frame(now) {
  if (!playing) return;
  if (!previous) previous = now;
  const dt = (now - previous) / 1000;
  previous = now;
  window.scrollBy(0, speed * dt);
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    playing = false;
    play.textContent = '▶ Scroll';
    previous = 0;
    return;
  }
  requestAnimationFrame(frame);
}

play.addEventListener('click', () => {
  playing = !playing;
  play.textContent = playing ? '⏸ Pause' : '▶ Scroll';
  previous = 0;
  if (playing) requestAnimationFrame(frame);
});
document.getElementById('speedDown').onclick = () => speed = Math.max(6, speed - 5);
document.getElementById('speedUp').onclick = () => speed = Math.min(100, speed + 5);
document.getElementById('fontDown').onclick = () => { fontSize = Math.max(11, fontSize - 1); songText.style.fontSize = `${fontSize}px`; };
document.getElementById('fontUp').onclick = () => { fontSize = Math.min(28, fontSize + 1); songText.style.fontSize = `${fontSize}px`; };
document.getElementById('top').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
