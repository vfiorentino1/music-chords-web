const list = document.getElementById('songList');
const search = document.getElementById('search');
let songs = [];

function render(items) {
  if (!items.length) {
    list.innerHTML = '<p class="empty">No encontré canciones.</p>';
    return;
  }
  list.innerHTML = items.map(song => `
    <a class="song-card" href="reader.html?song=${encodeURIComponent(song.id)}">
      <strong>${song.title}</strong>
      <span>${song.artist}${song.key ? ` · Tono ${song.key}` : ''}</span>
    </a>`).join('');
}

fetch('songs/songs.json?v=20', { cache: 'no-store' })
  .then(r => { if (!r.ok) throw new Error('catalog'); return r.json(); })
  .then(data => { songs = data; render(songs); })
  .catch(() => { list.innerHTML = '<p class="error">No se pudo cargar la biblioteca.</p>'; });

search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  render(songs.filter(s => `${s.title} ${s.artist}`.toLowerCase().includes(q)));
});
