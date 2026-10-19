// The visual is a schematic of the causal order inspected in Codex PR #55144.
// Animation duration is editorial pacing, never a runtime measurement.
const root = document.querySelector('[data-codex-observer]');
if (root) start(root);

function start(root) {
  const stage = root.querySelector('[data-scene]');
  const slider = root.querySelector('[data-scrub]');
  const play = root.querySelector('[data-play]');
  const next = root.querySelector('[data-next]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let mode = 'sync', position = 0, playing = false, frame = 0, lastFrame = 0, lastCaption = '';
  let draw = () => {};
  const captions = {
    sync: [
      ['The response begins.', 'Our example has one configured post-request observer. It has nothing to record until this sampling attempt ends.'],
      ['A tool call arrives. It stays in the queue.', 'Codex has received a complete tool-call item, but a synchronous post observer makes dispatch wait. The response is still streaming.'],
      ['The response ends. The tool still waits.', 'The model response is marked completed and its available usage is recorded. Now the post observer can start. Completed does not mean the tool has run.'],
      ['The observer is working.', 'The response has ended. Tool dispatch remains deferred while this synchronous observer runs.'],
      ['The observer finishes. Dispatch can begin.', 'The deferred tool call now reaches dispatch. The observer supplied no permission decision; the ordinary tool controls still apply.'],
    ],
    async: [
      ['The response begins.', 'The same example, with its post observer configured to run in the background.'],
      ['The tool can be dispatched already.', 'A complete tool-call item has arrived. Background post observation leaves streaming dispatch in place, so the tool can begin before the response ends.'],
      ['The response ends. Observation starts.', 'The post observer receives the outcome and available usage after response completion. Tool dispatch did not wait for it.'],
      ['The observer works alongside the turn.', 'Background observation is outside this dispatch barrier. This drawing does not measure how long either job takes.'],
      ['The observer finishes its record.', 'The tool call was dispatched earlier. The new observer output stays diagnostic; it does not enter the model conversation.'],
    ],
  };
  function update() {
    const step = Math.min(4, Math.floor(position + 0.001));
    const dispatched = mode === 'async' ? position >= 1 : position >= 4;
    root.dataset.observerMode = mode;
    root.dataset.sequenceStep = String(step);
    root.dataset.toolDispatched = String(dispatched);
    root.querySelector('[data-model-status]').textContent = step < 1 ? 'Ready to stream' : step < 2 ? 'Still streaming' : 'Response completed';
    root.querySelector('[data-observer-status]').textContent = step < 2 ? 'Waiting for response end' : step < 4 ? 'Recording outcome' : 'Observer finished';
    root.querySelector('[data-tool-status]').textContent = dispatched ? 'Call dispatched' : step === 0 ? 'Call not received yet' : 'Call held in queue';
    const captionKey = mode + step;
    if (captionKey !== lastCaption) {
      root.querySelector('[data-caption-title]').textContent = captions[mode][step][0];
      root.querySelector('[data-caption]').textContent = captions[mode][step][1];
      root.querySelectorAll('[data-step]').forEach(item => {
        if (Number(item.dataset.step) === step) item.setAttribute('aria-current', 'step');
        else item.removeAttribute('aria-current');
      });
      slider.setAttribute('aria-valuetext', `Stage ${step + 1}: ${captions[mode][step][0]}`);
      lastCaption = captionKey;
    }
    slider.value = String(position);
    play.textContent = reduced.matches ? 'Next stage →' : playing ? 'Pause the sequence' : position >= 4 ? 'Replay the sequence ↗' : 'Play the sequence ↗';
    draw(position, mode);
  }
  function pause() { playing = false; cancelAnimationFrame(frame); update(); }
  function tick(now) {
    if (!playing) return;
    position = Math.min(4, position + Math.min(100, now - lastFrame) / 2700);
    lastFrame = now;
    if (position >= 4) playing = false;
    update();
    if (playing) frame = requestAnimationFrame(tick);
  }
  function advance() { pause(); position = position >= 4 ? 0 : Math.min(4, Math.floor(position) + 1); update(); }
  root.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.mode;
    root.querySelectorAll('[data-mode]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    update();
  }));
  slider.addEventListener('input', () => { const value = Number(slider.value); pause(); position = value; update(); });
  next.addEventListener('click', advance);
  play.addEventListener('click', () => {
    if (reduced.matches) { advance(); return; }
    if (playing) { pause(); return; }
    if (position >= 4) position = 0;
    playing = true; lastFrame = performance.now(); update(); frame = requestAnimationFrame(tick);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  reduced.addEventListener('change', pause);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); }, { threshold: 0.05 }).observe(stage);
  root.querySelector('[data-playback]').hidden = false;
  update();
  // A graphics failure leaves the controls, textual sequence and evidence usable.
  import('../vendor/three/three.module.js').then(THREE => {
    draw = makePaperMachine(THREE, stage, update);
    update();
  }).catch(() => { stage.dataset.renderer = 'text'; });
}

function makePaperMachine(T, stage, requestUpdate) {
  const canvas = stage.querySelector('canvas');
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-10, 10, 5.5, -5.5, .1, 80);
  camera.position.set(0, 9.5, 14); camera.lookAt(0, 0, 0);
  scene.add(new T.HemisphereLight(0xfffae9, 0x655b43, 2.4));
  const sun = new T.DirectionalLight(0xfff4dc, 3.2); sun.position.set(-6, 12, 8); sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-13,right:13,top:9,bottom:-9}); sun.shadow.bias = -.001; scene.add(sun);
  const ink = 0x20261e, green = 0x174b38, rust = 0xa33e27;
  const materials = [];
  function paper(color, label = '') {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const ctx = c.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(0,0,512,256);
    // Fixed grain: a printed material, not a constantly moving visual effect.
    let seed = 97;
    for(let i=0;i<6000;i++) { seed = (seed*16807)%2147483647; const x=seed%512; seed = (seed*16807)%2147483647; const y=seed%256; ctx.fillStyle=i%3?'rgba(25,30,22,.06)':'rgba(255,249,225,.18)'; ctx.fillRect(x,y,1+(i%2),1); }
    ctx.strokeStyle='#25291e'; ctx.lineWidth=5; ctx.strokeRect(4,4,504,248); ctx.lineWidth=1.5; ctx.strokeRect(9,7,495,241);
    if(label) { ctx.fillStyle=color==='#174b38'?'#fff7e4':'#25291e'; ctx.font='900 50px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label,256,134); }
    const map = new T.CanvasTexture(c); map.colorSpace=T.SRGBColorSpace;
    const mat = new T.MeshStandardMaterial({map,roughness:1,metalness:0}); materials.push(mat); return mat;
  }
  const cream = paper('#eee1c6'), white = paper('#fff7e4'), forest = paper('#174b38'), cardboard = paper('#bdab85');
  const red = new T.MeshStandardMaterial({color:rust,roughness:1}); materials.push(red);
  function block(w,h,d,mat,x,y,z,parent=scene) {
    const geo = new T.BoxGeometry(w,h,d); const mesh = new T.Mesh(geo,mat); mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true;
    const edge = new T.LineSegments(new T.EdgesGeometry(geo),new T.LineBasicMaterial({color:ink})); mesh.add(edge); parent.add(mesh);return mesh;
  }
  const floor = new T.Mesh(new T.PlaneGeometry(22,12),new T.ShadowMaterial({opacity:.16})); floor.rotation.x=-Math.PI/2; floor.position.y=-.2;floor.receiveShadow=true;scene.add(floor);
  block(18.5,.2,4,cardboard,0,0,0).rotation.y=-.012;
  // Three paper tracks: the response path and a visibly separate dispatch branch.
  block(15,.09,1.25,white,0,.22,-.55);
  const branch=block(14,.08,.55,cream,0,.25,1.3); branch.rotation.y=-.012;
  function stroke(points,color=ink) { const line=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),new T.LineBasicMaterial({color}));scene.add(line);return line; }
  stroke([[-7,.31,-.55],[7,.31,-.55]]);stroke([[-6,.32,1.3],[7,.32,1.3]],green);
  for(let i=0;i<11;i++) block(.13,.12,1.4,cardboard,-7.5+i*1.5,.05,-.55);
  const model = new T.Group();model.position.set(-6,0,0);scene.add(model);
  block(2.6,2.1,1.5,cream,0,1.3,-.5,model).rotation.z=.025;
  const rollGeo = new T.CylinderGeometry(.82,.82,1.6,48);
  const roll = new T.Mesh(rollGeo,white);roll.rotation.x=Math.PI/2;roll.position.set(0,2.4,-.55);roll.castShadow=true;model.add(roll);
  const core=new T.Mesh(new T.CylinderGeometry(.24,.24,1.65,32),cardboard);core.rotation.x=Math.PI/2;core.position.copy(roll.position);model.add(core);
  const sheet=block(2.3,.06,2.4,white,0,1.6,.65,model);sheet.rotation.x=.38;
  for(let i=0;i<4;i++)block(1.8,.018,.04,forest,0,1.75-i*.1,.1+i*.3,model);
  const observer=new T.Group();scene.add(observer);
  block(2.35,1.25,1.8,cardboard,0,.95,-.45,observer);
  const eyeCard=block(2.5,2,.2,white,0,2.3,-.35,observer);eyeCard.rotation.z=-.025;
  const eye=new T.Mesh(new T.TorusGeometry(.58,.06,10,48),new T.MeshStandardMaterial({color:ink,roughness:1}));eye.scale.y=.55;eye.position.set(0,2.35,-.2);observer.add(eye);
  const pupil = new T.Mesh(new T.SphereGeometry(.24,20,12),new T.MeshStandardMaterial({color:ink,roughness:1}));pupil.scale.z=.25;pupil.position.set(0,2.35,-.15);observer.add(pupil);
  block(.7,.16,.4,red,0,1.1,.7,observer);
  const receipt=block(1.3,.05,1.5,white,0,.68,1.13,observer);receipt.rotation.x=.3;
  for(let i=0;i<3;i++)block(.9,.018,.04,forest,0,.85-i*.08,.8+i*.25,observer);
  const parcel = new T.Group();parcel.position.set(5.8,0,0);scene.add(parcel);
  block(2.2,1.7,1.6,forest,0,1.1,-.45,parcel);
  block(.27,1.73,1.63,cream,0,1.1,-.45,parcel);
  const toolIcon = new T.Group();toolIcon.position.set(0,1.2,.45);parcel.add(toolIcon);
  block(.18,.8,.08,white,0,0,0,toolIcon).rotation.z=-.6;
  const ring=new T.Mesh(new T.TorusGeometry(.25,.095,8,20),white);ring.position.set(.23,.34,0);toolIcon.add(ring);
  const gate = block(2.5,.25,.18,red,5.8,1.65,1.0);gate.rotation.z=-.02;
  const arrow = new T.ArrowHelper(new T.Vector3(1,0,0),new T.Vector3(-4.5,.45,1.3),8,green,.5,.3);scene.add(arrow);
  const token = block(.55,.12,.5,forest,-6,.42,-.55);
  const postToken = block(.55,.12,.5,red,0,.43,1.3);postToken.visible=false;
  let lost=false;
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost=true;stage.dataset.renderer='text'; });
  canvas.addEventListener('webglcontextrestored', () => { lost=false;stage.dataset.renderer='webgl';requestUpdate(); });
  function resize() {
    const {width,height}=stage.getBoundingClientRect();
    renderer.setSize(width,height,false);
    const aspect=width/height, halfWidth=10.1, halfHeight=Math.max(5.1,halfWidth/aspect);
    camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix();
    requestUpdate();
  }
  new ResizeObserver(resize).observe(stage);
  stage.dataset.renderer='webgl';
  stage.dataset.threeVersion=T.REVISION;
  return (p,mode) => {
    if(lost)return;
    const dispatched=mode==='async'?p>=1:p>=4;
    token.position.x=-6+Math.min(2,p)*3;
    roll.rotation.z=-Math.min(p,2)*.6;
    postToken.visible=p>=2;postToken.position.z=1.3+Math.max(0,p-2)*.15;
    observer.rotation.z=p>=2&&p<4?Math.sin((p-2)*Math.PI*3)*.025:0;
    receipt.scale.z=p<2?.3:Math.min(1,.3+(p-2)*.35);
    gate.rotation.z=dispatched?-Math.PI/2:-.02;
    gate.position.y=dispatched?2.5:1.65;
    parcel.position.x=dispatched?6.65:5.8;
    parcel.rotation.y=dispatched?-.1:0;
    arrow.visible=mode==='async'&&p>=1;
    renderer.render(scene,camera);
  };
}
