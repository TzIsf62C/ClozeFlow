

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": true
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.CKEyXdER.js","_app/immutable/chunks/CQY3VV7G.js","_app/immutable/chunks/BP_g8XuY.js","_app/immutable/chunks/BtBuVhZ2.js","_app/immutable/chunks/BTx6eFkx.js","_app/immutable/chunks/DZqFfQE0.js","_app/immutable/chunks/DuDm8rwf.js","_app/immutable/chunks/IYVZDs18.js"];
export const stylesheets = ["_app/immutable/assets/0.BYG9hV3R.css"];
export const fonts = [];
