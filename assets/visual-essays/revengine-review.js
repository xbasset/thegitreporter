// A schematic of review decisions, not a production trace or a timing measurement.
const states = {
  initial: {
    concern: 'Does this change belong?',
    decision: 'No maintainer answer yet',
    result: 'Ask for a decision',
    explanations: {
      concern: 'The code may work, but accepting it would add a responsibility the project has not agreed to carry.',
      decision: 'The question remains open. A model cannot supply the missing project decision.',
      result: 'Keep the project-fit question separate from the list of technical defects.'
    },
    status: 'First review: the question about project fit still needs a maintainer’s answer.'
  },
  answered: {
    concern: 'Does this change belong?',
    decision: 'Fits the project; proceed',
    result: 'Carry the answer forward',
    explanations: {
      concern: 'The same project-fit question appears in another review. No relevant change has moved it beyond the earlier answer.',
      decision: 'The maintainer has accepted this direction. That answer addresses project fit; it does not establish that the code has no defects.',
      result: 'Use the recorded answer instead of asking the maintainer to make the same decision again.'
    },
    status: 'Later review: return to the recorded answer before raising the same concern again. The maintainer’s decision still applies.'
  },
  changed: {
    concern: 'A different defect appears nearby',
    decision: 'Earlier concern was resolved',
    result: 'Report the new problem',
    explanations: {
      concern: 'A later change has a different technical problem near an older review comment.',
      decision: 'Keep the earlier decision in context. A resolved thread alone does not establish that the code is fixed.',
      result: 'Judge the new finding by its content and evidence. Overlapping lines alone should not suppress it.'
    },
    status: 'Changed code: preserve the earlier decision, but take a separate path for a different defect. Resolving one concern does not approve every future change.'
  }
};

for (const root of document.querySelectorAll('[data-revengine-rounds]')) enhance(root);

function enhance(root) {
  const cards = ['concern', 'decision', 'result'].map(key => ({
    key,
    heading: root.querySelector(`[data-review-card="${key}"] > span`),
    label: root.querySelector(`[data-review-card="${key}"] [data-review-label]`),
    text: root.querySelector(`[data-review-card="${key}"] [data-review-text]`)
  }));
  const status = root.querySelector('[data-review-status]');
  const buttons = [...root.querySelectorAll('button[data-review-state]')];
  if (!status || cards.some(card => !card.label || !card.text)) return;

  const style = document.createElement('style');
  style.textContent = `
    [data-revengine-rounds]{--rr-ink:#242720;--rr-paper:#fff8e8;--rr-green:#275d45;--rr-rust:#a53b26;color:var(--rr-ink);margin:2rem 0}
    [data-revengine-rounds] [hidden]{display:none!important}
    [data-revengine-rounds] [data-review-controls]{display:flex;flex-wrap:wrap;gap:.6rem;margin:1rem 0}
    [data-revengine-rounds] button[data-review-state]{box-sizing:border-box;max-width:100%;min-height:48px;padding:.7rem .9rem;border:2px solid var(--rr-ink);border-radius:0;background:var(--rr-paper);color:var(--rr-ink);font:700 16px/1.4 system-ui,sans-serif;text-align:left;white-space:normal;cursor:pointer}
    [data-revengine-rounds] button[aria-pressed="true"]{color:var(--rr-paper);background:var(--rr-ink)}
    [data-revengine-rounds] button:focus-visible{outline:3px solid var(--rr-rust);outline-offset:4px}
    [data-revengine-rounds] [data-review-card]{box-sizing:border-box;display:block;min-width:0;margin:.8rem 0;padding:1rem;border:1px solid #8f8776;border-left:6px solid var(--rr-ink);background:var(--rr-paper);box-shadow:3px 3px 0 #d2c7b1;overflow-wrap:anywhere}
    [data-revengine-rounds] [data-review-card] > span{display:block;margin:0 0 .4rem;font:700 16px/1.4 system-ui,sans-serif}
    [data-revengine-rounds] [data-review-label]{display:block;margin:0 0 .6rem;font:700 20px/1.4 Georgia,serif}
    [data-revengine-rounds] [data-review-text]{margin:0;font:400 16px/1.55 system-ui,sans-serif}
    [data-revengine-rounds][data-review-selected="answered"] [data-review-card="decision"],
    [data-revengine-rounds][data-review-selected="answered"] [data-review-card="result"]{border-left-color:var(--rr-green)!important}
    [data-revengine-rounds][data-review-selected="changed"] [data-review-card="decision"]{background:#eee6d7!important;border-left-color:var(--rr-green)!important}
    [data-revengine-rounds][data-review-selected="changed"] [data-review-card="concern"],
    [data-revengine-rounds][data-review-selected="changed"] [data-review-card="result"]{border-left-color:var(--rr-rust)!important}
    [data-revengine-rounds] [data-review-status]{margin:1rem 0;padding:.8rem 0;border-top:1px solid #8f8776;font:400 16px/1.55 system-ui,sans-serif}
    [data-revengine-rounds] [data-review-graphics]{display:none}
    [data-revengine-rounds] [data-review-graphics][data-graphics="ready"]{position:relative;display:block;height:112px;width:100%;overflow:hidden;background:#eee6d7;border-block:1px solid #c2b8a5}
    [data-revengine-rounds] [data-review-graphics] canvas{display:block;width:100%;height:100%;pointer-events:none}
    [data-revengine-rounds] [data-review-node]{position:absolute;top:56px;transform:translate(-50%,-50%);display:grid;place-items:center;box-sizing:border-box;width:26px;height:30px;border:1px solid var(--rr-ink);background:var(--rr-paper);color:var(--rr-ink);font:700 16px/1 system-ui,sans-serif;pointer-events:none}
    [data-revengine-rounds][data-review-selected="changed"] [data-review-node="3"]{top:89px;border-color:var(--rr-rust)}
    @media(max-width:480px){[data-revengine-rounds] [data-review-controls]{display:grid;grid-template-columns:1fr}[data-revengine-rounds] [data-review-card]{padding:.8rem}[data-revengine-rounds] [data-review-label]{font-size:19px}}
  `;
  root.append(style);
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const labels = { concern: '1. Concern', decision: '2. Maintainer decision', result: '3. Report' };
  let selected = 'initial';
  let paint = () => {};
  function update(next, animate = true) {
    if (!Object.hasOwn(states, next)) return;
    selected = next;
    root.dataset.reviewSelected = next;
    for (const card of cards) {
      if (card.heading) card.heading.textContent = labels[card.key];
      card.label.textContent = states[next][card.key];
      card.text.textContent = states[next].explanations[card.key];
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.reviewState === next));
    }
    status.textContent = states[next].status;
    paint(next, animate);
  }
  for (const button of buttons) {
    button.type = 'button';
    button.addEventListener('click', () => update(button.dataset.reviewState));
  }
  root.querySelectorAll('[data-review-controls]').forEach(control => { control.hidden = false; });
  update('initial', false);
  if (!root.querySelector('[data-review-graphics]')) return;
  import('../vendor/three/three.module.js').then(THREE => {
    paint = makeDiagram(THREE, root);
    paint(selected, false);
  }).catch(() => { /* The complete explanation and controls remain in the DOM. */ });
}

function makeDiagram(T, root) {
  const host = root.querySelector('[data-review-graphics]');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  host.setAttribute('aria-hidden', 'true');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(0, 300, 112, 0, .1, 10);
  camera.position.z = 5;
  let renderer, frame = 0, disposed = false, visible = false, selected = 'initial';
  let resizeObserver, intersectionObserver;
  const objects = [];
  const nodeLabels = [];
  const paths = {
    initial: [[32, 56], [150, 56], [267, 56]],
    // Follow the previous answer, then continue, rather than opening it again.
    answered: [[267, 56], [267, 88], [150, 88], [150, 56], [267, 56]],
    // The earlier answer remains above; a new concern follows its own branch.
    changed: [[32, 56], [78, 56], [105, 23], [267, 23]]
  };
  function clearObjects() {
    for (const object of objects) {
      scene.remove(object);
      object.geometry.dispose();
      object.material.dispose();
    }
    objects.length = 0;
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    reduced.removeEventListener('change', onMotion);
    clearObjects();
    renderer?.dispose();
    canvas.remove();
    nodeLabels.forEach(label => label.remove());
    host.hidden = true;
    delete host.dataset.graphics;
  }
  function mesh(geometry, color, x, y, rotation = 0) {
    const object = new T.Mesh(geometry, new T.MeshBasicMaterial({ color }));
    object.position.set(x, y, 0);
    object.rotation.z = rotation;
    objects.push(object);
    scene.add(object);
    return object;
  }
  function segment(a, b, color, width = 3) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const length = Math.hypot(dx, dy);
    if (length < .01) return;
    mesh(new T.PlaneGeometry(length, width), color, (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2, Math.atan2(dy, dx));
  }
  function trace(points, progress, color) {
    const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
    let distance = lengths.reduce((a, b) => a + b, 0) * progress;
    for (let i = 0; i < lengths.length; i++) {
      const fraction = Math.min(1, distance / lengths[i]);
      if (fraction <= 0) break;
      const a = points[i], b = points[i + 1];
      const end = [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction];
      segment(a, end, color);
      if (distance <= lengths[i] || i === lengths.length - 1) {
        mesh(new T.CircleGeometry(5, 3), color, end[0], end[1], Math.atan2(b[1] - a[1], b[0] - a[0]));
        break;
      }
      distance -= lengths[i];
    }
  }
  function render(progress = 1) {
    if (disposed || document.hidden || !visible) return;
    clearObjects();
    // The top line retains the original question, decision, and review outcome.
    segment([32, 56], [267, 56], 0xb7ad99, 2);
    for (const x of [32, 150, 267]) mesh(new T.PlaneGeometry(22, 26), 0xfff8e8, x, 56);
    if (selected !== 'initial') {
      segment([143, 56], [148, 51], 0x275d45);
      segment([148, 51], [158, 63], 0x275d45);
    }
    if (selected === 'changed') mesh(new T.PlaneGeometry(22, 20), 0xfff8e8, 267, 23);
    const color = selected === 'answered' ? 0x275d45 : selected === 'changed' ? 0xa53b26 : 0x242720;
    trace(paths[selected], progress, color);
    renderer.render(scene, camera);
  }
  function change(next, animate = true) {
    if (disposed) return;
    selected = next;
    cancelAnimationFrame(frame);
    if (!animate || reduced.matches || !visible || document.hidden) { render(); return; }
    const start = performance.now();
    function step(now) {
      if (disposed || !visible || document.hidden) return;
      const progress = Math.min(1, (now - start) / 420);
      render(progress);
      if (progress < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
  }
  function onVisibility() { cancelAnimationFrame(frame); render(); }
  function onMotion() { change(selected, false); }
  try {
    renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    host.append(canvas);
    [32, 150, 267].forEach((x, index) => {
      const label = document.createElement('span');
      label.dataset.reviewNode = String(index + 1);
      label.textContent = String(index + 1);
      label.style.left = `${x / 3}%`;
      nodeLabels.push(label);
      host.append(label);
    });
    host.dataset.graphics = 'ready';
    host.hidden = false;
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); dispose(); }, { once: true });
    resizeObserver = new ResizeObserver(() => {
      if (disposed) return;
      renderer.setSize(Math.max(1, host.clientWidth), 112, false);
      change(selected, false);
    });
    resizeObserver.observe(host);
    intersectionObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      change(selected, false);
    });
    intersectionObserver.observe(host);
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', onMotion);
  } catch { dispose(); return () => {}; }
  return change;
}
