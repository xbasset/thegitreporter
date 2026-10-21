// Schematic request assembly. Motion shows the location of an update, never cache timing.
for (const root of document.querySelectorAll('[data-prefix-visual]')) enhance(root);
function enhance(root) {
  const style = document.createElement('style');
  style.textContent = `[data-prefix-visual]{--px-ink:#20261e;--px-green:#174b38;--px-rust:#a33e27;margin:2rem 0;color:var(--px-ink)}
  [data-prefix-visual] [hidden]{display:none!important}
  [data-prefix-visual] .prefix-switch{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0}
  [data-prefix-visual] button{min-height:48px;padding:.7rem .9rem;border:2px solid var(--px-ink);background:#fff7e4;color:var(--px-ink);font:700 1rem/1.3 system-ui;cursor:pointer}
  [data-prefix-visual] button[aria-pressed=true]{background:var(--px-green);color:#fff7e4}
  [data-prefix-visual] button:focus-visible{outline:3px solid var(--px-rust);outline-offset:4px}
  [data-prefix-visual] .prefix-pair{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem}
  [data-prefix-visual] .prefix-card{min-width:0;border:2px solid var(--px-ink);background:#f1e7d3;padding:1rem;box-shadow:3px 4px 0 #b5ab94}
  [data-prefix-visual] h3{font:700 1.3rem/1.2 Georgia,serif;margin:0 0 .5rem}
  [data-prefix-visual] .prefix-rule{font:1rem/1.45 system-ui;margin:.5rem 0 1rem}
  [data-prefix-visual] .prefix-strip{position:relative;isolation:isolate}
  [data-prefix-visual] .prefix-strip canvas{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}
  [data-prefix-visual] .prefix-slip{box-sizing:border-box;min-height:98px;margin:.6rem 0;padding:.7rem .8rem .7rem 1.2rem;border:1px solid #807963;border-left:6px solid var(--px-ink);background:#fff9ec}
  [data-prefix-visual] .prefix-slip strong{display:block;font:700 .9rem/1.3 system-ui;margin-bottom:.3rem}
  [data-prefix-visual] .prefix-slip span{display:block;font:1.1rem/1.4 system-ui}
  [data-prefix-visual] .prefix-slip small{display:block;font:.9rem/1.4 system-ui;margin-top:.25rem}
  [data-prefix-visual] .prefix-slip[data-location=history]{background:#e4ddcc!important}
  [data-prefix-visual][data-done=true] .prefix-rewrite [data-location=opening]{border-left-color:var(--px-rust)}
  [data-prefix-visual][data-done=true] .prefix-append [data-location=tail]{border-left-color:var(--px-green)}
  [data-prefix-visual] [data-prefix-status]{border-left:4px solid var(--px-green);padding:.6rem .8rem;font:1rem/1.5 system-ui}
  [data-prefix-visual] .prefix-note{font:.95rem/1.5 system-ui}
  [data-prefix-visual] .prefix-strip[data-graphics=ready] .prefix-slip{margin-left:15px}
  @media(max-width:640px){[data-prefix-visual] .prefix-pair{grid-template-columns:1fr}[data-prefix-visual] .prefix-card{padding:.8rem}[data-prefix-visual] .prefix-switch{display:grid;grid-template-columns:1fr 1fr}[data-prefix-visual] button{padding:.65rem .35rem}}
`;
  root.append(style);
  let done = true;
  let paint = () => {};
  const buttons = [...root.querySelectorAll('[data-prefix-state]')];
  function update(next, animate = true) {
    done = next;
    root.dataset.done = String(done);
    root.querySelector('.prefix-rewrite [data-location=opening]').style.borderLeftColor = done ? '#a33e27' : '#20261e';
    root.querySelector('.prefix-append [data-location=tail]').style.borderLeftColor = done ? '#174b38' : '#20261e';
    buttons.forEach(b => b.setAttribute('aria-pressed', String((b.dataset.prefixState === 'done') === done)));
    root.querySelector('[data-rewrite-value]').textContent = done ? 'Todo: done' : 'Todo: pending';
    root.querySelector('[data-rewrite-detail]').textContent = done ? 'Current value replaces the earlier one here.' : 'The initial value appears here.';
    root.querySelector('[data-rewrite-tail-detail]').textContent = done ? 'The instruction changed at the opening.' : 'No instruction change has happened yet.';
    root.querySelector('[data-tail-value]').textContent = done ? 'Todo: done' : 'No replacement yet';
    root.querySelector('[data-tail-detail]').textContent = done ? 'Identifies the replacement value.' : 'An unchanged value adds nothing.';
    root.querySelector('[data-opening-detail]').textContent = done ? 'Later update says this value is superseded.' : 'Original value retained.';
    root.querySelector('[data-prefix-status]').textContent = root.querySelector(done ? '[data-status-done]' : '[data-status-pending]').textContent;
    paint(done, animate);
  }
  buttons.forEach(b => b.addEventListener('click', () => update(b.dataset.prefixState === 'done')));
  root.querySelectorAll('[data-prefix-controls]').forEach(controls => { controls.hidden = false; });
  update(true, false);
  import('../vendor/three/three.module.js').then(T => {
    paint = makeMarkers(T, root);
    update(done, false);
  }).catch(() => { /* The complete DOM diagram remains visible. */ });
}
function makeMarkers(T, root) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true, frame = 0, target = true, disposed = false;
  let resizeObserver, intersectionObserver;
  const onVisibility = () => { if(document.hidden) { cancelAnimationFrame(frame); render(); } };
  const onMotion = () => change(target,false);
  const scenes = [];
  function disposeGraphics() {
    if(disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange',onVisibility);
    reduced.removeEventListener('change',onMotion);
    for (const s of scenes) { s.marker.geometry.dispose(); s.marker.material.dispose(); s.renderer.dispose(); s.canvas.remove(); s.slips.forEach(({element,marginLeft}) => { element.style.marginLeft = marginLeft; }); delete s.host.dataset.graphics; }
  }
  try {
    for (const host of root.querySelectorAll('[data-prefix-strip]')) {
      const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden','true'); host.prepend(canvas);
      const renderer = new T.WebGLRenderer({canvas,alpha:true,antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
      const scene = new T.Scene(); const camera = new T.OrthographicCamera(-1,1,1,-1,.1,20); camera.position.set(0,0,5);
      const material = new T.MeshBasicMaterial({color:host.dataset.prefixStrip==='append'?0x174b38:0xa33e27});
      const marker = new T.Mesh(new T.BoxGeometry(1,1,.15),material); scene.add(marker);
      const slips = [...host.querySelectorAll('.prefix-slip')].map(element => ({element,marginLeft:element.style.marginLeft}));
      slips.forEach(({element}) => { element.style.marginLeft = '15px'; });
      const record = {host,canvas,renderer,scene,camera,marker,slips,append:host.dataset.prefixStrip==='append',from:0,to:0}; scenes.push(record);
      host.dataset.graphics='ready';
      canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); disposeGraphics(); },{once:true});
    }
  } catch { disposeGraphics(); return () => {}; }
  function position(s,done) {
    const slip=s.host.querySelector(`[data-location="${done&&s.append?'tail':'opening'}"]`);
    return slip.offsetTop + slip.offsetHeight / 2;
  }
  function render(progress=1) {
    if(disposed) return;
    for(const s of scenes) {
      const w=s.host.clientWidth,h=s.host.clientHeight;
      s.renderer.setSize(w,h,false); s.camera.left=0;s.camera.right=w;s.camera.top=0;s.camera.bottom=h;s.camera.updateProjectionMatrix();
      s.marker.position.set(5,s.from+(s.to-s.from)*progress,0);
      s.marker.scale.set(9,30,1); s.marker.rotation.z=(1-progress)*.3;
      s.renderer.render(s.scene,s.camera);
    }
  }
  function change(done,animate=true) {
    if(disposed) return;
    target=done;cancelAnimationFrame(frame);
    for(const s of scenes){s.from=s.marker.position.y||position(s,done);s.to=position(s,done);}
    if(!animate||reduced.matches||!visible||document.hidden){render();return;}
    const start=performance.now();
    function step(now){if(disposed) return;const p=Math.min(1,(now-start)/420);render(1-(1-p)**3);if(p<1)frame=requestAnimationFrame(step);}
    frame=requestAnimationFrame(step);
  }
  resizeObserver = new ResizeObserver(()=>change(target,false));
  resizeObserver.observe(root);
  intersectionObserver = new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);render();}});
  intersectionObserver.observe(root);
  document.addEventListener('visibilitychange',onVisibility);
  reduced.addEventListener('change',onMotion);
  return change;
}
