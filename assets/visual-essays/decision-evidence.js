// Paper cutaways explain request contents; motion does not represent model execution.
for (const root of document.querySelectorAll('[data-decision-evidence]')) enhance(root);

function enhance(root) {
  const style = document.createElement('style');
  style.textContent = `
  [data-decision-evidence]{--de-ink:#24271f;--de-green:#24563e;--de-rust:#9c402d;color:var(--de-ink);margin:2rem 0}
  [data-decision-evidence] [hidden]{display:none!important}
  [data-decision-evidence] p{font:16px/1.55 system-ui;overflow-wrap:anywhere}
  [data-decision-evidence] .de-controls{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1.4rem 0}
  [data-decision-evidence] fieldset{min-width:0;border:0;padding:0;margin:0}
  [data-decision-evidence] legend{font:700 16px/1.4 system-ui;margin-bottom:.55rem;padding:0}
  [data-decision-evidence] .de-buttons{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
  [data-decision-evidence] button{min-width:0;min-height:52px;padding:.7rem .45rem;border:2px solid var(--de-ink);background:#fff8e9;color:var(--de-ink);font:700 16px/1.3 system-ui;cursor:pointer}
  [data-decision-evidence] button[aria-pressed=true]{background:var(--de-green);color:#fff8e9}
  [data-decision-evidence] button:focus-visible{outline:3px solid var(--de-rust);outline-offset:3px}
  [data-decision-evidence] .de-example{border-top:2px solid var(--de-ink);padding-top:1rem;margin-bottom:1.2rem}
  [data-decision-evidence] .de-example strong{display:block;margin-bottom:.3rem}
  [data-decision-evidence] .de-paths{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem}
  [data-decision-evidence][data-de-enhanced] .de-paths{display:block}
  [data-decision-evidence] .de-case{min-width:0;padding:1.1rem;background:#eee3cd;border:2px solid var(--de-ink);box-shadow:4px 5px 0 #b0a78e}
  [data-decision-evidence] .de-location{margin:0 0 .55rem;font-weight:700;border-bottom:2px solid var(--de-ink);padding-bottom:.65rem}
  [data-decision-evidence] h3{font:700 clamp(23px,4vw,30px)/1.15 Georgia,serif;margin:.7rem 0 1rem}
  [data-decision-evidence] .de-dossier{position:relative;isolation:isolate;padding:4px 18px 8px 4px}
  [data-decision-evidence] .de-sheet{position:relative;box-sizing:border-box;min-height:88px;padding:12px 12px;margin:12px 0;background:#fff8e8;border:1px solid #6b6453;border-left:6px solid var(--de-rust);box-shadow:3px 3px 0 #c6bca4}
  [data-decision-evidence] .de-sheet:first-of-type{border-left-color:var(--de-green)}
  [data-decision-evidence] .de-sheet strong{display:block;font:700 16px/1.3 system-ui;margin-bottom:5px}
  [data-decision-evidence] .de-sheet br{display:none}
  [data-decision-evidence] .de-sheet span{display:block;font:16px/1.4 system-ui}
  [data-decision-evidence] canvas{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}
  [data-decision-evidence] [data-de-graphics=ready] .de-sheet{background:transparent;border-color:transparent;box-shadow:none}
  [data-decision-evidence] .de-state{border-left:5px solid var(--de-green);padding:.45rem 0 .45rem .85rem;margin:1.1rem 0;font-size:17px}
  [data-decision-evidence] .de-result{padding-top:.75rem;border-top:1px dashed #716a56}
  [data-decision-evidence] .de-receipt{margin-bottom:0}
  [data-decision-evidence] .de-bottom{margin-top:1.25rem}
  @media(max-width:640px){[data-decision-evidence] .de-controls,[data-decision-evidence] .de-paths{grid-template-columns:1fr}[data-decision-evidence] .de-case{padding:.8rem}[data-decision-evidence] .de-dossier{padding-right:15px}[data-decision-evidence] .de-sheet{min-height:96px;padding:10px 9px}[data-decision-evidence] .de-controls{gap:1.1rem}}
  `;
  root.append(style);
  const panels = [...root.querySelectorAll('[data-de-panel]')];
  let path = 'hosted', question = 'first', paint = () => {};
  const descriptions = {
    hosted: {
      first: 'Shared input holds the dossier. The question and its instructions sit outside the reusable prefix. A request alone does not guarantee a cache hit.',
      another: 'The question changes; the dossier stays the same. An unchanged shared-input prefix of at least 1,024 tokens can be reused on a matching cache hit.'
    },
    local: {
      first: 'The MLX scorer assembles state, question and options into one full prompt, then runs a forward pass. This path reports zero cached tokens.',
      another: 'The dossier stays the same, but the new question gets its own full prompt and forward pass. This MLX path again reports zero cached tokens.'
    }
  };
  function select(animate = true) {
    root.dataset.dePath = path;
    root.dataset.deQuestion = question;
    root.querySelectorAll('[data-de-path]').forEach(button => {
      if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.dePath === path));
    });
    root.querySelectorAll('[data-de-question]').forEach(button => {
      if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.deQuestion === question));
    });
    for (const panel of panels) {
      panel.hidden = panel.dataset.dePanel !== path;
      panel.querySelector('[data-de-question-text]').textContent = question === 'first' ? 'Which team should handle this?' : 'How urgent is the request?';
      panel.querySelector('[data-de-options]').textContent = question === 'first' ? 'Billing · returns · technical' : 'Routine · soon · today';
      panel.querySelector('[data-de-status]').textContent = descriptions[panel.dataset.dePanel][question];
    }
    paint(path, question, animate);
  }
  root.querySelectorAll('button[data-de-path]').forEach(button => button.addEventListener('click', () => {
    path = button.dataset.dePath; select(false);
  }));
  root.querySelectorAll('button[data-de-question]').forEach(button => button.addEventListener('click', () => {
    question = button.dataset.deQuestion; select();
  }));
  root.dataset.deEnhanced = 'true';
  root.querySelector('[data-de-controls]').hidden = false;
  for (const panel of panels) panel.querySelector('[data-de-status]').setAttribute('aria-live', 'polite');
  select(false);
  import('../vendor/three/three.module.js').then(T => {
    paint = paperCutaway(T, root, panels);
    paint(path, question, false);
  }).catch(() => { /* The DOM dossier and all explanations remain readable. */ });
}

function paperCutaway(T, root, panels) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [];
  let disposed = false, frame = 0, visible = true, selected = 'hosted', nextQuestion = 'first';
  let resize, intersection;
  const onVisibility = () => { if (document.hidden) settle(); };
  const onMotion = () => { if (reduced.matches) settle(); };
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resize?.disconnect(); intersection?.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    reduced.removeEventListener('change', onMotion);
    for (const s of scenes) {
      s.renderer?.dispose(); s.canvas.remove(); delete s.host.dataset.deGraphics;
      s.host.querySelectorAll('[data-de-sheet]').forEach(el => { el.style.transform = ''; });
      for (const item of s.objects) { item.geometry.dispose(); item.material.dispose(); }
    }
  }
  try {
    for (const panel of panels) {
      const host = panel.querySelector('[data-de-dossier]');
      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      const s = {host, panel, canvas, objects: [], sheets: [], current: 0, from: 0, to: 0};
      scenes.push(s);
      s.renderer = new T.WebGLRenderer({canvas, alpha:true, antialias:true});
      s.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      s.scene = new T.Scene();
      s.camera = new T.OrthographicCamera(0, 1, 0, 1, .1, 100);
      s.camera.position.z = 20;
      for (const [i, element] of [...host.querySelectorAll('[data-de-sheet]')].entries()) {
        const group = new T.Group();
        const record = {element, group, index:i, meshes:[]};
        // The reverse edges make the paper layers visible without moving the text off its sheet.
        for (const [color, z] of [[0xb0a78e,-2],[0x24271f,-1],[0xfff8e8,0],[i === 0 ? 0x24563e : 0x9c402d,1]]) {
          const mesh = new T.Mesh(new T.BoxGeometry(1,1,.4), new T.MeshBasicMaterial({color}));
          mesh.position.z = z;
          group.add(mesh); record.meshes.push(mesh); s.objects.push(mesh);
        }
        s.scene.add(group); s.sheets.push(record);
      }
      host.prepend(canvas); host.dataset.deGraphics = 'ready';
      canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); dispose(); }, {once:true});
    }
  } catch { dispose(); return () => {}; }

  function render() {
    if (disposed) return;
    for (const s of scenes) {
      if (s.panel.hidden) continue;
      const w = s.host.clientWidth, h = s.host.clientHeight;
      if (!w || !h) continue;
      s.renderer.setSize(w,h,false);
      s.camera.right=w; s.camera.bottom=h; s.camera.updateProjectionMatrix();
      for (const sheet of s.sheets) {
        const el=sheet.element, x=el.offsetLeft, y=el.offsetTop, sw=el.offsetWidth, sh=el.offsetHeight;
        const shift = (selected === 'local' || sheet.index > 0) ? 10*s.current : 0;
        sheet.group.position.set(x+sw/2+shift,y+sh/2,0);
        el.style.transform=`translateX(${shift}px)`;
        sheet.meshes.forEach((mesh,i) => {
          if (i===3) {mesh.scale.set(6,sh-2,1);mesh.position.set(-sw/2+4,0,1);}
          else {mesh.scale.set(sw-(i===2?2:0),sh-(i===2?2:0),1);mesh.position.set(i===0?4:0,i===0?4:0,i-2);}
        });
      }
      s.renderer.render(s.scene,s.camera);
    }
  }
  function settle() {cancelAnimationFrame(frame); for (const s of scenes) s.current=s.to;render();}
  function change(path, question, animate=true) {
    if(disposed)return;
    selected=path;nextQuestion=question;cancelAnimationFrame(frame);
    for(const s of scenes){s.from=s.current;s.to=question==='another'?1:0;}
    if(!animate||reduced.matches||!visible||document.hidden){settle();return;}
    const start=performance.now();
    function tick(now){
      if(disposed)return;
      const p=Math.min(1,(now-start)/380), eased=1-(1-p)**3;
      for(const s of scenes)s.current=s.from+(s.to-s.from)*eased;
      render();if(p<1)frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
  }
  resize=new ResizeObserver(()=>change(selected,nextQuestion,false));
  resize.observe(root);
  for(const s of scenes)resize.observe(s.host);
  intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)settle();});
  intersection.observe(root);
  document.addEventListener('visibilitychange',onVisibility);
  reduced.addEventListener('change',onMotion);
  window.addEventListener('pagehide',dispose,{once:true});
  return change;
}
