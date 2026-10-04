// Démonstrations locales uniquement : aucun serveur de jeu ni stockage.
const tabButtons = [...document.querySelectorAll('[data-view]')];
const focusButton = document.getElementById('focus-button');
function showView(name, focus = false) {
  for (const view of document.querySelectorAll('.view')) view.hidden = view.id !== name;
  for (const button of tabButtons) {
    const active = button.dataset.view === name;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && focus) button.focus();
  }
  if (name !== 'race') {
    document.body.classList.remove('is-focus');
    focusButton.setAttribute('aria-pressed', 'false');
    focusButton.querySelector('span').textContent = 'Concentration';
  }
}
tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => showView(button.dataset.view));
  button.addEventListener('keydown', event => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabButtons.length;
    else if (event.key === 'ArrowLeft') next = (index + tabButtons.length - 1) % tabButtons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabButtons.length - 1;
    else return;
    event.preventDefault();
    showView(tabButtons[next].dataset.view, true);
  });
});
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => {
  showView(button.dataset.go);
  document.getElementById(button.dataset.go).focus();
}));
document.getElementById('name-choice').addEventListener('change', event => {
  document.querySelectorAll('[data-brand]').forEach(element => {
    element.textContent = event.target.value.toLowerCase();
  });
});
document.getElementById('theme-button').addEventListener('click', event => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  event.currentTarget.querySelector('span').textContent = dark ? 'Passer en clair' : 'Passer en sombre';
  event.currentTarget.setAttribute('aria-pressed', String(dark));
});
document.getElementById('wireframe').addEventListener('change', event => {
  document.documentElement.classList.toggle('wireframe', event.target.checked);
});
document.getElementById('ranking-button').addEventListener('click', event => {
  const list = document.getElementById('more-ranking');
  list.hidden = !list.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!list.hidden));
  event.currentTarget.querySelector('span').textContent = list.hidden ? 'Voir les 8 positions' : 'Réduire le classement';
});
document.getElementById('ready-button').addEventListener('click', event => {
  const ready = event.currentTarget.getAttribute('aria-pressed') !== 'true';
  event.currentTarget.dataset.ready = String(ready);
  event.currentTarget.setAttribute('aria-pressed', String(ready));
  event.currentTarget.querySelector('span').textContent = ready ? 'Prêt ! Modifier mon état' : 'Je suis prêt';
  const label = document.getElementById('ready-label');
  label.textContent = ready ? '✓ Prêt' : 'En attente';
  label.classList.toggle('badge-ready', ready);
  document.getElementById('self-player').dataset.ready = String(ready);
  document.getElementById('ready-count').textContent = ready ? '4 / 5 joueurs prêts' : '3 / 5 joueurs prêts';
  document.getElementById('lobby-status').textContent = ready
    ? 'Tu es prêt. Nova donnera le départ au groupe.'
    : 'Ta place est là. Le groupe attend le départ.';
});
let toastTimeout;
function showToast(message) {
  clearTimeout(toastTimeout);
  document.getElementById('toast').hidden = false;
  document.getElementById('toast-message').textContent = message;
  toastTimeout = setTimeout(() => { document.getElementById('toast').hidden = true; }, 5000);
}
async function copyExample(button) {
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  try {
    await navigator.clipboard.writeText('K7M2PX');
    if (inviteDialog.open) document.getElementById('invite-feedback').textContent = 'Code d’exemple copié : K7M2PX.';
    else showToast('Code d’exemple copié : K7M2PX.');
  } catch {
    if (inviteDialog.open) document.getElementById('invite-feedback').textContent = 'Sélectionne le code ci-dessus pour le copier.';
    else showToast('Sélectionne le code K7M2PX pour le copier.');
  } finally {
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
}
for (const id of ['copy-code', 'copy-dialog']) {
  document.getElementById(id).addEventListener('click', event => copyExample(event.currentTarget));
}
const inviteDialog = document.getElementById('invite-dialog');
document.getElementById('invite-button').addEventListener('click', () => {
  document.getElementById('invite-feedback').textContent = '';
  inviteDialog.showModal();
});
for (const id of ['close-invite', 'finish-invite']) {
  document.getElementById(id).addEventListener('click', () => inviteDialog.close());
}
inviteDialog.addEventListener('close', () => document.getElementById('invite-button').focus());
focusButton.addEventListener('click', () => {
  const active = document.body.classList.toggle('is-focus');
  focusButton.setAttribute('aria-pressed', String(active));
  focusButton.querySelector('span').textContent = active ? 'Quitter la concentration' : 'Concentration';
});
const sample = 'Chaque touche te rapproche du prochain défi. Trouve ton rythme et garde les yeux sur la ligne.';
const sampleCharacters = [...sample];
const output = document.getElementById('typing-text');
// Les mots restent des unités de retour à la ligne : aucune rupture en pleine frappe.
const characterSpans = [];
for (const word of sample.match(/\S+\s*|\s+/g) || []) {
  const group = document.createElement('span');
  group.className = 'typing-word';
  for (const character of word) {
    const span = document.createElement('span');
    span.textContent = character;
    characterSpans.push(span);
    group.appendChild(span);
  }
  output.appendChild(group);
}
let feedbackTimeout;
function renderTyping(value, initial = false) {
  const characters = [...value.normalize('NFC')];
  let right = 0;
  let errors = 0;
  characterSpans.forEach((span, index) => {
    let state = '';
    if (index < characters.length) {
      const correct = characters[index] === sampleCharacters[index];
      state = correct ? 'correct' : 'error';
      if (correct) right++;
      else errors++;
    }
    if (index === characters.length) state += ' cursor';
    if (characters.length >= sampleCharacters.length && index === sampleCharacters.length - 1) state += ' end-cursor';
    span.className = state.trim();
  });
  errors += Math.max(0, characters.length - sampleCharacters.length);
  const precision = characters.length ? Math.round(right / characters.length * 100) + ' %' : '—';
  const progress = Math.min(100, Math.round(characters.length / sampleCharacters.length * 100));
  document.getElementById('accuracy').textContent = precision;
  document.getElementById('my-lane').style.setProperty('--progress', progress + '%');
  document.getElementById('my-percent').textContent = progress + ' %';
  document.getElementById('my-progress').setAttribute('aria-valuenow', String(progress));
  if (!initial) document.getElementById('speed').textContent = '—';
  if (initial) return;
  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => {
    document.getElementById('typing-feedback').textContent = !characters.length
      ? 'Essaie quelques mots à ton rythme.'
      : `${progress} % du texte saisi · ${errors} erreur${errors === 1 ? '' : 's'}.`;
  }, 600);
}
const typingInput = document.getElementById('typing-input');
let composing = false;
typingInput.addEventListener('compositionstart', () => { composing = true; });
typingInput.addEventListener('compositionend', () => { composing = false; renderTyping(typingInput.value); });
typingInput.addEventListener('input', () => { if (!composing) renderTyping(typingInput.value); });
document.getElementById('reset-typing').addEventListener('click', () => {
  typingInput.value = '';
  renderTyping('');
  typingInput.focus();
});
renderTyping('', true);
