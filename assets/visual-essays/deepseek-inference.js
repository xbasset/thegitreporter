// Weight placement is schematic. It does not encode quantities, bandwidth or latency.
for (const root of document.querySelectorAll('[data-deepseek-inference]')) enhance(root);

function enhance(root) {
  const style = document.createElement('style');
  style.textContent = `
    [data-deepseek-inference]{--di-ink:#20261e;--di-green:#174b38;--di-rust:#a33e27;margin:2rem 0;color:var(--di-ink);overflow-wrap:anywhere}
    [data-deepseek-inference] *,[data-deepseek-inference] *::before,[data-deepseek-inference] *::after{box-sizing:border-box}
    [data-deepseek-inference] [hidden]{display:none!important}
    [data-deepseek-inference] .di-contract{padding:.9rem 1rem;border:2px solid var(--di-ink);background:#fff7e4}
    [data-deepseek-inference] .di-contract strong{display:block;font:700 1.3rem/1.25 Georgia,serif}
    [data-deepseek-inference] .di-contract span{display:block;font:1rem/1.5 system-ui}
    [data-deepseek-inference] .di-arrow{text-align:center;font:700 1.6rem/1.2 system-ui;margin:.3rem 0}
    [data-deepseek-inference] .di-switch{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0}
    [data-deepseek-inference] button{min-height:48px;max-width:100%;flex:1 1 180px;border:2px solid var(--di-ink);padding:.7rem .8rem;background:#fff7e4;color:var(--di-ink);font:700 1rem/1.3 system-ui;cursor:pointer}
    [data-deepseek-inference] button[aria-pressed=true]{background:var(--di-green);color:#fff7e4}
    [data-deepseek-inference] button:focus-visible{outline:3px solid var(--di-rust);outline-offset:3px}
    [data-deepseek-inference] .di-status{border-left:4px solid var(--di-green);padding:.6rem .8rem;font:1rem/1.5 system-ui;margin:1rem 0}
    [data-deepseek-inference] .di-route{min-width:0;padding:1rem;border:2px solid var(--di-ink);background:#f1e7d3;margin:1rem 0;box-shadow:3px 4px 0 #b5ab94}
    [data-deepseek-inference] h3{font:700 1.4rem/1.2 Georgia,serif;margin:0 0 .6rem}
    [data-deepseek-inference] .di-backend{font:1rem/1.5 system-ui;margin-bottom:.8rem}
    [data-deepseek-inference] .di-memory{position:relative;isolation:isolate;margin:1rem 0}
    [data-deepseek-inference] .di-memory canvas{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}
    [data-deepseek-inference] .di-memory-row{position:relative;min-height:88px;border:1px solid #807963;border-left:5px solid var(--di-ink);background:#fff9ec;margin:.65rem 0;padding:.8rem .7rem .8rem 2.8rem}
    [data-deepseek-inference] .di-memory-row::before{content:'';position:absolute;left:.65rem;top:1.1rem;width:12px;height:17px;border:1px solid var(--di-ink);background:#d8c6a5}
    [data-deepseek-inference] .di-memory[data-graphics=ready] .di-memory-row::before{display:none}
    [data-deepseek-inference] .di-memory-row strong{display:block;font:700 1.05rem/1.3 system-ui;margin-bottom:.2rem}
    [data-deepseek-inference] .di-memory-row span{display:block;font:1rem/1.45 system-ui}
    [data-deepseek-inference] .di-responsibility{border-top:1px solid #807963;padding-top:.7rem;font:1rem/1.5 system-ui}
    [data-deepseek-inference] .di-caption{font:.95rem/1.5 system-ui}
    @media(max-width:420px){[data-deepseek-inference] .di-switch{display:grid;grid-template-columns:minmax(0,1fr)}[data-deepseek-inference] .di-route{padding:.75rem}[data-deepseek-inference] button{width:100%}}
  `;
  root.append(style);
  const buttons = [...root.querySelectorAll('[data-di-mode]')];
  const panels = [...root.querySelectorAll('[data-di-route]')];
  const status = root.querySelector('[data-di-status]');
  let current = 'cluster';
  let paint = () => {};
  function update(mode, animate = true) {
    if (!panels.some(panel => panel.dataset.diRoute === mode)) return;
    current = mode;
    for (const panel of panels) panel.hidden = panel.dataset.diRoute !== mode;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.diMode === mode));
    status.textContent = mode === 'cluster'
      ? 'Supported execution engine; you still build the service around it.'
      : 'A compatible local backend changes weight placement and kernel requirements.';
    paint(mode, animate);
  }
  for (const button of buttons) button.addEventListener('click', () => update(button.dataset.diMode));
  root.querySelector('[data-di-controls]').hidden = false;
  update(current, false);
  import('../vendor/three/three.module.js').then(T => {
    paint = makePlacement(T, root);
    update(current, false);
  }).catch(() => { /* The complete text and memory diagram work without WebGL. */ });
}

function makePlacement(T, root) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  let renderer, geometry, edgeGeometry, fill, outline;
  let host, resizeObserver, intersectionObserver;
  let frame = 0, visible = true, disposed = false, mode = 'cluster';
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(0, 1, 0, 1, .1, 100);
  camera.position.z = 10;
  const slips = [];
  const onVisibility = () => { if (document.hidden) settle(); };
  const onMotion = () => settle();
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    reduced.removeEventListener('change', onMotion);
    geometry?.dispose(); edgeGeometry?.dispose(); fill?.dispose(); outline?.dispose();
    renderer?.dispose(); canvas.remove();
    for (const stage of root.querySelectorAll('[data-di-memory]')) delete stage.dataset.graphics;
  }
  try {
    renderer = new T.WebGLRenderer({canvas, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    geometry = new T.BoxGeometry(14, 20, 1);
    edgeGeometry = new T.EdgesGeometry(geometry);
    fill = new T.MeshBasicMaterial({color:0xe0b45e});
    outline = new T.LineBasicMaterial({color:0x20261e});
    for (let index = 0; index < 3; index++) {
      const slip = new T.Group();
      slip.add(new T.Mesh(geometry, fill), new T.LineSegments(edgeGeometry, outline));
      scene.add(slip); slips.push(slip);
    }
  } catch { dispose(); return () => {}; }
  function rowCenter(kind) {
    const row = host.querySelector(`[data-di-store="${kind}"]`);
    const box = row.getBoundingClientRect(), parentBox = host.getBoundingClientRect();
    return box.top - parentBox.top + box.height / 2;
  }
  function render(progress = 1) {
    if (disposed || !host || !host.clientWidth || !host.clientHeight) return;
    const width = host.clientWidth, height = host.clientHeight;
    renderer.setSize(width, height, false);
    camera.right = width; camera.bottom = height; camera.updateProjectionMatrix();
    const source = rowCenter('ssd'), ram = rowCenter('ram'), gpu = rowCenter('gpu');
    for (let index = 0; index < slips.length; index++) {
      const end = mode === 'local' ? [gpu, ram, source][index] : gpu;
      const p = Math.max(0, Math.min(1, progress * 1.3 - index * .15));
      // The local route keeps Engram on SSD and distributes other weights across RAM/GPU.
      const y = mode === 'local' && index === 2 ? source : p < .5 ? source + (ram - source) * p * 2 : ram + (end - ram) * (p - .5) * 2;
      const offset = mode === 'cluster' ? (index - 1) * 8 * p : 0;
      slips[index].position.set(21, y + offset, index * .2);
      slips[index].rotation.z = (1 - p) * (index ? -.16 : .16);
    }
    renderer.render(scene, camera);
  }
  function settle() { cancelAnimationFrame(frame); render(); }
  function change(next, animate = true) {
    if (disposed) return;
    cancelAnimationFrame(frame);
    mode = next;
    const nextHost = root.querySelector(`[data-di-route="${mode}"] [data-di-memory]`);
    if (host !== nextHost) {
      if (host) delete host.dataset.graphics;
      host = nextHost;
      host.append(canvas);
      host.dataset.graphics = 'ready';
    }
    if (!animate || reduced.matches || !visible || document.hidden) { render(); return; }
    const start = performance.now();
    function step(now) {
      if (disposed) return;
      const p = Math.min(1, (now - start) / 850);
      render(p * p * (3 - 2 * p));
      if (p < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
  }
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); dispose(); }, {once:true});
  let observedWidth = root.getBoundingClientRect().width;
  resizeObserver = new ResizeObserver(() => {
    const width = root.getBoundingClientRect().width;
    // A path switch can change height; it must not cancel its own explanation.
    if (width !== observedWidth) { observedWidth = width; settle(); }
  });
  resizeObserver.observe(root);
  intersectionObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) settle();
  });
  intersectionObserver.observe(root);
  document.addEventListener('visibilitychange', onVisibility);
  reduced.addEventListener('change', onMotion);
  document.fonts?.ready.then(() => settle());
  return change;
}
