import "clsx";
import { g as goto } from "../../chunks/client.js";
import { b as base } from "../../chunks/server.js";
import "../../chunks/url.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    goto(`${base}/activity`, {});
  });
}
export {
  _page as default
};
