// A schematic local speech kit. Motion assembles its parts; it makes no timing claim.
for (const root of document.querySelectorAll('[data-phonon-kit]')) enhance(root);
function enhance(root) {
  const style = document.createElement('style');
  style.textContent = `
  [data-phonon-kit]{margin:2rem 0;color:#20271f;--kit-paper:#fff7e7;--kit-green:#245640;--kit-rust:#a4472f}
  [data-phonon-kit] [hidden]{display:none!important}
  [data-phonon-kit] [data-kit-controls]{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem;margin:1.2rem 0}
  [data-phonon-kit] button{min-height:48px;border:2px solid #20271f;padding:.7rem .55rem;background:var(--kit-paper);color:#20271f;font:700 16px/1.35 system-ui;cursor:pointer}
  [data-phonon-kit] button[aria-pressed=true]{background:var(--kit-green);color:#fff7e7}
  [data-phonon-kit] button:focus-visible{outline:3px solid var(--kit-rust);outline-offset:3px}
  [data-phonon-kit] .phonon-case{border:2px solid #20271f;background:#eee3ca;padding:1rem;box-shadow:5px 5px 0 #b6ab91}
  [data-phonon-kit] .phonon-stamp{font:700 16px/1.4 system-ui;margin:0;padding:0 0 .7rem;border-bottom:2px solid #20271f}
  [data-phonon-kit] [data-kit-drawing]{height:172px;width:100%;position:relative}
  [data-phonon-kit] canvas{display:block;width:100%;height:100%;pointer-events:none}
  [data-phonon-kit] .phonon-plate-key{font:16px/1.45 system-ui;margin:.5rem 0}
  [data-phonon-kit] .phonon-parts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem;margin:1rem 0}
  [data-phonon-kit] .phonon-parts>div{padding:.85rem;background:var(--kit-paper);border:1px solid #20271f;border-top:6px solid var(--kit-green);min-width:0}
  [data-phonon-kit] .phonon-parts>div:nth-child(2){border-top-color:#252a23}
  [data-phonon-kit] .phonon-parts>div:nth-child(3){border-top-color:var(--kit-rust)}
  [data-phonon-kit] dt{font:700 18px/1.3 Georgia,serif;margin:0 0 .4rem}
  [data-phonon-kit] dd{font:16px/1.45 system-ui;margin:0}
  [data-phonon-kit] .phonon-utterance{border-top:2px dashed #716c5b;padding-top:.5rem}
  [data-phonon-kit] .phonon-utterance p{margin:.7rem 0;font:16px/1.5 system-ui}
  [data-phonon-kit] .phonon-utterance strong{display:block;font-size:16px}
  [data-phonon-kit] .phonon-utterance span{display:block}
  [data-phonon-kit] [data-kit-status]{border-left:5px solid var(--kit-green);padding:.4rem 0 .4rem .85rem;font:17px/1.5 system-ui;min-height:4.5em}
  [data-phonon-kit] .phonon-boundary{font:16px/1.5 system-ui}
  @media(max-width:600px){[data-phonon-kit] [data-kit-controls]{grid-template-columns:1fr}[data-phonon-kit] .phonon-parts{grid-template-columns:1fr}[data-phonon-kit] .phonon-parts>div{padding:.75rem}[data-phonon-kit] .phonon-case{padding:.8rem}[data-phonon-kit] [data-kit-drawing]{height:150px}[data-phonon-kit] [data-kit-status]{min-height:0}}
  `;
  root.append(style);
  const descriptions = [
    'Download the model, runtime and a ready catalogue voice. For a custom voice, the documented Gradium preparation route uses its hosted service before you download the voice file.',
    'With the assets already local, the runtime uses the model and voice embedding to generate speech from new text. This repeated synthesis step needs no speech-service request.',
    'Change the words; keep the runtime, model and voice file. The embedding conditions the voice again. It does not contain a prerecorded version of either example sentence.'
  ];
  let step = 0, paint = () => {};
  function select(value, animate = true) {
    step = value;
    root.dataset.kitState = String(step);
    root.querySelectorAll('[data-kit-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.kitStep) === step)));
    root.querySelector('[data-kit-location]').textContent = step === 0 ? 'Get the kit · installation can use the network' : 'On the device · the same kit stays in place';
    root.querySelector('[data-kit-text]').textContent = step === 2 ? '“Tomorrow, it opens at nine.”' : '“The library closes at six.”';
    root.querySelector('[data-kit-output]').textContent = step === 0 ? 'Keep the required files locally before synthesis.' : step === 1 ? 'New speech from the first sentence.' : 'New speech from a different sentence.';
    root.querySelector('[data-kit-status]').textContent = descriptions[step];
    paint(step, animate);
  }
  root.querySelectorAll('[data-kit-step]').forEach(button => button.addEventListener('click', () => select(Number(button.dataset.kitStep))));
  root.querySelector('[data-kit-controls]').hidden = false;
  select(0, false);
  import('../vendor/three/three.module.js').then(T => { paint = drawing(T, root); paint(step, false); }).catch(() => {});
}
function drawing(T, root) {
  const host = root.querySelector('[data-kit-drawing]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let renderer, observer, resize, frame = 0, visible = true, dead = false, current = 0, target = 0;
  const canvas = document.createElement('canvas');
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-3,3,2,-2,.1,30);
  camera.position.set(5,6,9); camera.lookAt(0,0,0);
  const parts = [];
  function dispose() {
    if (dead) return; dead = true; cancelAnimationFrame(frame);
    observer?.disconnect(); resize?.disconnect();
    document.removeEventListener('visibilitychange', visibility);
    reduced.removeEventListener('change', motion);
    for(const part of parts) { part.geometry.dispose(); part.material.dispose(); }
    renderer?.dispose(); canvas.remove(); host.hidden = true; root.querySelector(".phonon-plate-key").hidden = true;
  }
  function render() {
    if(dead) return;
    parts.forEach((part,i) => {part.position.set(0,(i-1)*(1.0-current*.64),0);});
    renderer.render(scene,camera);
  }
  function settle() {cancelAnimationFrame(frame);current=target;render();}
  function visibility() {if(document.hidden) settle();}
  function motion() {if(reduced.matches) settle();}
  try {
    renderer = new T.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    for(const color of [0x245640,0x252a23,0xa4472f]) {
      const mesh = new T.Mesh(new T.BoxGeometry(3,.18,1.7),new T.MeshBasicMaterial({color}));
      parts.push(mesh);scene.add(mesh);
    }
    host.hidden = false;root.querySelector(".phonon-plate-key").hidden = false;host.append(canvas);
    resize = new ResizeObserver(() => {const w=host.clientWidth,h=host.clientHeight; if(!w||!h)return;renderer.setSize(w,h,false);const aspect=w/h;camera.left=-2.1*aspect;camera.right=2.1*aspect;camera.top=2.1;camera.bottom=-2.1;camera.updateProjectionMatrix();render();});resize.observe(host);
    observer = new IntersectionObserver(([entry]) => {visible=entry.isIntersecting;if(!visible)settle();});observer.observe(root);
    document.addEventListener('visibilitychange',visibility);
    reduced.addEventListener('change',motion);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();dispose();},{once:true});
    window.addEventListener('pagehide',dispose,{once:true});
  } catch {dispose();return()=>{};}
  return (step,animate) => {
    cancelAnimationFrame(frame);target=step===0?0:1;
    if(!animate||reduced.matches||document.hidden||!visible){settle();return;}
    const from=current,start=performance.now();
    function tick(now) {if(dead)return;const t=Math.min(1,(now-start)/650);current=from+(target-from)*(1-(1-t)**3);render();if(t<1)frame=requestAnimationFrame(tick);}
    frame=requestAnimationFrame(tick);
  };
}
