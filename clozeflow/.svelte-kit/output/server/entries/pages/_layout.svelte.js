import { g as getContext, s as slot, e as ensure_array_like, a as store_get, b as attr, c as attr_class, d as escape_html, u as unsubscribe_stores, f as stringify } from "../../chunks/renderer.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const navItems = [
      { href: "/activity", label: "Activity", icon: "📝" },
      { href: "/manage", label: "Manage", icon: "⚙️" }
    ];
    $$renderer2.push(`<div class="flex min-h-screen flex-col bg-gray-50"><main class="flex-1 pb-20"><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></main> <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg"><div class="mx-auto flex max-w-lg"><!--[-->`);
    const each_array = ensure_array_like(navItems);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      const active = store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith(item.href);
      $$renderer2.push(`<a${attr("href", item.href)}${attr_class(`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-sm font-medium transition-colors tap-target ${stringify(active ? "text-blue-600" : "text-gray-500 hover:text-gray-700")}`)}><span class="text-xl leading-none">${escape_html(item.icon)}</span> <span class="text-xs">${escape_html(item.label)}</span> `);
      if (active) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="absolute bottom-0 h-0.5 w-12 rounded-t-full bg-blue-600"></span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></a>`);
    }
    $$renderer2.push(`<!--]--></div></nav></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
