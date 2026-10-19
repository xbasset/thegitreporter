(function () {
  const API = 'https://api.thegitreporter.com/api/v1/feedback';
  const PREFIX = 'tgr.reaction.v1:';
  function read(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* A server receipt still confirms delivery. */ } }
  function bind(root) {
    const key = PREFIX + root.dataset.articleUrl;
    const cached = read(key);
    const token = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('');
    let record = cached && cached.articleUrl === root.dataset.articleUrl && cached.id && cached.editToken
      ? cached : { id: crypto.randomUUID(), editToken: token(), articleUrl: root.dataset.articleUrl, version: 0, vote: '', comment: '' };
    let vote = record.vote;
    let queue = Promise.resolve();
    const textarea = root.querySelector('textarea');
    const details = root.querySelector('details');
    const statuses = root.querySelectorAll('.feedback-status');
    const choices = [...root.querySelectorAll('[data-vote]')];
    textarea.value = record.comment || '';
    function status(message) { statuses.forEach(el => { el.textContent = message; }); }
    function select() { choices.forEach(button => {
      const selected = button.dataset.vote === vote;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }); }
    function save() {
      if (!vote) { status('Choose a thumb first.'); return; }
      const desired = { vote, comment: textarea.value.trim().slice(0, 2000) };
      status('Saving…');
      queue = queue.then(async () => {
        const payload = { ...record, ...desired, version: record.version + 1 };
        const pendingKey = key + ':pending';
        const pending = read(pendingKey);
        const send = async input => {
          const response = await fetch(API, { method: 'POST', mode: 'cors', credentials: 'omit',
            headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.timeout(15000) });
          if (!response.ok) throw new Error(response.status === 409 ? 'Reload this page before changing your saved reaction.' : 'Not sent. Your note is still here—try again.');
          const result = await response.json();
          if (result.data?.id !== input.id || result.data?.version !== input.version) throw new Error('No save receipt. Please try again.');
          record = input; write(key, record);
          try { localStorage.removeItem(pendingKey); } catch { /* Optional browser cache. */ }
        };
        try {
          if (pending && pending.id === record.id && pending.version === record.version + 1) await send(pending);
          if (record.vote !== desired.vote || record.comment !== desired.comment || !record.version) {
            const next = { ...payload, version: record.version + 1 };
            write(key, record); write(pendingKey, next);
            await send(next);
          }
          status('Saved privately. Awaiting editor discussion.');
        } catch (error) { status(error.message || 'Not sent. Please try again.'); }
      });
    }
    choices.forEach(button => button.addEventListener('click', () => { vote = button.dataset.vote; select(); save(); }));
    root.querySelector('form').addEventListener('submit', event => { event.preventDefault(); save(); });
    root.querySelector('[data-feedback-note]').addEventListener('click', () => {
      details.open = true; root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
      textarea.focus({ preventScroll: true });
    });
    select();
    if (record.version) status('Your reaction is saved. You can update it.');
    const pending = read(key + ':pending');
    if (pending && pending.id === record.id) { vote = pending.vote; textarea.value = pending.comment; select(); status('A reaction has not been confirmed. Tap a thumb or Save note to retry.'); }
    const dock = root.querySelector('[data-feedback-dock]');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => { dock.hidden = entries[0].isIntersecting; });
      observer.observe(root);
    }
    root.dataset.feedbackReady = 'true';
  }
  document.querySelectorAll('[data-tgr-feedback]').forEach(root => { try { bind(root); } catch { root.querySelector('.feedback-status').textContent = 'Feedback could not load. Please reload to try again.'; } });
})();
