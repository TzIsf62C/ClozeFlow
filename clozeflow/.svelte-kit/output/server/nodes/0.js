

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": true
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.B4QAjeix.js","_app/immutable/chunks/CR0Ep_tM.js","_app/immutable/chunks/e7mxAfHt.js","_app/immutable/chunks/BLNxhGaS.js","_app/immutable/chunks/BxqePSIs.js","_app/immutable/chunks/D76gbyXw.js","_app/immutable/chunks/B5JE0GZ3.js"];
export const stylesheets = ["_app/immutable/assets/0.BtFuk6ZH.css"];
export const fonts = [];
