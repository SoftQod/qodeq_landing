const PROVIDERS = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    type: 'AI Voice',
    icon: '🎙️',
    price: '$0.11',
    en: 'audio/elevenlabs-en.wav',
    ru: 'audio/elevenlabs-ru.wav',
  },
  {
    id: 's2pro',
    name: 'S2 Pro',
    type: 'AI Voice',
    icon: '⚡',
    price: '$0.13',
    en: 'audio/s2pro-en.mp3',
    ru: 'audio/s2pro-ru.mp3',
  },
  {
    id: 'vapi',
    name: 'VAPI',
    type: 'AI Voice',
    icon: '🔊',
    price: '$0.09',
    en: 'audio/vapi-en.wav',
    ru: 'audio/vapi-ru.wav',
  },
  {
    id: 'azure',
    name: 'Azure',
    type: 'AI Voice',
    icon: '☁️',
    price: '$0.08',
    en: 'audio/azure-en.wav',
    ru: 'audio/azure-ru.wav',
  },
  {
    id: 'inworld',
    name: 'InWorld',
    type: 'AI Voice',
    icon: '🌐',
    price: '$0.08',
    en: 'audio/inworld-en.wav',
    ru: 'audio/inworld-ru.wav',
  },
];

const PLAY_ICON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const PAUSE_ICON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

let activeAudio = null;
let activeBtn = null;
let activePlayer = null;

function fmt(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function stopActive() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  if (activeBtn) activeBtn.innerHTML = PLAY_ICON;
  if (activePlayer) activePlayer.classList.remove('active');
  activeAudio = null;
  activeBtn = null;
  activePlayer = null;
}

function buildPlayer(provider, lang) {
  const isRu = lang === 'ru';
  const src = isRu ? provider.ru : provider.en;
  const label = isRu ? '🇷🇺 Русский' : '🇬🇧 English';

  const player = document.createElement('div');
  player.className = 'player';

  const audio = new Audio(src);

  const timeEl = document.createElement('span');
  timeEl.className = 'player-time';
  timeEl.textContent = '0:00 / 0:00';

  const progressWrap = document.createElement('div');
  progressWrap.className = 'progress-wrap';

  const progressFill = document.createElement('div');
  progressFill.className = 'progress-fill';
  progressWrap.appendChild(progressFill);

  const btn = document.createElement('button');
  btn.className = 'play-btn';
  btn.innerHTML = PLAY_ICON;
  btn.setAttribute('aria-label', `Play ${label}`);

  btn.addEventListener('click', () => {
    if (activeAudio === audio) {
      stopActive();
      return;
    }
    stopActive();
    audio.play().catch(() => {});
    btn.innerHTML = PAUSE_ICON;
    player.classList.add('active');
    activeAudio = audio;
    activeBtn = btn;
    activePlayer = player;
  });

  audio.addEventListener('timeupdate', () => {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progressFill.style.width = pct + '%';
    timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });

  audio.addEventListener('ended', () => {
    stopActive();
    progressFill.style.width = '0%';
    timeEl.textContent = `0:00 / ${fmt(audio.duration)}`;
  });

  audio.addEventListener('loadedmetadata', () => {
    timeEl.textContent = `0:00 / ${fmt(audio.duration)}`;
  });

  progressWrap.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = progressWrap.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
    if (activeAudio !== audio) {
      stopActive();
      audio.play().catch(() => {});
      btn.innerHTML = PAUSE_ICON;
      player.classList.add('active');
      activeAudio = audio;
      activeBtn = btn;
      activePlayer = player;
    }
  });

  const top = document.createElement('div');
  top.className = 'player-top';

  const meta = document.createElement('div');
  meta.className = 'player-meta';

  const langEl = document.createElement('div');
  langEl.className = 'player-lang';
  langEl.textContent = label;

  meta.appendChild(langEl);
  meta.appendChild(timeEl);

  top.appendChild(btn);
  top.appendChild(meta);

  player.appendChild(top);
  player.appendChild(progressWrap);

  return player;
}

function buildCard(provider) {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <div class="card-header">
      <div class="provider-info">
        <div class="provider-icon">${provider.icon}</div>
        <div>
          <div class="provider-name">${provider.name}</div>
          <div class="provider-type">${provider.type}</div>
        </div>
      </div>
      <div class="price-badge">
        <div class="price-val">~${provider.price}</div>
        <div class="price-unit">/ мин</div>
        <div class="price-approx">± приблизительно</div>
      </div>
    </div>
  `;

  const players = document.createElement('div');
  players.className = 'players';
  players.appendChild(buildPlayer(provider, 'ru'));
  players.appendChild(buildPlayer(provider, 'en'));
  card.appendChild(players);

  return card;
}

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  PROVIDERS.forEach(p => grid.appendChild(buildCard(p)));
});
