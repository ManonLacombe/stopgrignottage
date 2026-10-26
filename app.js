/* ==========================================================================
   StopGrignottage — logique de l'application
   Application locale, sans serveur, sans compte. Données dans localStorage.
   ========================================================================== */
'use strict';

/* --------------------------------------------------------------------------
   1. Constantes
   -------------------------------------------------------------------------- */

const STORAGE_KEY = 'stopgrignottage.v1';
const MAX_HISTORY = 2000;

const CATEGORIES = {
  faim:        { label: 'Faim physique',      icon: 'utensils', cssVar: '--c-faim' },
  ennui:       { label: 'Ennui',              icon: 'clock',    cssVar: '--c-ennui' },
  frustration: { label: 'Frustration',        icon: 'cloud',    cssVar: '--c-frustration' },
  stress:      { label: 'Stress ou émotion',  icon: 'wind',     cssVar: '--c-stress' },
  habitude:    { label: 'Habitude',           icon: 'repeat',   cssVar: '--c-habitude' },
  indetermine: { label: 'Envie indéterminée', icon: 'help',     cssVar: '--c-indetermine' }
};

const ICONS = {
  leaf: '<path d="M20 4c-9 0-15 5-15 12 0 3 2 5 5 5 7 0 10-8 10-17Z"/><path d="M5 21c2-5 5-9 10-12"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6h.08A1.7 1.7 0 0 0 10 3.05V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.08a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z"/>',
  'arrow-left': '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  cloud: '<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/>',
  wind: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2"/><path d="M10.59 19.41A2 2 0 1 0 14 16H2"/><path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2"/>',
  repeat: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M19 15l.7 1.9 1.9.7-1.9.7L19 21l-.7-1.9-1.9-.7 1.9-.7Z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  smartphone: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M12 7v6"/><polyline points="9 10 12 13 15 10"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'
};

/* --------------------------------------------------------------------------
   2. Utilitaires
   -------------------------------------------------------------------------- */

const app = document.getElementById('app');
const live = document.getElementById('live');
const toastEl = document.getElementById('toast');

function icon(name, size = 20) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.help}</svg>`;
}

function escapeHTML(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function uid(prefix) {
  let id;
  do {
    id = prefix + Math.random().toString(36).slice(2, 10);
  } while (document.getElementById(id));
  return id;
}

function truncate(value, length) {
  const s = String(value == null ? '' : value).trim();
  return s.length > length ? s.slice(0, length - 1).trimEnd() + '…' : s;
}

function plural(count, singular, pluralForm) {
  return count > 1 ? pluralForm : singular;
}

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getQuestion(id) {
  return state.questionnaire.questions.find((q) => q.id === id) || null;
}

function getResult(id) {
  return state.questionnaire.results.find((r) => r.id === id) || null;
}

function categoryOf(value) {
  return CATEGORIES[value] || CATEGORIES.indetermine;
}

function categoryStyle(categoryKey) {
  const category = categoryOf(categoryKey);
  return `--cause:var(${category.cssVar});--cause-soft:color-mix(in srgb, var(${category.cssVar}) 14%, var(--surface))`;
}

function parseTarget(value) {
  const index = String(value).indexOf(':');
  if (index < 0) return { kind: 'result', id: '' };
  return { kind: value.slice(0, index), id: value.slice(index + 1) };
}

function targetValue(target) {
  return `${target.kind}:${target.id}`;
}

function reachableFrom(fromId, toId, seen = new Set()) {
  if (fromId === toId) return true;
  if (seen.has(fromId)) return false;
  seen.add(fromId);
  const question = getQuestion(fromId);
  if (!question) return false;
  return [question.yes, question.no].some((target) => (
    target.kind === 'question' && reachableFrom(target.id, toId, seen)
  ));
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
}

function formatShortDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((today - day) / 86400000);
  if (diff === 0) return 'aujourd’hui';
  if (diff === 1) return 'hier';
  if (diff < 7 && diff > 1) {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date);
  }
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
}

function dayKey(timestamp) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayLabel(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((today - day) / 86400000);
  if (diff === 0) return 'Aujourd’hui';
  if (diff === 1) return 'Hier';
  const label = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(d);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

/* --------------------------------------------------------------------------
   3. Données par défaut
   -------------------------------------------------------------------------- */

function defaultActivities() {
  return [
    { id: 'a_lire', name: 'Lire quelques pages.' },
    { id: 'a_musique', name: 'Écouter de la musique.' },
    { id: 'a_promenade', name: 'Faire une petite promenade.' },
    { id: 'a_jeu', name: 'Jouer à un jeu.' },
    { id: 'a_tache', name: 'Faire une petite tâche utile.' },
    { id: 'a_regarder', name: 'Regarder quelque chose que tu apprécies.' },
    { id: 'a_etirements', name: 'Faire quelques étirements.' },
    { id: 'a_ranger', name: 'Ranger ou nettoyer un petit endroit.' },
    { id: 'a_ecrire', name: 'Écrire ou dessiner quelque chose.' },
    { id: 'a_rien', name: 'Prendre quelques minutes pour ne rien faire.' }
  ];
}

function defaultQuestionnaire() {
  const q = (id, text, yes, no) => ({ id, text, yes, no });
  const question = (id) => ({ kind: 'question', id });
  const result = (id) => ({ kind: 'result', id });

  return {
    startId: 'q_faim',
    questions: [
      q('q_faim',
        'As-tu une vraie faim physique — un ventre qui gargouille, un creux, une sensation de faiblesse ?',
        question('q_faim_type'), question('q_ennui')),
      q('q_faim_type',
        'Cette faim est-elle venue progressivement, et as-tu envie d’un repas qui rassasie plutôt que d’une seule chose sucrée ?',
        result('r_faim'), question('q_ennui')),
      q('q_ennui',
        'L’envie arrive-t-elle surtout quand tu t’ennuies ou que tu as un moment vide devant toi ?',
        result('r_ennui'), question('q_frustration')),
      q('q_frustration',
        'As-tu vécu quelque chose de contrariant ou de frustrant dans les dernières heures ?',
        result('r_frustration'), question('q_stress')),
      q('q_stress',
        'Te sens-tu tendu·e, inquiet·e, triste ou débordé·e en ce moment ?',
        result('r_stress'), question('q_habitude')),
      q('q_habitude',
        'Est-ce que tu grignotes souvent à cette heure-ci, presque sans y penser ?',
        result('r_habitude'), result('r_indetermine'))
    ],
    results: [
      {
        id: 'r_faim', category: 'faim',
        title: 'C’est probablement une vraie faim',
        message: 'Ton corps te demande de l’énergie. Rien ne sert de la faire attendre : choisis quelque chose qui te rassasie vraiment, et prends le temps de le manger. Une activité ne remplacera pas un repas.'
      },
      {
        id: 'r_ennui', category: 'ennui',
        title: 'C’est probablement de l’ennui',
        message: 'Ton envie semble venir d’un moment vide plutôt que d’une faim. Occuper tes mains ou ton esprit pendant quelques minutes suffit souvent à la faire passer.'
      },
      {
        id: 'r_frustration', category: 'frustration',
        title: 'C’est probablement de la frustration',
        message: 'Grignoter peut être une façon de faire retomber une contrariété. Reconnaître ce qui t’a agacé·e est déjà un premier pas ; bouger, écrire ou évacuer cette énergie peut aider.'
      },
      {
        id: 'r_stress', category: 'stress',
        title: 'C’est probablement une émotion',
        message: 'Le stress, l’inquiétude ou la tristesse donnent souvent envie de sucre ou de réconfort. Prends une minute pour respirer et nommer ce que tu ressens avant de décider.'
      },
      {
        id: 'r_habitude', category: 'habitude',
        title: 'C’est probablement une habitude',
        message: 'L’envie semble revenir à un moment familier, presque automatiquement. Changer le geste — boire un verre d’eau, sortir, t’occuper les mains — aide à casser le réflexe.'
      },
      {
        id: 'r_indetermine', category: 'indetermine',
        title: 'Une envie difficile à nommer',
        message: 'Ce n’est pas toujours évident de savoir d’où vient une envie. Tu n’as pas besoin de trancher : essaie une activité quelques minutes et observe si l’envie change.'
      }
    ]
  };
}

function defaultState() {
  return {
    schemaVersion: 1,
    activities: defaultActivities(),
    questionnaire: defaultQuestionnaire(),
    history: []
  };
}

/* --------------------------------------------------------------------------
   4. Stockage local
   -------------------------------------------------------------------------- */

function sanitizeTarget(target) {
  if (!target || typeof target !== 'object') return null;
  if (target.kind !== 'question' && target.kind !== 'result') return null;
  if (typeof target.id !== 'string' || !target.id) return null;
  return { kind: target.kind, id: target.id };
}

function sanitizeQuestionnaire(raw) {
  if (!raw || !Array.isArray(raw.questions) || !Array.isArray(raw.results)) return null;
  if (!raw.questions.length || !raw.results.length) return null;

  const results = raw.results
    .filter((r) => r && typeof r.id === 'string' && r.id)
    .map((r) => ({
      id: r.id,
      title: (typeof r.title === 'string' && r.title.trim()) ? r.title.trim().slice(0, 140) : 'Résultat',
      message: typeof r.message === 'string' ? r.message.slice(0, 1200) : '',
      category: Object.prototype.hasOwnProperty.call(CATEGORIES, r.category) ? r.category : 'indetermine'
    }));

  const questions = raw.questions
    .filter((q) => q && typeof q.id === 'string' && q.id)
    .map((q) => ({
      id: q.id,
      text: (typeof q.text === 'string' && q.text.trim()) ? q.text.trim().slice(0, 300) : 'Question',
      yes: sanitizeTarget(q.yes),
      no: sanitizeTarget(q.no)
    }));

  if (!results.length || !questions.length) return null;

  const questionIds = new Set(questions.map((q) => q.id));
  const resultIds = new Set(results.map((r) => r.id));
  for (const question of questions) {
    for (const target of [question.yes, question.no]) {
      if (!target) return null;
      if (target.kind === 'question' && !questionIds.has(target.id)) return null;
      if (target.kind === 'result' && !resultIds.has(target.id)) return null;
    }
  }

  return {
    startId: questionIds.has(raw.startId) ? raw.startId : questions[0].id,
    questions,
    results
  };
}

function loadState() {
  const base = defaultState();
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch (error) {
    raw = null;
  }
  if (!raw || typeof raw !== 'object') return base;

  const activities = Array.isArray(raw.activities)
    ? raw.activities
      .filter((a) => a && typeof a.name === 'string' && a.name.trim())
      .map((a) => ({
        id: (typeof a.id === 'string' && a.id) ? a.id : uid('a_'),
        name: a.name.trim().slice(0, 80)
      }))
    : base.activities;

  const questionnaire = sanitizeQuestionnaire(raw.questionnaire) || base.questionnaire;

  const history = Array.isArray(raw.history)
    ? raw.history
      .filter((h) => h && Number.isFinite(h.at) && (h.decision === 'activite' || h.decision === 'manger'))
      .map((h) => ({
        id: (typeof h.id === 'string' && h.id) ? h.id : uid('h_'),
        at: h.at,
        cause: Object.prototype.hasOwnProperty.call(CATEGORIES, h.cause) ? h.cause : 'indetermine',
        causeTitle: typeof h.causeTitle === 'string' ? h.causeTitle.slice(0, 160) : CATEGORIES[h.cause]?.label || 'Envie',
        decision: h.decision,
        activity: h.decision === 'activite' && typeof h.activity === 'string' ? h.activity.slice(0, 80) : null
      }))
      .sort((a, b) => b.at - a.at)
      .slice(0, MAX_HISTORY)
    : [];

  return { schemaVersion: 1, activities, questionnaire, history };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    toast('Impossible d’enregistrer les données sur cet appareil.');
  }
}

const state = loadState();

/* --------------------------------------------------------------------------
   5. Navigation
   -------------------------------------------------------------------------- */

const VALID_VIEWS = new Set([
  'home', 'activities', 'history', 'questionnaire',
  'quiz', 'result', 'activity', 'all', 'done'
]);

let current = readInitialState();
let editingActivityId = null;
let qTab = 'questions';
let deferredInstallPrompt = null;
let autosaveTimer = null;

function readInitialState() {
  const stored = history.state;
  if (stored && VALID_VIEWS.has(stored.view)) return stored;
  return { view: 'home', depth: 0 };
}

try {
  history.replaceState(current, '', location.href);
} catch (error) {
  /* file:// ou restriction navigateur : on continue sans historique d'état. */
}

function navigate(next, options = {}) {
  const { replace = false, scroll = true } = options;
  normalizeEmptyTexts();
  saveState();
  const baseDepth = (history.state && Number.isInteger(history.state.depth)) ? history.state.depth : 0;
  const nextState = Object.assign({}, next, { depth: replace ? 0 : baseDepth + 1 });
  try {
    if (replace) history.replaceState(nextState, '', location.href);
    else history.pushState(nextState, '', location.href);
  } catch (error) {
    /* pas d'historique disponible : l'écran change quand même */
  }
  current = nextState;
  editingActivityId = null;
  render({ scroll });
}

function normalizeEmptyTexts() {
  state.questionnaire.questions.forEach((question) => {
    if (!String(question.text || '').trim()) question.text = 'Question';
  });
  state.questionnaire.results.forEach((result) => {
    if (!String(result.title || '').trim()) result.title = 'Résultat';
  });
}

function goHome() {
  const depth = Number.isInteger(current.depth) ? current.depth : 0;
  if (depth > 0) {
    history.go(-depth);
  } else {
    navigate({ view: 'home' }, { replace: true });
  }
}

function goBack() {
  if (current.depth > 0) history.back();
  else navigate({ view: 'home' }, { replace: true });
}

window.addEventListener('popstate', (event) => {
  current = (event.state && VALID_VIEWS.has(event.state.view))
    ? event.state
    : { view: 'home', depth: 0 };
  editingActivityId = null;
  render({ scroll: true });
});

/* --------------------------------------------------------------------------
   6. Rendu
   -------------------------------------------------------------------------- */

function render(options = {}) {
  const { scroll = true } = options;
  const view = current.view;
  let html;

  switch (view) {
    case 'quiz':
      html = renderQuiz();
      break;
    case 'result':
      html = renderResult();
      break;
    case 'activity':
      html = renderActivity();
      break;
    case 'all':
      html = renderAllActivities();
      break;
    case 'done':
      html = renderDone();
      break;
    case 'activities':
      html = appShell(renderActivitiesPage(), 'activities');
      break;
    case 'history':
      html = appShell(renderHistoryPage(), 'history');
      break;
    case 'questionnaire':
      html = appShell(renderQuestionnairePage(), 'questionnaire');
      break;
    default:
      html = appShell(renderHome(), 'home');
  }

  app.innerHTML = html;
  document.body.dataset.view = view;

  const announce = app.querySelector('[data-announce]');
  live.textContent = announce ? announce.textContent.replace(/\s+/g, ' ').trim() : '';

  if (scroll) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  if (editingActivityId) {
    const input = app.querySelector('[data-autofocus]');
    if (input) {
      input.focus();
      input.select();
    }
  }
}

function appShell(content, activeTab) {
  return `
    <div class="shell">
      <header class="topbar">
        <button class="brand" data-action="home" aria-label="StopGrignottage, revenir à l’accueil">
          <span class="brand-mark">${icon('leaf', 20)}</span>
          <span class="brand-name">StopGrignottage</span>
        </button>
        <button class="icon-btn ${activeTab === 'questionnaire' ? 'is-active' : ''}" data-action="settings" aria-label="Personnaliser le questionnaire" title="Questionnaire">
          ${icon('settings', 21)}
        </button>
      </header>
      <main class="main" id="main">${content}</main>
      ${tabbar(activeTab)}
    </div>`;
}

function tabbar(activeTab) {
  const tabs = [
    ['home', 'Aujourd’hui', 'home'],
    ['activities', 'Activités', 'list'],
    ['history', 'Historique', 'chart']
  ];
  return `
    <nav class="tabbar" aria-label="Navigation principale">
      ${tabs.map(([view, label, iconName]) => `
        <button class="tab ${activeTab === view ? 'is-active' : ''}" data-action="go" data-view="${view}" ${activeTab === view ? 'aria-current="page"' : ''}>
          ${icon(iconName, 21)}
          <span>${label}</span>
        </button>`).join('')}
    </nav>`;
}

function flowHeader(label) {
  return `
    <header class="topbar topbar-flow">
      <button class="icon-btn" data-action="back" aria-label="Revenir en arrière">${icon('arrow-left', 21)}</button>
      <span class="flow-title">${escapeHTML(label || '')}</span>
      <span class="topbar-spacer" aria-hidden="true"></span>
    </header>`;
}

/* ---------- Accueil ---------- */

function renderHome() {
  const total = state.history.length;
  const activityCount = state.history.filter((entry) => entry.decision === 'activite').length;
  const lastActivity = state.history.find((entry) => entry.decision === 'activite');

  return `
    <section class="hero">
      <div class="hero-art" aria-hidden="true">${icon('leaf', 34)}</div>
      <p class="eyebrow">Un moment pour toi</p>
      <h1 data-announce>Et si on écoutait cette envie ?</h1>
      <p class="lead">Quelques questions pour comprendre ce qui se passe, puis une idée pour faire autrement — sans culpabilité.</p>
      <button class="btn btn-primary btn-lg btn-block hero-cta" data-action="start">
        Faire le point ${icon('arrow-right', 19)}
      </button>

      ${total ? `
        <div class="stat-strip">
          <div><strong>${total}</strong><span>envie${plural(total, '', 's')} observée${plural(total, '', 's')}</span></div>
          <div><strong>${activityCount}</strong><span>activité${plural(activityCount, '', 's')} choisie${plural(activityCount, '', 's')}</span></div>
        </div>` : ''}

      <p class="home-note">${icon('lock', 15)}<span>Tout reste sur ton téléphone. Aucune donnée n’est envoyée.</span></p>
    </section>

    <div class="quick-grid">
      <button class="quick-card" data-action="go" data-view="activities">
        <span class="quick-card-icon">${icon('list', 19)}</span>
        <span class="quick-card-label">Mes activités</span>
        <small>${state.activities.length} idée${plural(state.activities.length, '', 's')} pour faire autrement</small>
      </button>
      <button class="quick-card" data-action="go" data-view="history">
        <span class="quick-card-icon">${icon('chart', 19)}</span>
        <span class="quick-card-label">Mon historique</span>
        <small>${total
          ? `${lastActivity ? 'Dernière activité ' + formatShortDate(lastActivity.at) : 'Aucune activité choisie'}`
          : 'Aucune envie notée pour l’instant'}</small>
      </button>
    </div>

    ${(deferredInstallPrompt && !isStandalone()) ? `
      <button class="install-card" data-action="install">
        <span class="install-card-icon">${icon('smartphone', 19)}</span>
        <span>
          <strong>Installer sur ton téléphone</strong>
          <small>Comme une vraie application, et accessible hors connexion.</small>
        </span>
      </button>` : ''}

    <p class="home-footer">Un outil d’observation, pas un régime.<br>Tu peux arrêter à tout moment.</p>`;
}

/* ---------- Questionnaire ---------- */

function renderQuiz() {
  const question = getQuestion(current.qid);
  if (!question) {
    return `
      <div class="shell">
        ${flowHeader('Questionnaire')}
        <main class="main main-flow">
          <div class="quiz-center">
            <p class="lead">Cette question n’existe plus.</p>
            <button class="btn btn-primary" data-action="restart" style="margin-top:20px">Recommencer</button>
          </div>
        </main>
      </div>`;
  }

  const step = Number.isInteger(current.step) ? current.step : 1;
  const yesFirst = Math.random() < 0.5;
  const yesButton = `<button class="answer answer-yes" data-action="answer" data-branch="yes">Oui</button>`;
  const noButton = `<button class="answer answer-no" data-action="answer" data-branch="no">Non</button>`;
  const progress = Math.min(88, 16 + step * 14);

  return `
    <div class="shell">
      ${flowHeader(`Question ${step}`)}
      <main class="main main-flow">
        <div class="quiz-center">
          <p class="eyebrow">On prend une minute</p>
          <h1 class="question" data-announce>${escapeHTML(question.text)}</h1>
          <div class="answer-row">${yesFirst ? yesButton + noButton : noButton + yesButton}</div>
          <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${progress}%"></div></div>
          <p class="quiz-hint">Pas de bonne ou de mauvaise réponse.</p>
        </div>
      </main>
    </div>`;
}

function renderResult() {
  const result = getResult(current.resultId);
  if (!result) {
    return `
      <div class="shell">
        ${flowHeader('Résultat')}
        <main class="main main-flow">
          <div class="result-wrap">
            <p class="lead">Ce résultat n’existe plus.</p>
            <button class="btn btn-primary" data-action="restart" style="margin-top:20px">Recommencer</button>
          </div>
        </main>
      </div>`;
  }

  const category = categoryOf(result.category);
  const isHunger = result.category === 'faim';

  return `
    <div class="shell">
      ${flowHeader('Résultat')}
      <main class="main main-flow">
        <div class="result-wrap">
          <span class="cause-badge" style="${categoryStyle(result.category)}">
            <span class="cause-icon">${icon(category.icon, 15)}</span>
            ${escapeHTML(category.label)}
          </span>
          <h1 class="result-title" data-announce>${escapeHTML(result.title)}</h1>
          <p class="result-text">${escapeHTML(result.message)}</p>

          <div class="result-actions">
            ${isHunger ? `
              <button class="btn btn-primary btn-lg btn-block" data-action="eat" data-result="${result.id}">
                ${icon('utensils', 18)} Manger quelque chose
              </button>
              <button class="btn btn-secondary btn-block" data-action="activity-round" data-result="${result.id}">
                Essayer une activité quand même
              </button>` : `
              <button class="btn btn-primary btn-lg btn-block" data-action="activity-round" data-result="${result.id}">
                Choisir une activité ${icon('arrow-right', 18)}
              </button>
              <button class="btn btn-secondary btn-block" data-action="eat" data-result="${result.id}">
                Finalement, je vais manger
              </button>`}
          </div>

          <div class="result-foot">
            <button class="btn-link" data-action="restart">Refaire le questionnaire</button>
          </div>
        </div>
      </main>
    </div>`;
}

/* ---------- Activités proposées ---------- */

function renderActivity() {
  const queue = Array.isArray(current.queue) ? current.queue : [];
  if (!queue.length) return renderAllActivities();

  const activity = state.activities.find((item) => item.id === queue[0]);
  if (!activity) return renderAllActivities();

  const total = state.activities.length;
  const index = Math.max(1, total - queue.length + 1);

  return `
    <div class="shell">
      ${flowHeader(`Idée ${index} sur ${total}`)}
      <main class="main main-flow">
        <div class="activity-wrap">
          <div class="activity-card">
            <div class="activity-icon">${icon('sparkles', 28)}</div>
            <h1 class="activity-name" data-announce>${escapeHTML(activity.name)}</h1>
            <p class="activity-meta">Une idée parmi d’autres, à prendre ou à laisser.</p>
          </div>

          <div class="activity-actions">
            <button class="btn btn-primary btn-lg btn-block" data-action="accept-activity" data-id="${activity.id}">
              Ça me tente
            </button>
            <button class="btn btn-secondary btn-block" data-action="refuse-activity">
              Une autre idée
            </button>
          </div>

          <div class="activity-secondary">
            <button class="btn-link" data-action="see-all">Voir les ${total} activités</button>
            <button class="btn-link" data-action="eat" data-result="${current.resultId}">Finalement, je vais manger</button>
          </div>
        </div>
      </main>
    </div>`;
}

function renderAllActivities() {
  const activities = state.activities;

  return `
    <div class="shell">
      ${flowHeader('Toutes les idées')}
      <main class="main main-flow">
        <div class="all-head">
          <p class="eyebrow">À toi de choisir</p>
          <h1 data-announce>Toutes les idées</h1>
          <p class="lead">Tu as demandé à voir toutes les options. Prends celle qui te parle le plus, ou ajoute la tienne.</p>
        </div>

        <div class="add-top">
          <button class="btn btn-secondary btn-block" data-action="quick-add">
            ${icon('plus', 18)} Ajouter une activité
          </button>
        </div>

        ${activities.length ? `
          <ul class="activity-list">
            ${activities.map((activity, index) => `
              <li>
                <button class="activity-choice" data-action="choose-activity" data-id="${activity.id}">
                  <span class="num">${String(index + 1).padStart(2, '0')}</span>
                  <span>${escapeHTML(activity.name)}</span>
                  <span class="go">${icon('chevron-right', 18)}</span>
                </button>
              </li>`).join('')}
          </ul>` : `
          <div class="empty">
            <div class="empty-icon">${icon('list', 24)}</div>
            <h2>Ta liste est vide</h2>
            <p>Ajoute une première activité pour pouvoir choisir autre chose.</p>
          </div>`}

        <div class="activity-secondary all-eat">
          <button class="btn-link" data-action="eat" data-result="${current.resultId}">Finalement, je vais manger</button>
        </div>
      </main>
    </div>`;
}

/* ---------- Terminé ---------- */

function renderDone() {
  const entry = state.history.find((item) => item.id === current.entryId) || state.history[0];
  if (!entry) {
    return appShell(renderHome(), 'home');
  }

  const category = categoryOf(entry.cause);
  const ate = entry.decision === 'manger';

  return `
    <div class="shell">
      ${flowHeader('Terminé')}
      <main class="main main-flow">
        <div class="done-wrap">
          <div class="done-ring ${ate ? 'is-eat' : ''}">
            ${icon(ate ? 'utensils' : 'check', 38)}
          </div>
          <h1 data-announce>${ate ? 'C’est noté.' : 'Bien joué.'}</h1>
          <p class="lead">${ate
            ? 'Manger fait aussi partie des réponses possibles. L’important est de l’avoir choisi en conscience, pas par automatisme.'
            : 'Tu as trouvé une autre façon de répondre à cette envie. Prends le temps de profiter de ce moment.'}</p>

          <div class="done-card">
            <span class="done-label">${ate ? 'Décision' : 'Activité choisie'}</span>
            <div class="done-main">${ate ? 'Manger quelque chose' : escapeHTML(entry.activity || 'Une activité')}</div>
            <div class="done-sub">Cause identifiée : ${escapeHTML(category.label)}</div>
          </div>

          <div class="done-actions">
            <button class="btn btn-primary btn-lg btn-block" data-action="home">Revenir à l’accueil</button>
            <button class="btn btn-ghost btn-block" data-action="go" data-view="history">Voir mon historique</button>
          </div>
        </div>
      </main>
    </div>`;
}

/* ---------- Page activités ---------- */

function renderActivitiesPage() {
  const activities = state.activities;

  return `
    <section class="page-head">
      <p class="eyebrow">À ton rythme</p>
      <h1 class="page-title" data-announce>Mes activités</h1>
      <p class="lead">Ces idées te sont proposées quand l’envie n’est pas une vraie faim. Ajoute, renomme ou supprime les tiennes.</p>
      <p class="auto-save-note">${icon('check', 14)} Enregistré automatiquement sur cet appareil</p>
    </section>

    <div class="add-top">
      <form class="add-form" data-form="add-activity">
        <label class="sr-only" for="new-activity">Nouvelle activité</label>
        <input id="new-activity" name="name" type="text" maxlength="80" placeholder="Ajouter une idée…" autocomplete="off">
        <button class="btn btn-primary" type="submit" aria-label="Ajouter l’activité">${icon('plus', 20)}</button>
      </form>
    </div>

    <p class="section-title"><span>${activities.length} idée${plural(activities.length, '', 's')}</span></p>

    ${activities.length ? `
      <ul class="items">
        ${activities.map((activity, index) => editingActivityId === activity.id ? `
          <li class="item item-edit">
            <form class="add-form" data-form="edit-activity" data-id="${activity.id}" style="width:100%">
              <label class="sr-only" for="edit-${activity.id}">Modifier l’activité</label>
              <input id="edit-${activity.id}" name="name" type="text" maxlength="80" value="${escapeHTML(activity.name)}" data-autofocus>
              <button class="icon-btn" type="submit" aria-label="Enregistrer">${icon('check', 18)}</button>
              <button class="icon-btn" type="button" data-action="cancel-edit" aria-label="Annuler">${icon('x', 18)}</button>
            </form>
          </li>` : `
          <li class="item">
            <span class="item-num">${String(index + 1).padStart(2, '0')}</span>
            <span class="item-name">${escapeHTML(activity.name)}</span>
            <span class="item-actions">
              <button class="icon-btn" data-action="edit-activity" data-id="${activity.id}" aria-label="Modifier : ${escapeHTML(activity.name)}">${icon('pencil', 17)}</button>
              <button class="icon-btn danger" data-action="delete-activity" data-id="${activity.id}" aria-label="Supprimer : ${escapeHTML(activity.name)}">${icon('trash', 17)}</button>
            </span>
          </li>`).join('')}
      </ul>` : `
      <div class="empty">
        <div class="empty-icon">${icon('list', 24)}</div>
        <h2>Aucune activité</h2>
        <p>Ajoute une idée simple que tu peux commencer tout de suite.</p>
      </div>`}
  `;
}

/* ---------- Page historique ---------- */

function renderHistoryPage() {
  const entries = state.history;

  const head = `
    <section class="page-head">
      <p class="eyebrow">Ce que tu as observé</p>
      <h1 class="page-title" data-announce>Mon historique</h1>
      <p class="lead">Chaque questionnaire terminé est enregistré ici, avec la cause identifiée et ta décision. Rien n’est envoyé sur Internet.</p>
    </section>`;

  if (!entries.length) {
    return `${head}
      <div class="empty">
        <div class="empty-icon">${icon('chart', 24)}</div>
        <h2>Rien à afficher pour l’instant</h2>
        <p>Après ton premier questionnaire, tu retrouveras ici ce que tu as observé et choisi.</p>
        <button class="btn btn-primary" data-action="start">Faire le point</button>
      </div>`;
  }

  const total = entries.length;
  const activityCount = entries.filter((entry) => entry.decision === 'activite').length;
  const eatCount = total - activityCount;
  const weekCount = entries.filter((entry) => entry.at >= Date.now() - 7 * 86400000).length;

  const causeCounts = {};
  entries.forEach((entry) => {
    causeCounts[entry.cause] = (causeCounts[entry.cause] || 0) + 1;
  });
  const causeRows = Object.keys(causeCounts)
    .map((key) => ({ key, count: causeCounts[key], category: categoryOf(key) }))
    .sort((a, b) => b.count - a.count);

  const activityCounts = {};
  entries.forEach((entry) => {
    if (entry.decision === 'activite' && entry.activity) {
      activityCounts[entry.activity] = (activityCounts[entry.activity] || 0) + 1;
    }
  });
  const topActivities = Object.keys(activityCounts)
    .map((name) => ({ name, count: activityCounts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const groups = [];
  let lastKey = null;
  entries.forEach((entry) => {
    const key = dayKey(entry.at);
    if (key !== lastKey) {
      groups.push({ key, label: dayLabel(entry.at), entries: [] });
      lastKey = key;
    }
    groups[groups.length - 1].entries.push(entry);
  });

  return `${head}
    <div class="stats-grid">
      <div class="stat-card accent">
        <span class="stat-value">${total}</span>
        <span class="stat-label">envie${plural(total, '', 's')} observée${plural(total, '', 's')}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${weekCount}</span>
        <span class="stat-label">ces 7 derniers jours</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${activityCount}</span>
        <span class="stat-label">activité${plural(activityCount, '', 's')} choisie${plural(activityCount, '', 's')}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${eatCount}</span>
        <span class="stat-label">fois où tu as choisi de manger</span>
      </div>
    </div>

    <p class="section-title"><span>Causes identifiées</span><span class="count">${total} au total</span></p>
    <div class="bars">
      ${causeRows.map((row) => `
        <div class="bar-row">
          <span class="bar-label">${escapeHTML(row.category.label)}</span>
          <span class="bar-track">
            <span class="bar-fill" style="width:${Math.max(4, Math.round(row.count / total * 100))}%;--bar-color:var(${row.category.cssVar})"></span>
          </span>
          <span class="bar-count">${row.count}</span>
        </div>`).join('')}
    </div>

    ${topActivities.length ? `
      <p class="section-title"><span>Activités qui reviennent</span></p>
      <ul class="top-list">
        ${topActivities.map((item, index) => `
          <li>
            <span class="rank">${index + 1}</span>
            <span class="top-name">${escapeHTML(item.name)}</span>
            <span class="top-count">${item.count}×</span>
          </li>`).join('')}
      </ul>` : ''}

    ${groups.map((group) => `
      <div class="day-group">
        <p class="day-label">${escapeHTML(group.label)}</p>
        ${group.entries.map((entry) => {
          const category = categoryOf(entry.cause);
          return `
            <article class="history-entry">
              <span class="history-dot" style="--dot:var(${category.cssVar})"></span>
              <div class="history-main">
                <div class="history-top">
                  <span class="history-cause">${escapeHTML(category.label)}</span>
                  <span class="history-time">${formatTime(entry.at)}</span>
                </div>
                <p class="history-detail ${entry.decision === 'manger' ? 'is-eat' : ''}">
                  ${entry.decision === 'manger'
                    ? 'A choisi de manger'
                    : `Activité choisie : ${escapeHTML(entry.activity || '—')}`}
                </p>
              </div>
            </article>`;
        }).join('')}
      </div>`).join('')}

    <div class="danger-zone">
      <button class="btn btn-danger btn-block" data-action="clear-history">
        ${icon('trash', 18)} Effacer tout l’historique
      </button>
    </div>`;
}

/* ---------- Page questionnaire ---------- */

function targetOptions(selected, excludeQuestionId) {
  const questions = state.questionnaire.questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.id !== excludeQuestionId);
  const selectedValue = selected ? targetValue(selected) : '';
  return `
    <optgroup label="Questions">
      ${questions.map(({ question, index }) => `<option value="question:${question.id}" ${selectedValue === 'question:' + question.id ? 'selected' : ''}>Q${index + 1} · ${escapeHTML(truncate(question.text, 44))}</option>`).join('')}
    </optgroup>
    <optgroup label="Résultats">
      ${state.questionnaire.results.map((result, index) => `<option value="result:${result.id}" ${selectedValue === 'result:' + result.id ? 'selected' : ''}>R${index + 1} · ${escapeHTML(truncate(result.title, 44))}</option>`).join('')}
    </optgroup>`;
}

function renderQuestionnairePage() {
  const questionnaire = state.questionnaire;

  const tabs = `
    <div class="segmented" role="tablist" aria-label="Questions ou résultats">
      <button role="tab" aria-selected="${qTab === 'questions'}" class="${qTab === 'questions' ? 'is-active' : ''}" data-action="qtab" data-tab="questions">Questions</button>
      <button role="tab" aria-selected="${qTab === 'results'}" class="${qTab === 'results' ? 'is-active' : ''}" data-action="qtab" data-tab="results">Résultats</button>
    </div>`;

  const head = `
    <section class="page-head">
      <p class="eyebrow">À ta façon</p>
      <h1 class="page-title" data-announce>Personnaliser le questionnaire</h1>
      <p class="lead">Modifie le texte des questions, choisis où mènent OUI et NON, et adapte les résultats. L’ordre des boutons reste aléatoire.</p>
      <p class="auto-save-note">${icon('check', 14)} Enregistré automatiquement sur cet appareil</p>
    </section>`;

  const resetZone = `
    <div class="danger-zone">
      <button class="btn btn-danger btn-block" data-action="reset-questionnaire">
        ${icon('refresh', 18)} Rétablir le questionnaire d’origine
      </button>
      <p class="small muted center" style="margin-top:8px">Tes activités et ton historique ne sont pas modifiés.</p>
    </div>`;

  if (qTab === 'results') {
    return `${head}${tabs}
      <div class="stack">
        ${questionnaire.results.map((result, index) => `
          <article class="editor-card">
            <div class="editor-card-head">
              <span class="pill">Résultat ${index + 1}</span>
              <button class="icon-btn danger" data-action="delete-result" data-rid="${result.id}" aria-label="Supprimer ce résultat">${icon('trash', 17)}</button>
            </div>
            <div class="stack">
              <label class="field">
                <span>Titre</span>
                <input type="text" maxlength="140" value="${escapeHTML(result.title)}" data-edit="result-title" data-rid="${result.id}">
              </label>
              <label class="field">
                <span>Message</span>
                <textarea rows="4" maxlength="1200" data-edit="result-message" data-rid="${result.id}">${escapeHTML(result.message)}</textarea>
              </label>
              <label class="field">
                <span>Catégorie</span>
                <select data-edit="result-category" data-rid="${result.id}">
                  ${Object.keys(CATEGORIES).map((key) => `<option value="${key}" ${result.category === key ? 'selected' : ''}>${escapeHTML(CATEGORIES[key].label)}</option>`).join('')}
                </select>
              </label>
            </div>
          </article>`).join('')}
      </div>
      <div class="editor-actions">
        <button class="btn btn-secondary" data-action="add-result">${icon('plus', 18)} Ajouter un résultat</button>
      </div>
      ${resetZone}`;
  }

  return `${head}${tabs}
    <div class="start-card">
      <label class="field">
        <span>Question de départ</span>
        <select data-edit="start">
          ${questionnaire.questions.map((q, index) => `<option value="${q.id}" ${questionnaire.startId === q.id ? 'selected' : ''}>Q${index + 1} · ${escapeHTML(truncate(q.text, 56))}</option>`).join('')}
        </select>
      </label>
    </div>

    <div class="stack" style="margin-top:14px">
      ${questionnaire.questions.map((question, index) => `
        <article class="editor-card">
          <div class="editor-card-head">
            <span class="pill">Question ${index + 1}</span>
            <button class="icon-btn danger" data-action="delete-question" data-qid="${question.id}" aria-label="Supprimer cette question">${icon('trash', 17)}</button>
          </div>
          <label class="field">
            <span>Texte de la question</span>
            <textarea rows="2" maxlength="300" data-edit="question-text" data-qid="${question.id}">${escapeHTML(question.text)}</textarea>
          </label>
          <div class="branch-grid">
            <label class="field">
              <span>Si OUI</span>
              <select data-edit="branch" data-qid="${question.id}" data-branch="yes">
                ${targetOptions(question.yes, question.id)}
              </select>
            </label>
            <label class="field">
              <span>Si NON</span>
              <select data-edit="branch" data-qid="${question.id}" data-branch="no">
                ${targetOptions(question.no, question.id)}
              </select>
            </label>
          </div>
        </article>`).join('')}
    </div>

    <div class="editor-actions">
      <button class="btn btn-secondary" data-action="add-question">${icon('plus', 18)} Ajouter une question</button>
    </div>
    ${resetZone}`;
}

/* --------------------------------------------------------------------------
   7. Actions
   -------------------------------------------------------------------------- */

function startQuiz() {
  const startId = state.questionnaire.startId;
  if (!getQuestion(startId)) {
    toast('Le questionnaire est incomplet.');
    return;
  }
  navigate({ view: 'quiz', qid: startId, step: 1 });
}

function answerQuestion(branch) {
  const question = getQuestion(current.qid);
  if (!question) return;
  const target = question[branch];
  if (!target) return;

  if (target.kind === 'result') {
    if (!getResult(target.id)) {
      toast('Ce résultat n’existe plus.');
      return;
    }
    navigate({ view: 'result', resultId: target.id });
    return;
  }

  if (!getQuestion(target.id)) {
    toast('Cette question n’existe plus.');
    return;
  }

  const nextStep = (current.step || 1) + 1;
  if (nextStep > 30) {
    toast('Le questionnaire tourne en boucle. Vérifie les branchements.');
    return;
  }
  navigate({ view: 'quiz', qid: target.id, step: nextStep });
}

function startActivityRound(resultId) {
  if (!getResult(resultId)) {
    toast('Ce résultat n’existe plus.');
    return;
  }
  if (!state.activities.length) {
    navigate({ view: 'all', resultId });
    return;
  }
  navigate({ view: 'activity', resultId, queue: shuffle(state.activities.map((activity) => activity.id)) });
}

function acceptActivity(activityId) {
  const activity = state.activities.find((item) => item.id === activityId);
  if (!activity) {
    toast('Cette activité n’existe plus.');
    return;
  }
  if (!current.resultId || !getResult(current.resultId)) {
    toast('Le résultat a été perdu. Recommence le questionnaire.');
    return;
  }
  recordDecision(current.resultId, 'activite', activity.name);
}

function refuseActivity() {
  const queue = Array.isArray(current.queue) ? current.queue.slice(1) : [];
  if (queue.length) {
    navigate({ view: 'activity', resultId: current.resultId, queue });
  } else {
    navigate({ view: 'all', resultId: current.resultId });
  }
}

function recordDecision(resultId, decision, activityName) {
  const result = getResult(resultId);
  if (!result) {
    toast('Impossible d’enregistrer : résultat introuvable.');
    return;
  }
  const category = Object.prototype.hasOwnProperty.call(CATEGORIES, result.category)
    ? result.category
    : 'indetermine';

  const entry = {
    id: uid('h_'),
    at: Date.now(),
    cause: category,
    causeTitle: result.title,
    decision,
    activity: decision === 'activite' ? (activityName || 'Une activité') : null
  };

  state.history.unshift(entry);
  if (state.history.length > MAX_HISTORY) state.history.length = MAX_HISTORY;
  saveState();
  navigate({ view: 'done', entryId: entry.id });
}

/* ---------- Activités : ajout / édition ---------- */

function addActivity(name) {
  const clean = String(name || '').trim().slice(0, 80);
  if (!clean) {
    toast('Le nom de l’activité ne peut pas être vide.');
    return false;
  }
  state.activities.push({ id: uid('a_'), name: clean });
  saveState();
  render({ scroll: false });
  return true;
}

async function quickAddActivity() {
  const name = await promptDialog({
    title: 'Ajouter une activité',
    message: 'Une idée simple, que tu peux commencer tout de suite.',
    label: 'Nom de l’activité',
    placeholder: 'Ex. Appeler un ami',
    confirmLabel: 'Ajouter',
    iconName: 'plus',
    maxlength: 80
  });
  if (name === null || name === false || name === '') return;
  if (addActivity(name)) {
    toast('Activité ajoutée.');
    requestAnimationFrame(() => {
      const choices = app.querySelectorAll('.activity-choice');
      const last = choices[choices.length - 1];
      if (last) {
        last.scrollIntoView({ block: 'center', behavior: 'smooth' });
        last.classList.add('is-new');
        setTimeout(() => last.classList.remove('is-new'), 1400);
      }
    });
  }
}

async function deleteActivity(activityId) {
  const activity = state.activities.find((item) => item.id === activityId);
  if (!activity) return;
  const confirmed = await confirmDialog({
    title: 'Supprimer cette activité ?',
    message: `« ${truncate(activity.name, 100)} » ne sera plus proposée.`,
    confirmLabel: 'Supprimer',
    danger: true
  });
  if (!confirmed) return;
  state.activities = state.activities.filter((item) => item.id !== activityId);
  if (editingActivityId === activityId) editingActivityId = null;
  saveState();
  render({ scroll: false });
  toast('Activité supprimée.');
}

/* ---------- Questionnaire : questions et résultats ---------- */

async function addQuestion() {
  if (!state.questionnaire.results.length) {
    toast('Ajoute d’abord un résultat.');
    return;
  }
  const text = await promptDialog({
    title: 'Nouvelle question',
    message: 'Elle ne sera utilisée qu’une fois reliée à un branchement.',
    label: 'Texte de la question',
    placeholder: 'Que veux-tu demander ?',
    confirmLabel: 'Ajouter',
    iconName: 'plus',
    maxlength: 300
  });
  if (!text) return;

  const fallback = { kind: 'result', id: state.questionnaire.results[0].id };
  state.questionnaire.questions.push({
    id: uid('q_'),
    text: text.slice(0, 300),
    yes: { ...fallback },
    no: { ...fallback }
  });
  saveState();
  render({ scroll: false });
  toast('Question ajoutée. Relie-la avec un branchement.');
}

async function deleteQuestion(questionId) {
  const question = getQuestion(questionId);
  if (!question) return;

  if (state.questionnaire.questions.length <= 1) {
    toast('Il faut garder au moins une question.');
    return;
  }

  const references = state.questionnaire.questions.filter((other) => (
    other.id !== questionId && (
      (other.yes.kind === 'question' && other.yes.id === questionId) ||
      (other.no.kind === 'question' && other.no.id === questionId)
    )
  ));
  if (references.length) {
    toast(`Utilisée par « ${truncate(references[0].text, 38)} ». Modifie d’abord ce branchement.`);
    return;
  }

  const confirmed = await confirmDialog({
    title: 'Supprimer cette question ?',
    message: truncate(question.text, 140),
    confirmLabel: 'Supprimer',
    danger: true
  });
  if (!confirmed) return;

  state.questionnaire.questions = state.questionnaire.questions.filter((item) => item.id !== questionId);
  if (state.questionnaire.startId === questionId) {
    state.questionnaire.startId = state.questionnaire.questions[0].id;
  }
  saveState();
  render({ scroll: false });
  toast('Question supprimée.');
}

async function addResult() {
  const title = await promptDialog({
    title: 'Nouveau résultat',
    message: 'Tu pourras ensuite écrire son message et choisir sa catégorie.',
    label: 'Titre du résultat',
    placeholder: 'Ex. C’est probablement de la fatigue',
    confirmLabel: 'Ajouter',
    iconName: 'plus',
    maxlength: 140
  });
  if (!title) return;

  state.questionnaire.results.push({
    id: uid('r_'),
    title: title.slice(0, 140),
    message: '',
    category: 'indetermine'
  });
  saveState();
  render({ scroll: false });
  toast('Résultat ajouté. Complète son message.');
}

async function deleteResult(resultId) {
  const result = getResult(resultId);
  if (!result) return;

  if (state.questionnaire.results.length <= 1) {
    toast('Il faut garder au moins un résultat.');
    return;
  }

  const references = state.questionnaire.questions.filter((question) => (
    (question.yes.kind === 'result' && question.yes.id === resultId) ||
    (question.no.kind === 'result' && question.no.id === resultId)
  ));
  if (references.length) {
    toast(`Utilisé par « ${truncate(references[0].text, 38)} ». Modifie d’abord ce branchement.`);
    return;
  }

  const confirmed = await confirmDialog({
    title: 'Supprimer ce résultat ?',
    message: truncate(result.title, 120),
    confirmLabel: 'Supprimer',
    danger: true
  });
  if (!confirmed) return;

  state.questionnaire.results = state.questionnaire.results.filter((item) => item.id !== resultId);
  saveState();
  render({ scroll: false });
  toast('Résultat supprimé.');
}

async function resetQuestionnaire() {
  const confirmed = await confirmDialog({
    title: 'Rétablir le questionnaire d’origine ?',
    message: 'Tes modifications sur les questions et les résultats seront remplacées. Tes activités et ton historique restent intacts.',
    confirmLabel: 'Rétablir',
    danger: true
  });
  if (!confirmed) return;
  state.questionnaire = defaultQuestionnaire();
  qTab = 'questions';
  saveState();
  render({ scroll: false });
  toast('Questionnaire d’origine rétabli.');
}

async function clearHistory() {
  const confirmed = await confirmDialog({
    title: 'Effacer tout l’historique ?',
    message: 'Les observations et les statistiques seront supprimées. Cette action est définitive.',
    confirmLabel: 'Effacer',
    danger: true
  });
  if (!confirmed) return;
  state.history = [];
  saveState();
  render({ scroll: false });
  toast('Historique effacé.');
}

/* --------------------------------------------------------------------------
   8. Dialogues
   -------------------------------------------------------------------------- */

const dialogEl = document.getElementById('dialog');
const dialogForm = document.getElementById('dialog-form');
const dialogTitle = document.getElementById('dialog-title');
const dialogMessage = document.getElementById('dialog-message');
const dialogIcon = document.getElementById('dialog-icon');
const dialogField = document.getElementById('dialog-field');
const dialogLabel = document.getElementById('dialog-label');
const dialogInput = document.getElementById('dialog-input');
const dialogCancel = document.getElementById('dialog-cancel');
const dialogConfirm = document.getElementById('dialog-confirm');

function openDialog(options) {
  const {
    title,
    message = '',
    label = 'Valeur',
    placeholder = '',
    value = '',
    confirmLabel = 'Valider',
    cancelLabel = 'Annuler',
    danger = false,
    iconName = 'help',
    withInput = false,
    maxlength = 140
  } = options;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      if (dialogEl.open) dialogEl.close();
      resolve(result);
    };

    dialogTitle.textContent = title;
    dialogMessage.textContent = message;
    dialogMessage.hidden = !message;
    dialogIcon.innerHTML = icon(danger ? 'trash' : iconName, 20);
    dialogIcon.classList.toggle('is-danger', Boolean(danger));
    dialogConfirm.textContent = confirmLabel;
    dialogConfirm.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
    dialogCancel.textContent = cancelLabel;

    dialogField.hidden = !withInput;
    if (withInput) {
      dialogLabel.textContent = label;
      dialogInput.value = value;
      dialogInput.placeholder = placeholder;
      dialogInput.maxLength = maxlength;
    }

    dialogForm.onsubmit = (event) => {
      event.preventDefault();
      if (withInput) {
        const text = dialogInput.value.trim();
        if (!text) {
          dialogInput.focus();
          return;
        }
        finish(text);
      } else {
        finish(true);
      }
    };

    dialogCancel.onclick = () => finish(withInput ? null : false);
    dialogEl.oncancel = (event) => {
      event.preventDefault();
      finish(withInput ? null : false);
    };
    dialogEl.onclick = (event) => {
      if (event.target === dialogEl) finish(withInput ? null : false);
    };

    dialogEl.showModal();
    if (withInput) {
      setTimeout(() => {
        dialogInput.focus();
        dialogInput.select();
      }, 40);
    }
  });
}

function confirmDialog(options) {
  return openDialog(Object.assign({}, options, { withInput: false }));
}

function promptDialog(options) {
  return openDialog(Object.assign({}, options, { withInput: true }));
}

/* --------------------------------------------------------------------------
   9. Événements
   -------------------------------------------------------------------------- */

app.addEventListener('click', (event) => {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl || !app.contains(actionEl)) return;
  event.preventDefault();

  const action = actionEl.dataset.action;

  switch (action) {
    case 'home':
      goHome();
      break;

    case 'back':
      goBack();
      break;

    case 'go': {
      const view = actionEl.dataset.view;
      if (VALID_VIEWS.has(view) && current.view !== view) {
        navigate({ view });
      }
      break;
    }

    case 'settings':
      if (current.view !== 'questionnaire') navigate({ view: 'questionnaire' });
      break;

    case 'start':
    case 'restart':
      startQuiz();
      break;

    case 'answer':
      answerQuestion(actionEl.dataset.branch);
      break;

    case 'activity-round':
      startActivityRound(actionEl.dataset.result);
      break;

    case 'eat':
      recordDecision(actionEl.dataset.result, 'manger');
      break;

    case 'accept-activity':
    case 'choose-activity':
      acceptActivity(actionEl.dataset.id);
      break;

    case 'refuse-activity':
      refuseActivity();
      break;

    case 'see-all':
      navigate({ view: 'all', resultId: current.resultId });
      break;

    case 'quick-add':
      quickAddActivity();
      break;

    case 'install':
      installApp();
      break;

    case 'edit-activity':
      editingActivityId = actionEl.dataset.id;
      render({ scroll: false });
      break;

    case 'cancel-edit':
      editingActivityId = null;
      render({ scroll: false });
      break;

    case 'delete-activity':
      deleteActivity(actionEl.dataset.id);
      break;

    case 'add-question':
      addQuestion();
      break;

    case 'delete-question':
      deleteQuestion(actionEl.dataset.qid);
      break;

    case 'add-result':
      addResult();
      break;

    case 'delete-result':
      deleteResult(actionEl.dataset.rid);
      break;

    case 'reset-questionnaire':
      resetQuestionnaire();
      break;

    case 'qtab':
      qTab = actionEl.dataset.tab === 'results' ? 'results' : 'questions';
      render({ scroll: false });
      break;

    case 'clear-history':
      clearHistory();
      break;

    default:
      break;
  }
});

app.addEventListener('submit', (event) => {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();

  const type = form.dataset.form;
  const input = form.querySelector('input[name="name"]');
  if (!input) return;
  const value = input.value.trim();

  if (type === 'add-activity') {
    if (!value) {
      input.focus();
      return;
    }
    if (addActivity(value)) toast('Activité ajoutée.');
    return;
  }

  if (type === 'edit-activity') {
    const activity = state.activities.find((item) => item.id === form.dataset.id);
    if (!activity) return;
    if (!value) {
      input.focus();
      return;
    }
    activity.name = value.slice(0, 80);
    editingActivityId = null;
    saveState();
    render({ scroll: false });
    toast('Activité modifiée.');
  }
});

app.addEventListener('change', (event) => {
  const field = event.target.closest('[data-edit]');
  if (!field) return;
  const type = field.dataset.edit;

  if (type === 'question-text') {
    const question = getQuestion(field.dataset.qid);
    if (!question) return;
    question.text = field.value.trim() || 'Question';
    field.value = question.text;
    saveState();
    return;
  }

  if (type === 'branch') {
    const question = getQuestion(field.dataset.qid);
    if (!question) return;
    const branch = field.dataset.branch === 'no' ? 'no' : 'yes';
    const target = parseTarget(field.value);

    if (target.kind === 'question' && (target.id === question.id || reachableFrom(target.id, question.id))) {
      toast('Ce branchement créerait une boucle dans le questionnaire.');
      render({ scroll: false });
      return;
    }
    if (target.kind === 'question' && !getQuestion(target.id)) return;
    if (target.kind === 'result' && !getResult(target.id)) return;

    question[branch] = target;
    saveState();
    toast('Branchement enregistré.');
    return;
  }

  if (type === 'result-title') {
    const result = getResult(field.dataset.rid);
    if (!result) return;
    result.title = field.value.trim() || 'Résultat';
    field.value = result.title;
    saveState();
    return;
  }

  if (type === 'result-message') {
    const result = getResult(field.dataset.rid);
    if (!result) return;
    result.message = field.value;
    saveState();
    return;
  }

  if (type === 'result-category') {
    const result = getResult(field.dataset.rid);
    if (!result) return;
    if (Object.prototype.hasOwnProperty.call(CATEGORIES, field.value)) {
      result.category = field.value;
      saveState();
    }
    return;
  }

  if (type === 'start') {
    if (getQuestion(field.value)) {
      state.questionnaire.startId = field.value;
      saveState();
      toast('Question de départ enregistrée.');
    }
  }
});

app.addEventListener('input', (event) => {
  const field = event.target.closest('textarea[data-edit], input[data-edit]');
  if (!field) return;
  const type = field.dataset.edit;

  if (type === 'question-text') {
    const question = getQuestion(field.dataset.qid);
    if (question) question.text = field.value;
  } else if (type === 'result-message') {
    const result = getResult(field.dataset.rid);
    if (result) result.message = field.value;
  } else {
    return;
  }

  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(saveState, 250);
});

/* ---------- Installation ---------- */

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (current.view === 'home') render({ scroll: false });
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  toast('StopGrignottage est installé sur ton téléphone.');
  if (current.view === 'home') render({ scroll: false });
});

async function installApp() {
  if (!deferredInstallPrompt) {
    toast('Utilise le menu du navigateur → « Ajouter à l’écran d’accueil ».');
    return;
  }
  deferredInstallPrompt.prompt();
  try {
    await deferredInstallPrompt.userChoice;
  } catch (error) {
    /* ignoré */
  }
  deferredInstallPrompt = null;
  render({ scroll: false });
}

/* ---------- Sauvegarde de sécurité ---------- */

window.addEventListener('pagehide', saveState);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) saveState();
});

/* --------------------------------------------------------------------------
   10. Démarrage
   -------------------------------------------------------------------------- */

const shortcutAction = new URLSearchParams(location.search).get('action');
if (shortcutAction === 'start' && getQuestion(state.questionnaire.startId)) {
  current = { view: 'quiz', qid: state.questionnaire.startId, step: 1, depth: 0 };
  try {
    history.replaceState(current, '', location.pathname);
  } catch (error) {
    /* sans état d'historique, le raccourci ouvre simplement l'accueil */
  }
}

render({ scroll: false });

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* hors ligne indisponible : l'application reste utilisable en ligne. */
    });
  });
}
