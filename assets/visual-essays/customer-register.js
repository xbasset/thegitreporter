// A customer register: selection moves paper, never simulates enforcement or traffic.
for (const root of document.querySelectorAll('[data-customer-register]')) enhance(root);

function enhance(root) {
  const style = document.createElement('style');
  style.textContent = `
  [data-customer-register]{--cr-ink:#25271f;--cr-paper:#fff8e9;--cr-rust:#9b412d;--cr-green:#28533d;color:var(--cr-ink);margin:2rem 0;max-width:100%}
  [data-customer-register] *{box-sizing:border-box}
  [data-customer-register] [hidden]{display:none!important}
  [data-customer-register] p,[data-customer-register] span{font:16px/1.55 system-ui;overflow-wrap:anywhere}
  [data-customer-register] [data-cr-controls]{display:grid;grid-template-columns:1fr 1fr;gap:1.1rem;margin:1.4rem 0}
  [data-customer-register] fieldset{min-width:0;border:0;padding:0;margin:0}
  [data-customer-register] legend{padding:0;margin:0 0 .6rem;font:700 16px/1.4 system-ui}
  [data-customer-register] .cr-buttons{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
  [data-customer-register] button{min-width:0;min-height:52px;padding:.7rem .5rem;border:2px solid var(--cr-ink);background:var(--cr-paper);color:var(--cr-ink);font:700 16px/1.3 system-ui;cursor:pointer;overflow-wrap:anywhere}
  [data-customer-register] button[aria-pressed=true]{background:var(--cr-ink);color:var(--cr-paper)}
  [data-customer-register] button:focus-visible{outline:3px solid var(--cr-rust);outline-offset:3px}
  [data-customer-register] [data-cr-folder]{position:relative;isolation:isolate;background:#ddd0ad;border:2px solid var(--cr-ink);padding:1rem 1.2rem 1.4rem .85rem;box-shadow:4px 5px 0 #b0a78e}
  [data-customer-register] .cr-folder-label{font:700 17px/1.4 system-ui;margin:0 0 1rem;border-bottom:1px solid #84795f;padding-bottom:.7rem}
  [data-customer-register] [data-cr-row]{position:relative;background:var(--cr-paper);border:1px solid #6b6453;border-left:6px solid #84795f;padding:13px 12px;margin:12px 0;box-shadow:3px 3px 0 #b3a88d}
  [data-customer-register] [data-cr-row] strong{display:block;font:700 18px/1.35 system-ui;margin-bottom:4px}
  [data-customer-register] [data-cr-row] span{display:block}
  [data-customer-register] [data-cr-row] br{display:none}
  [data-customer-register] [data-cr-selected=true]{border-left-color:var(--cr-rust)}
  [data-customer-register] [data-cr-selected=true] strong::after{content:' · selected';font:600 16px/1.4 system-ui;color:var(--cr-rust)}
  [data-customer-register] canvas{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}
  [data-customer-register] [data-cr-graphics=ready] [data-cr-row]{background:transparent;border-color:transparent;box-shadow:none}
  [data-customer-register] [data-cr-detail]{margin-top:1.5rem;border-top:3px solid var(--cr-ink);padding:.3rem 0 .3rem .85rem;border-left:5px solid var(--cr-rust)}
  [data-customer-register] [data-cr-detail] h3{font:700 clamp(22px,4vw,28px)/1.25 Georgia,serif;margin:1rem 0}
  [data-customer-register] [data-cr-detail] p{margin:.9rem 0}
  [data-customer-register] [data-cr-status]{font:700 20px/1.5 system-ui}
  [data-customer-register] [data-cr-static-note]{padding-top:.8rem;border-top:1px dashed #84795f}
  @media(max-width:640px){[data-customer-register] [data-cr-controls]{grid-template-columns:1fr}[data-customer-register] [data-cr-folder]{padding:.8rem 1rem 1rem .65rem}[data-customer-register] [data-cr-row]{padding:12px 9px}[data-customer-register] [data-cr-detail]{padding-left:.65rem}}
  `;
  root.append(style);
  const controls = root.querySelector('[data-cr-controls]');
  const status = root.querySelector('[data-cr-status]');
  const actions = root.querySelector('[data-cr-actions]');
  const explanation = root.querySelector('[data-cr-explanation]');
  const heading = root.querySelector('[data-cr-selection]');
  const rows = [...root.querySelectorAll('[data-cr-row]')];
  if (!controls || !status || !actions || !explanation || rows.length !== 2) return;
  let customer = 'a', platform = 'api', paint = () => {};
  function select(animate = true) {
    const label = customer === 'a' ? 'Customer A' : 'Customer B';
    root.dataset.crCustomer = customer;
    root.dataset.crPlatform = platform;
    for (const button of controls.querySelectorAll('button[data-cr-customer]')) {
      button.setAttribute('aria-pressed', String(button.dataset.crCustomer === customer));
    }
    for (const button of controls.querySelectorAll('button[data-cr-platform]')) {
      button.setAttribute('aria-pressed', String(button.dataset.crPlatform === platform));
    }
    for (const row of rows) row.dataset.crSelected = String(row.dataset.crRow === customer);
    if (heading) heading.textContent = `${label} · ${platform === 'api' ? 'Claude API' : 'Claude Platform on AWS'}`;
    if (platform === 'aws') {
      status.textContent = 'unrestricted';
      actions.textContent = 'Empty list';
      explanation.textContent = 'On Claude Platform on AWS, these fields do not report open enforcement actions; they do not establish a clean enforcement record. Open actions do not cause refusals there.';
    } else if (customer === 'a') {
      status.textContent = 'restricted';
      actions.textContent = 'One hypothetical restriction';
      explanation.textContent = 'In this illustrated Claude API record, the restriction is attached to Customer A’s profile. Customer B has a separate profile. This does not guarantee that an organization-wide action cannot occur.';
    } else {
      status.textContent = 'unrestricted';
      actions.textContent = 'No open actions';
      explanation.textContent = 'This illustrated Claude API record reports no open actions for Customer B. Customer A’s restriction belongs to a different profile. These sample records do not show live traffic or guarantee that a request will succeed.';
    }
    paint(customer, animate);
  }
  for (const button of controls.querySelectorAll('button[data-cr-customer]')) {
    button.addEventListener('click', () => { customer = button.dataset.crCustomer; select(); });
  }
  for (const button of controls.querySelectorAll('button[data-cr-platform]')) {
    button.addEventListener('click', () => { platform = button.dataset.crPlatform; select(false); });
  }
  select(false);
  controls.hidden = false;
  import('../vendor/three/three.module.js').then(T => {
    paint = registerCutaway(T, root, rows);
    paint(customer, false);
  }).catch(() => { /* Complete HTML register and interaction remain available. */ });
}

function registerCutaway(T, root, rows) {
  const host = root.querySelector('[data-cr-folder]');
  if (!host) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  let renderer, resize, intersection, frame = 0, disposed = false, visible = true;
  let selected = 'a';
  const objects = [], records = [];
  const onVisibility = () => { if (document.hidden) settle(); };
  const onMotion = () => { if (reduced.matches) settle(); };
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resize?.disconnect(); intersection?.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    reduced.removeEventListener('change', onMotion);
    renderer?.dispose(); canvas.remove(); delete host.dataset.crGraphics;
    for (const row of rows) row.style.transform = '';
    for (const mesh of objects) { mesh.geometry.dispose(); mesh.material.dispose(); }
  }
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(0, 1, 0, 1, .1, 100);
  camera.position.z = 20;
  try {
    renderer = new T.WebGLRenderer({canvas, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    for (const row of rows) {
      const group = new T.Group(), meshes = [];
      for (const color of [0xb3a88d, 0x6b6453, 0xfff8e9, 0x84795f]) {
        const mesh = new T.Mesh(new T.BoxGeometry(1,1,.3), new T.MeshBasicMaterial({color}));
        group.add(mesh); objects.push(mesh); meshes.push(mesh);
      }
      records.push({row, group, meshes, current:0, from:0, target:0});
      scene.add(group);
    }
    host.prepend(canvas);
    host.dataset.crGraphics = 'ready';
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); dispose(); }, {once:true});
  } catch { dispose(); return () => {}; }
  function render() {
    if (disposed) return;
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.right = width; camera.bottom = height; camera.updateProjectionMatrix();
    for (const record of records) {
      const {row, group, meshes, current} = record;
      const w = row.offsetWidth, h = row.offsetHeight;
      const shift = current * 5;
      group.position.set(row.offsetLeft + w/2 + shift, row.offsetTop + h/2, 0);
      row.style.transform = `translateX(${shift}px)`;
      meshes[0].scale.set(w,h,1); meshes[0].position.set(3 + current*2,3 + current*2,-2);
      meshes[1].scale.set(w,h,1); meshes[1].position.set(0,0,-1);
      meshes[2].scale.set(w-2,h-2,1); meshes[2].position.set(0,0,0);
      meshes[3].scale.set(6,h-2,1); meshes[3].position.set(-w/2+4,0,1);
      meshes[3].material.color.setHex(row.dataset.crRow === selected ? 0x9b412d : 0x84795f);
    }
    renderer.render(scene,camera);
  }
  function settle() { cancelAnimationFrame(frame); for (const record of records) record.current = record.target; render(); }
  function change(customer, animate = true) {
    if (disposed) return;
    selected = customer; cancelAnimationFrame(frame);
    for (const record of records) { record.from = record.current; record.target = record.row.dataset.crRow === customer ? 1 : 0; }
    if (!animate || reduced.matches || !visible || document.hidden) { settle(); return; }
    const start = performance.now();
    function tick(now) {
      if (disposed) return;
      const p = Math.min(1, (now-start)/300), eased = 1-(1-p)**3;
      for (const record of records) record.current = record.from + (record.target-record.from)*eased;
      render();
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }
  resize = new ResizeObserver(() => change(selected, false)); resize.observe(host);
  intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) settle(); }); intersection.observe(host);
  document.addEventListener('visibilitychange', onVisibility);
  reduced.addEventListener('change', onMotion);
  window.addEventListener('pagehide', dispose, {once:true});
  return change;
}
