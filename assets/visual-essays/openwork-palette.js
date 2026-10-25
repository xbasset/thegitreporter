// Static editorial specimens, not an OpenWork runtime or measured outputs.
// Every claim is present in the article HTML; JavaScript adds scoped styling only.
if (document.querySelector('[data-openwork-palette]')) {
  const style = document.createElement('style');
  style.textContent = `
  [data-openwork-palette]{--op-ink:#292920;--op-paper:#fff8e8;--op-green:#285440;--op-rust:#a4432e;color:var(--op-ink);margin:2.2rem 0;padding:1.2rem;border:2px solid var(--op-ink);background:var(--op-paper);box-shadow:5px 5px 0 #d6cfba}
  [data-openwork-palette] *{box-sizing:border-box}
  [data-openwork-palette] h2{font:700 clamp(25px,5vw,35px)/1.15 Georgia,serif;margin:0 0 .8rem}
  [data-openwork-palette] h3{font:700 24px/1.2 Georgia,serif;margin:0 0 .4rem}
  [data-openwork-palette] p{font:16px/1.5 system-ui,sans-serif;margin:.55rem 0;overflow-wrap:anywhere}
  [data-openwork-palette] code{font:700 16px/1.4 ui-monospace,monospace;white-space:normal;overflow-wrap:anywhere;color:var(--op-green);background:transparent;padding:0}
  [data-openwork-palette] .op-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1.1rem 0}
  [data-openwork-palette] .op-card{min-width:0;border-top:2px solid var(--op-ink);padding:1rem 0 .5rem}
  [data-openwork-palette] .op-specimen{height:110px;position:relative;margin:.8rem 0;overflow:hidden;background:repeating-linear-gradient(0deg,transparent,transparent 21px,#e7dfcc 22px)}
  [data-openwork-palette] .op-check{display:block;width:58px;height:58px;border:3px solid var(--op-green);border-radius:50%;position:absolute;left:calc(50% - 29px);top:23px;color:var(--op-green);font:700 45px/52px system-ui;text-align:center}
  [data-openwork-palette] .op-plot{position:absolute;inset:16px 24px;border-left:2px solid var(--op-ink);border-bottom:2px solid var(--op-ink)}
  [data-openwork-palette] .op-plot i{position:absolute;bottom:0;width:12%;background:var(--op-green);border:1px solid var(--op-ink)}
  [data-openwork-palette] .op-plot i:nth-child(1){left:12%;height:32%}
  [data-openwork-palette] .op-plot i:nth-child(2){left:40%;height:67%}
  [data-openwork-palette] .op-plot i:nth-child(3){left:68%;height:48%}
  [data-openwork-palette] .op-echo{position:absolute;top:29px;width:52px;height:52px;border:3px solid var(--op-rust);transform:rotate(-8deg)}
  [data-openwork-palette] .op-echo:nth-child(1){left:calc(50% - 62px);opacity:.25}
  [data-openwork-palette] .op-echo:nth-child(2){left:calc(50% - 36px);opacity:.5}
  [data-openwork-palette] .op-echo:nth-child(3){left:calc(50% - 10px);background:#fff8e8}
  [data-openwork-palette] .op-cube{position:absolute;width:58px;height:58px;left:calc(50% - 38px);top:34px;border:2px solid var(--op-green)}
  [data-openwork-palette] .op-cube::before{content:'';position:absolute;width:58px;height:22px;left:-2px;top:-24px;transform:skewX(-40deg);transform-origin:bottom;border:2px solid var(--op-green)}
  [data-openwork-palette] .op-cube::after{content:'';position:absolute;width:20px;height:58px;right:-22px;top:-2px;transform:skewY(-50deg);transform-origin:left;border:2px solid var(--op-green)}
  [data-openwork-palette] .op-contract{border-top:3px solid var(--op-ink);padding-top:.8rem}
  [data-openwork-palette] .op-note{font-size:15px}
  @media(max-width:540px){[data-openwork-palette]{padding:1rem;box-shadow:3px 3px 0 #d6cfba}[data-openwork-palette] .op-grid{grid-template-columns:1fr;gap:.4rem}[data-openwork-palette] .op-specimen{height:100px}[data-openwork-palette] .op-card{padding-top:.9rem}}
  `;
  document.head.append(style);
}
