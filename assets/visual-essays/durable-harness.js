// A schematic of a recovery boundary, not a production trace or elapsed time.
// The PR comment's outcome deliberately remains unknown in the final state.
const states = {
  recorded: {
    saved: ['Model result recorded', 'The first model response has finished and its result is in the durable log.'],
    uncertain: ['Comment started; no result yet', 'The PR comment tool is marked replay: never. Its intent is recorded, but the log has no outcome.'],
    next: ['Final response not started', 'The agent has not reached its final reply. A recorded intent does not establish that the comment was posted.'],
    status: 'Process 1 is running. The log holds one completed model result and the intent to post a PR comment.',
    process: ['running', 'not running']
  },
  crashed: {
    saved: ['Recorded result survives', 'Process 1 has stopped. The completed model result remains in the log, outside that process.'],
    uncertain: ['Comment outcome unknown', 'The comment may or may not have been posted. The crash left its intent in the log without a recorded result.'],
    next: ['Final response not started', 'The unfinished turn can be handed to another process. No final answer has been produced in this example.'],
    status: 'Process 1 stopped. The log survives, including the unresolved PR comment. No replacement process is running yet in this schematic.',
    process: ['stopped', 'not running']
  },
  resumed: {
    saved: ['Recorded result reused', 'Process 2 reads the completed result from the log instead of repeating that recorded call.'],
    uncertain: ['Check the PR before another action', 'The interrupted comment call is not automatically replayed. The model is told its outcome is unknown and instructed to check the PR; this is not proof it checks.'],
    next: ['Final response still not started', 'Recovery restores the information needed to continue. This schematic ends before another tool call or a final reply.'],
    status: 'Process 2 reads the log. It reuses the recorded result and receives the uncertain comment outcome. The comment remains unresolved; recovery does not establish that the model checks the PR.',
    process: ['stopped', 'reads the log']
  }
};

for (const root of document.querySelectorAll('[data-durable-recovery]')) enhance(root);

function enhance(root) {
  const cards = ['saved', 'uncertain', 'next'].map(key => ({
    key,
    label: root.querySelector(`[data-durable-card="${key}"] [data-durable-label]`),
    text: root.querySelector(`[data-durable-card="${key}"] [data-durable-text]`)
  }));
  const status = root.querySelector('[data-durable-status]');
  const buttons = [...root.querySelectorAll('button[data-durable-state]')];
  if (!status || cards.some(card => !card.label || !card.text) || !buttons.length) return;

  const style = document.createElement('style');
  style.textContent = `
    [data-durable-recovery]{--dh-ink:#272720;--dh-paper:#fff8e8;--dh-green:#28583e;--dh-rust:#9a3928;--dh-amber:#77500d;color:var(--dh-ink);margin:2rem 0}
    [data-durable-recovery] [hidden]{display:none!important}
    [data-durable-recovery] [data-durable-controls]{display:flex;flex-wrap:wrap;gap:.6rem;margin:1rem 0}
    [data-durable-recovery] button[data-durable-state]{box-sizing:border-box;max-width:100%;min-height:48px;padding:.7rem .9rem;border:2px solid var(--dh-ink);border-radius:0;background:var(--dh-paper);color:var(--dh-ink);font:700 16px/1.4 system-ui,sans-serif;text-align:left;white-space:normal;cursor:pointer}
    [data-durable-recovery] button[data-durable-state][aria-pressed="true"]{background:var(--dh-ink);color:var(--dh-paper)}
    [data-durable-recovery] button[data-durable-state]:focus-visible{outline:3px solid var(--dh-rust);outline-offset:4px}
    [data-durable-recovery] [data-durable-card]{box-sizing:border-box;min-width:0;margin:.8rem 0;padding:1rem;border:1px solid #9c927f;border-left:6px solid var(--dh-ink);background:var(--dh-paper);box-shadow:3px 3px 0 #d6cbb6;overflow-wrap:anywhere}
    [data-durable-recovery] [data-durable-card="saved"]{border-left-color:var(--dh-green)}
    [data-durable-recovery] [data-durable-card="uncertain"]{border-left-color:var(--dh-amber);background:#fff2d3}
    [data-durable-recovery] [data-durable-card] > span{display:block;margin:0 0 .4rem;font:700 16px/1.4 system-ui,sans-serif}
    [data-durable-recovery] [data-durable-label]{display:block;margin:0 0 .6rem;font:700 20px/1.35 Georgia,serif}
    [data-durable-recovery] [data-durable-text]{margin:0;font:400 16px/1.55 system-ui,sans-serif}
    [data-durable-recovery] [data-durable-status]{margin:1rem 0;padding:.8rem 0;border-top:1px solid #9c927f;font:400 16px/1.55 system-ui,sans-serif}
    [data-durable-recovery] [data-durable-graphics][data-graphics="ready"]{position:relative;box-sizing:border-box;display:block;width:100%;height:252px;overflow:hidden;border-block:1px solid #b9ae98;background:#eee6d7}
    [data-durable-recovery] [data-durable-graphics] canvas{display:block;width:100%;height:250px;pointer-events:none}
    [data-durable-recovery] [data-durable-node]{position:absolute;transform:translateX(-50%);box-sizing:border-box;display:block;text-align:center;font:700 16px/1.3 system-ui,sans-serif;color:var(--dh-ink);pointer-events:none;white-space:nowrap}
    [data-durable-recovery] [data-durable-node="one"],[data-durable-recovery] [data-durable-node="two"]{top:10px;width:48%}
    [data-durable-recovery] [data-durable-node="one"]{left:25%}
    [data-durable-recovery] [data-durable-node="two"]{left:75%}
    [data-durable-recovery] [data-durable-node] small{display:block;margin-top:64px;font:400 16px/1.3 system-ui,sans-serif}
    [data-durable-recovery] [data-durable-node="log"]{left:50%;top:181px;width:150px}
    [data-durable-recovery] [data-durable-node="log"] small{margin-top:5px;font-size:15px;color:var(--dh-amber)}
    [data-durable-recovery][data-durable-selected="recorded"] [data-durable-node="two"],
    [data-durable-recovery][data-durable-selected="crashed"] [data-durable-node="two"]{color:#696455}
    [data-durable-recovery][data-durable-selected="crashed"] [data-durable-node="one"] small,
    [data-durable-recovery][data-durable-selected="resumed"] [data-durable-node="one"] small{color:var(--dh-rust);font-weight:700}
    [data-durable-recovery][data-durable-selected="resumed"] [data-durable-node="two"] small{color:var(--dh-green);font-weight:700}
    @media(max-width:480px){[data-durable-recovery] [data-durable-controls]{display:grid;grid-template-columns:1fr}[data-durable-recovery] [data-durable-card]{padding:.8rem}[data-durable-recovery] [data-durable-label]{font-size:19px}}
  `;
  root.append(style);
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  let selected = 'recorded';
  let paint = () => {};
  function update(next, animate = true) {
    if (!Object.hasOwn(states, next)) return;
    selected = next;
    root.dataset.durableSelected = next;
    for (const card of cards) {
      card.label.textContent = states[next][card.key][0];
      card.text.textContent = states[next][card.key][1];
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.durableState === next));
    }
    status.textContent = states[next].status;
    paint(next, animate);
  }
  for (const button of buttons) {
    button.type = 'button';
    button.addEventListener('click', () => update(button.dataset.durableState));
  }
  root.querySelectorAll('[data-durable-controls]').forEach(control => { control.hidden = false; });
  update('recorded', false);
  if (!root.querySelector('[data-durable-graphics]')) return;
  import('../vendor/three/three.module.js').then(THREE => {
    paint = makeDiagram(THREE, root);
    paint(selected, false);
  }).catch(() => { /* All meaningful content and controls remain in HTML. */ });
}

function makeDiagram(T, root) {
  const host = root.querySelector('[data-durable-graphics]');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  host.setAttribute('aria-hidden', 'true');
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(0, 300, 0, 250, .1, 100);
  camera.position.z = 10;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const objects = [], labels = [];
  const colors = { ink: 0x272720, paper: 0xfff8e8, green: 0x28583e, rust: 0x9a3928, amber: 0x77500d };
  let renderer, resizeObserver, intersectionObserver;
  let frame = 0, disposed = false, visible = true, selected = 'recorded', width = 300;
  let wasStopped = false;

  function box(w, h, color, parent = scene) {
    const object = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color, transparent: true, depthTest: false, side: T.DoubleSide }));
    parent.add(object);
    objects.push(object);
    return object;
  }
  function line(color, thickness = 3) { return box(1, thickness, color); }
  function positionLine(object, a, b, fraction = 1) {
    const dx = (b[0] - a[0]) * fraction, dy = (b[1] - a[1]) * fraction;
    object.position.set(a[0] + dx / 2, a[1] + dy / 2, 0);
    object.scale.x = Math.max(.001, Math.hypot(dx, dy));
    object.rotation.z = Math.atan2(dy, dx);
    object.visible = fraction > 0;
  }
  function opacity(group, value) {
    group.traverse(object => { if (object.material) object.material.opacity = value; });
  }
  function processBox() {
    const group = new T.Group();
    scene.add(group);
    box(66, 46, colors.ink, group);
    box(62, 42, colors.paper, group);
    for (let i = 0; i < 3; i++) {
      const rule = box(35 - i * 6, 3, colors.ink, group);
      rule.position.set(-4, -10 + i * 10, 0);
    }
    return group;
  }
  const one = processBox(), two = processBox();
  const cross = [line(colors.rust, 4), line(colors.rust, 4)];
  const log = new T.Group();
  scene.add(log);
  for (let i = 2; i >= 0; i--) {
    const sheet = new T.Group();
    log.add(sheet);
    sheet.position.set(i * 4, i * 4, 0);
    box(166, 68, colors.ink, sheet);
    box(162, 64, colors.paper, sheet);
  }
  // Two distinct records remain visible in every state; amber never becomes green.
  const savedMark = box(25, 5, colors.green, log);
  savedMark.position.set(-49, -23, 0);
  const openMark = box(25, 5, colors.amber, log);
  openMark.position.set(-15, -23, 0);
  const arrow = line(colors.ink, 3);
  const arrowhead = new T.Mesh(new T.CircleGeometry(6, 3), new T.MeshBasicMaterial({ color: colors.ink, transparent: true, depthTest: false, side: T.DoubleSide }));
  objects.push(arrowhead);
  scene.add(arrowhead);

  function addLabel(key, text, detail) {
    const label = document.createElement('span');
    label.dataset.durableNode = key;
    label.append(document.createTextNode(text));
    const small = document.createElement('small');
    small.textContent = detail;
    label.append(small);
    host.append(label);
    labels.push(label);
    return small;
  }
  const oneStatus = addLabel('one', 'Process 1', 'running');
  const twoStatus = addLabel('two', 'Process 2', 'not running');
  addLabel('log', 'Durable log', 'Outcome unknown');

  function render(value = 1) {
    if (disposed || !visible || document.hidden) return;
    const stopped = selected !== 'recorded';
    const crashProgress = stopped ? (wasStopped ? 1 : value) : 0;
    one.position.set(width * .25, 59, 0);
    two.position.set(width * .75, 59, 0);
    log.position.set(width * .5, 196, 0);
    opacity(one, 1 - .62 * crashProgress);
    opacity(two, selected === 'resumed' ? .22 + .78 * value : .22);
    positionLine(cross[0], [width * .25 - 29, 39], [width * .25 + 29, 79], crashProgress);
    positionLine(cross[1], [width * .25 + 29, 39], [width * .25 - 29, 79], crashProgress);
    const resumed = selected === 'resumed';
    const a = resumed ? [width * .5 + 43, 160] : [width * .25, 121];
    const b = resumed ? [width * .75, 121] : [width * .5 - 43, 160];
    const fraction = selected === 'crashed' ? 0 : value;
    positionLine(arrow, a, b, fraction);
    arrow.material.color.setHex(resumed ? colors.green : colors.ink);
    arrowhead.material.color.copy(arrow.material.color);
    arrowhead.visible = fraction > 0;
    arrowhead.position.set(a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction, 0);
    arrowhead.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]);
    renderer.render(scene, camera);
  }
  function change(next, animate = true) {
    if (disposed) return;
    wasStopped = selected !== 'recorded';
    selected = next;
    oneStatus.textContent = states[next].process[0];
    twoStatus.textContent = states[next].process[1];
    cancelAnimationFrame(frame);
    if (!animate || reduced.matches || !visible || document.hidden) { render(); return; }
    const start = performance.now();
    function step(now) {
      if (disposed || !visible || document.hidden) return;
      const time = Math.min(1, (now - start) / 480);
      render(1 - (1 - time) ** 3);
      if (time < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
  }
  function resize() {
    if (disposed) return;
    width = Math.max(1, host.clientWidth);
    camera.right = width;
    camera.updateProjectionMatrix();
    renderer.setSize(width, 250, false);
    change(selected, false);
  }
  function onVisibility() { cancelAnimationFrame(frame); render(); }
  function onMotion() { change(selected, false); }
  function contextLost(event) { event.preventDefault(); dispose(); }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pagehide', dispose);
    document.removeEventListener('visibilitychange', onVisibility);
    reduced.removeEventListener('change', onMotion);
    canvas.removeEventListener('webglcontextlost', contextLost);
    for (const object of objects) { object.geometry.dispose(); object.material.dispose(); }
    renderer?.dispose();
    canvas.remove();
    labels.forEach(label => label.remove());
    host.hidden = true;
    delete host.dataset.graphics;
  }
  try {
    renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    host.prepend(canvas);
    host.dataset.graphics = 'ready';
    host.hidden = false;
    canvas.addEventListener('webglcontextlost', contextLost);
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
    } else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        change(selected, false);
      });
      intersectionObserver.observe(host);
    }
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', onMotion);
    window.addEventListener('pagehide', dispose, { once: true });
    resize();
  } catch { dispose(); return () => {}; }
  return change;
}
