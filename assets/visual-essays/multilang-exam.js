// A cutaway of one committed MultiLangBench test fixture, not a model run.
// Stage changes are instantaneous; their duration carries no measurement.
const roots = document.querySelectorAll('[data-multilang-exam]');
for (const root of roots) setup(root);

function setup(root) {
  const style = document.createElement('style');
  style.textContent = `
    [data-multilang-exam] { --exam-ink:#24291f; --exam-green:#174b38; --exam-rust:#a33e27; margin:2rem 0; color:var(--exam-ink); }
    [data-multilang-exam] .exam-controls { display:grid; grid-template-columns:repeat(4,1fr); gap:.35rem; margin:1rem 0; }
    [data-multilang-exam] .exam-controls[hidden], [data-multilang-exam] [hidden] { display:none!important; }
    [data-multilang-exam] .exam-controls button { font:600 .85rem/1.2 system-ui,sans-serif; min-height:48px; border:1px solid var(--exam-ink); background:#fff7e4; color:var(--exam-ink); padding:.5rem .2rem; cursor:pointer; }
    [data-multilang-exam] .exam-controls button[aria-pressed="true"] { background:var(--exam-green); color:#fff7e4; }
    [data-multilang-exam] button:focus-visible, [data-multilang-exam] summary:focus-visible { outline:3px solid var(--exam-rust); outline-offset:3px; }
    [data-multilang-exam] .exam-caption { min-height:5.8rem; border-left:3px solid var(--exam-green); padding:.1rem .8rem; }
    [data-multilang-exam] .exam-caption strong { display:block; font-family:Georgia,serif; font-size:1.25rem; margin-bottom:.35rem; }
    [data-multilang-exam] .exam-caption p { margin:.2rem 0; font-size:1rem; }
    [data-multilang-exam] .exam-scene { width:100%; height:460px; background:#eee4cf; border:1px solid var(--exam-ink); }
    [data-multilang-exam] .exam-scene canvas { width:100%; height:100%; display:block; }
    [data-multilang-exam] .exam-static { margin:1.1rem 0; }
    [data-multilang-exam] summary { cursor:pointer; font-weight:700; padding:.7rem 0; }
    [data-multilang-exam] .exam-matrix { width:100%; border-collapse:collapse; font: .8rem/1.4 ui-monospace,monospace; text-align:center; }
    [data-multilang-exam] .exam-matrix caption { text-align:left; font:600 1rem/1.5 system-ui,sans-serif; margin:.5rem 0; }
    [data-multilang-exam] .exam-matrix th, [data-multilang-exam] .exam-matrix td { padding:.5rem .1rem; border:1px solid #b2a78e; }
    [data-multilang-exam] .exam-matrix td[data-match] { box-shadow:inset 0 0 0 2px var(--exam-green); font-weight:700; }
    [data-multilang-exam][data-exam-step="0"] .exam-matrix td[data-match] { box-shadow:none; font-weight:400; }
    [data-multilang-exam] .exam-output { border-collapse:collapse; width:100%; max-width:18rem; }
    [data-multilang-exam] .exam-output td, [data-multilang-exam] .exam-output th { padding:.35rem .8rem; border-bottom:1px solid #b2a78e; text-align:left; }
    [data-multilang-exam] .exam-note { font-size:.9rem; line-height:1.5; }
    @media(max-width:480px) { [data-multilang-exam] .exam-scene { height:400px; } [data-multilang-exam] .exam-matrix { font-size:.7rem; } }
  `;
  root.append(style);
  const captions = [
    ['Start with all 36 pairs.', 'The fixture supplies every combination of x and y from 1 to 6. The grid is a drawing of those rows.'],
    ['Keep three pairs.', 'The condition keeps x = 2 and y equal to 2, 4 or 5. All other pairs fall outside it.'],
    ['Put the selected rows in table r.', 'The query orders the selected rows by y, descending: (2,5), (2,4), then (2,2).'],
    ['SQLite reads the result.', 'Reference SQLite reads table r in rowid order. The fixture expects these three rows. This is a test example, not a model result.'],
  ];
  const stage = root.querySelector('[data-exam-scene]');
  const title = root.querySelector('[data-exam-title]');
  const caption = root.querySelector('[data-exam-caption]');
  let current = 0;
  let render = () => {};
  function update(step) {
    current = step;
    root.dataset.examStep = String(step);
    title.textContent = captions[step][0];
    caption.textContent = captions[step][1];
    root.querySelectorAll('[data-exam-stage]').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.examStage) === step));
    });
    render(step);
  }
  root.querySelectorAll('[data-exam-stage]').forEach(button => {
    button.addEventListener('click', () => update(Number(button.dataset.examStage)));
  });
  root.querySelector('[data-exam-controls]').hidden = false;
  root.querySelector('[data-exam-live]').hidden = false;
  update(0);
  // Text and the source table remain usable if the module or graphics fail.
  import('../vendor/three/three.module.js').then(T => {
    render = makeCutaway(T, stage, () => update(current));
    stage.hidden = false;
    root.querySelector('[data-exam-static]').open = false;
    update(current);
  }).catch(() => { stage.hidden = true; });
}

function makeCutaway(T, stage, redraw) {
  const canvas = stage.querySelector('canvas');
  const renderer = new T.WebGLRenderer({ canvas, alpha:true, antialias:true, powerPreference:'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-4.4, 4.4, 5.1, -5.1, .1, 50);
  camera.position.set(0,0,18);
  camera.lookAt(0,0,0);
  scene.add(new T.AmbientLight(0xffffff, 2.5));
  const light = new T.DirectionalLight(0xfff5dc, 2);
  light.position.set(-5,7,10);
  scene.add(light);
  const sheets = new T.Group();
  sheets.rotation.set(-.045,.055,-.018);
  scene.add(sheets);
  const ink = '#24291f', green = '#174b38', cream = '#fff7e4', rust = '#a33e27';
  function face(width, height, text, color=cream, textColor=ink, size=52) {
    const c = document.createElement('canvas');
    c.width = Math.round(width * 160); c.height = Math.round(height * 160);
    const ctx = c.getContext('2d');
    ctx.fillStyle=color; ctx.fillRect(0,0,c.width,c.height);
    let seed=17;
    for(let i=0;i<800;i++) {
      seed=(seed*16807)%2147483647;const x=seed%c.width;
      seed=(seed*16807)%2147483647;const y=seed%c.height;
      ctx.fillStyle='rgba(90,65,30,.07)';ctx.fillRect(x,y,2,1);
    }
    ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.strokeRect(2,2,c.width-4,c.height-4);
    ctx.fillStyle=textColor;ctx.font=`700 ${size}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    text.split('\n').forEach((line,index,lines)=>ctx.fillText(line,c.width/2,c.height/2+(index-(lines.length-1)/2)*size*1.3,c.width-20));
    const texture = new T.CanvasTexture(c); texture.colorSpace=T.SRGBColorSpace;
    return new T.MeshBasicMaterial({map:texture});
  }
  function tile(w,h,text,color=cream,textColor=ink,size=52) {
    const group=new T.Group();
    const box=new T.Mesh(new T.BoxGeometry(w,h,.055),new T.MeshStandardMaterial({color:0xb4a07c,roughness:1}));
    group.add(box);
    const plane=new T.Mesh(new T.PlaneGeometry(w,h),face(w,h,text,color,textColor,size));
    plane.position.z=.032;group.add(plane);
    sheets.add(group);
    return group;
  }
  // The paper matrix represents pairs; it is not the layout of the database.
  const underlay=tile(7.5,6.2,'','#d8c7a6');underlay.position.set(.09,1.48,-.18);underlay.rotation.z=.025;
  const board=tile(7.5,6.2,'','#f0e5cb');board.position.set(0,1.55,-.1);
  const label=tile(6.6,.58,'INPUT TABLE · ALL PAIRS 1–6',cream,ink,38);label.position.set(0,4.13,.04);
  const cells=[];
  for(let y=1;y<=6;y++)for(let x=1;x<=6;x++) {
    const selected=x===2&&[2,4,5].includes(y);
    const normal=face(.92,.7,`${x},${y}`,cream,ink,45);
    const chosen=face(.92,.7,`${x},${y}`,green,cream,45);
    const cell=tile(.92,.7,`${x},${y}`);
    cell.children[1].material=normal;
    cell.position.set((x-3.5)*1.08,3.28-(y-1)*.79,.05);
    cells.push({cell,selected,normal,chosen});
  }
  const instruction=tile(7.3,.75,'x = 2     AND     y IN (2, 4, 5)',cream,ink,38);
  instruction.position.set(0,-2.12,.08);
  const resultLabel=tile(7.3,.58,'TABLE r · READ LEFT TO RIGHT',green,cream,35);
  resultLabel.position.set(0,-2.95,.1);
  const results=[5,4,2].map((y,i)=>{
    const row=tile(2.2,.86,`2, ${y}`,cream,ink,54);
    row.position.set((i-1)*2.55,-3.78,.16);
    return row;
  });
  const footer=tile(7.3,.48,'REFERENCE SQLITE READS r',cream,rust,30);
  footer.position.set(0,-4.54,.17);
  let lost=false;
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();lost=true;stage.hidden=true;
    stage.closest('[data-multilang-exam]').querySelector('[data-exam-static]').open=true;
  });
  canvas.addEventListener('webglcontextrestored',()=>{
    lost=false;stage.hidden=false;redraw();
  });
  const resize=()=>{
    const {width,height}=stage.getBoundingClientRect();
    if(!width||!height)return;
    renderer.setSize(width,height,false);
    const halfHeight=5.15,halfWidth=Math.max(4.25,halfHeight*width/height);
    camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfHeight;camera.bottom=-halfHeight;
    camera.updateProjectionMatrix();redraw();
  };
  new ResizeObserver(resize).observe(stage);
  stage.dataset.renderer='webgl';
  stage.dataset.threeVersion=T.REVISION;
  return step=>{
    if(lost)return;
    cells.forEach(({cell,selected,normal,chosen})=>{
      cell.children[1].material=step>0&&selected?chosen:normal;
      cell.position.z=step>0&&selected?.2:.05;
    });
    instruction.visible=step>0;
    resultLabel.visible=step>=2;
    results.forEach(row=>{row.visible=step>=2;});
    footer.visible=step>=3;
    renderer.render(scene,camera);
  };
}
