// The complete worksheet and native disclosure live in the initial HTML.
// This module adds only scoped typography and composition; it makes no requests.
if (document.querySelector('[data-pi-reading]')) {
  const style = document.createElement('style');
  style.textContent = `
    [data-pi-reading]{margin:2rem 0;padding:clamp(1rem,3vw,2rem);background:#f5ecd9;border-block:3px solid #28382a;color:#242920}
    [data-pi-reading] *{box-sizing:border-box}
    [data-pi-reading] h2{font:750 clamp(1.6rem,4vw,2.3rem)/1.15 Georgia,serif;margin:0 0 1rem;border:0}
    [data-pi-reading] h3{font:750 1.25rem/1.3 Georgia,serif;margin:0 0 1rem}
    [data-pi-reading] p{font:1rem/1.55 system-ui,sans-serif;overflow-wrap:anywhere;max-width:72ch}
    [data-pi-reading] .pr-context{font-weight:700;color:#24533c}
    [data-pi-reading] .pr-fixture{border-left:3px solid #9b412d;padding-left:.8rem}
    [data-pi-reading] .pr-spread{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2rem;margin:2rem 0}
    [data-pi-reading] .pr-source,[data-pi-reading] .pr-receipt{min-width:0}
    [data-pi-reading] blockquote{margin:0;padding:.8rem 0;font:1.1rem/2.15 Georgia,serif;border:0;background:repeating-linear-gradient(transparent,transparent 36px,#c9c1ab 37px)}
    [data-pi-reading] mark{background:transparent;color:inherit;text-decoration:underline;text-decoration-color:#285b41;text-decoration-thickness:3px;text-underline-offset:5px;font-weight:700}
    [data-pi-reading] .pr-maybe{text-decoration:underline wavy #a2462c;text-underline-offset:4px}
    [data-pi-reading] dl{margin:0}
    [data-pi-reading] dl>div{border-bottom:1px solid #a49c87;padding:.6rem 0}
    [data-pi-reading] dt{font:700 1rem/1.5 system-ui,sans-serif;color:#28543d}
    [data-pi-reading] dt span{font-weight:400;margin-left:.5rem;color:#464e43}
    [data-pi-reading] dd{margin:.2rem 0;font:700 1.25rem/1.5 ui-monospace,monospace;overflow-wrap:anywhere}
    [data-pi-reading] .pr-uncertain dt,[data-pi-reading] .pr-uncertain dd{color:#8b3825}
    [data-pi-reading] .pr-annotation{font:1rem/1.55 system-ui,sans-serif;border-left:4px solid #9b412d;padding:.7rem .8rem;margin:1rem 0;background:#fff8ea}
    [data-pi-reading] summary{cursor:pointer;min-height:48px;padding:.8rem 0;font:700 1rem/1.5 system-ui,sans-serif;color:#24533c}
    [data-pi-reading] summary:focus-visible{outline:3px solid #9b412d;outline-offset:3px}
    [data-pi-reading] pre{white-space:pre-wrap;overflow-wrap:anywhere;font:1rem/1.6 ui-monospace,monospace;padding:.8rem;background:#fff8ea;border:1px solid #c9c1ab;max-width:100%}
    [data-pi-reading] pre code{font:inherit;white-space:inherit;overflow-wrap:inherit;color:inherit}
    [data-pi-reading] .pr-foot{border-top:1px dashed #8e897a;padding-top:1rem}
    @media(max-width:640px){[data-pi-reading] .pr-spread{grid-template-columns:1fr;gap:1.3rem;margin:1.4rem 0}[data-pi-reading] .pr-receipt{border-top:2px solid #28543d;padding-top:1.2rem}[data-pi-reading] blockquote{font-size:1rem;line-height:2.3}}
  `;
  document.head.append(style);
}
