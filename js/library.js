const list = document.getElementById('songList');
const search = document.getElementById('search');
let songs = [];

const collator = new Intl.Collator('es', { sensitivity: 'base' });

function songCard(song) {
  return `
    <a class="song-card" href="reader.html?song=${encodeURIComponent(song.id)}">
      <strong>${song.title}</strong>
      ${song.key ? `<span>Tono ${song.key}</span>` : ''}
    </a>`;
}

function render(items, searching = false) {
  if (!items.length) {
    list.innerHTML = '<p class="empty">No encontré canciones.</p>';
    return;
  }

  const groups = items.reduce((acc, song) => {
    (acc[song.artist] ||= []).push(song);
    return acc;
  }, {});

  const artists = Object.keys(groups).sort(collator.compare);

  list.innerHTML = artists.map(artist => {
    const artistSongs = groups[artist].sort((a, b) => collator.compare(a.title, b.title));
    return `
      <details class="artist-group" ${searching ? 'open' : ''}>
        <summary class="artist-summary">
          <span>${artist}</span>
          <span class="artist-count">${artistSongs.length}</span>
        </summary>
        <div class="artist-songs">
          ${artistSongs.map(songCard).join('')}
        </div>
      </details>`;
  }).join('');
}

fetch('songs/songs.json?v=21', { cache: 'no-store' })
  .then(r => { if (!r.ok) throw new Error('catalog'); return r.json(); })
  .then(data => {
    songs = data;
    render(songs);
  })
  .catch(() => {
    list.innerHTML = '<p class="error">No se pudo cargar la biblioteca.</p>';
  });

search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  if (!q) {
    render(songs);
    return;
  }
  const filtered = songs.filter(s => `${s.title} ${s.artist}`.toLowerCase().includes(q));
  render(filtered, true);
});