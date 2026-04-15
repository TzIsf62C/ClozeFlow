import { ab as head, e as ensure_array_like, c as attr_class, f as stringify, d as escape_html, b as attr } from "../../../chunks/renderer.js";
import "papaparse";
import { D as DEFAULT_GRAM_CATS } from "../../../chunks/db.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeTab = "manual";
    let words = [];
    let manualWord = "";
    let manualCat = DEFAULT_GRAM_CATS[0];
    let manualSentences = [""];
    let isSaving = false;
    let allCats = [...DEFAULT_GRAM_CATS];
    head("1s1mgsk", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>ClozeFlow — Manage</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-lg px-4 pt-6"><h1 class="mb-6 text-2xl font-bold text-gray-900">Manage Words</h1> <div class="mb-6 flex rounded-xl bg-gray-100 p-1"><!--[-->`);
    const each_array = ensure_array_like([
      { id: "manual", label: "Manual Entry" },
      { id: "csv", label: "CSV Upload" }
    ]);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button${attr_class(` tap-target flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${stringify(activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700")} `)}>${escape_html(tab.label)}</button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"><form class="space-y-4"><div><label for="word-input" class="mb-1 block text-sm font-medium text-gray-700">Vocabulary Word</label> <input id="word-input" type="text"${attr("value", manualWord)} placeholder="e.g. run" class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"/></div> <div><label${attr("for", "cat-select")} class="mb-1 block text-sm font-medium text-gray-700">Category</label> `);
      {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.select(
          {
            id: "cat-select",
            value: manualCat,
            class: "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          },
          ($$renderer3) => {
            $$renderer3.push(`<!--[-->`);
            const each_array_1 = ensure_array_like(allCats);
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let cat = each_array_1[$$index_1];
              $$renderer3.option({ value: cat }, ($$renderer4) => {
                $$renderer4.push(`${escape_html(cat)}`);
              });
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(` <button type="button" class="mt-1.5 text-sm text-blue-600 hover:underline">+ Add custom category</button>`);
      }
      $$renderer2.push(`<!--]--></div> <fieldset><legend class="mb-1 block text-sm font-medium text-gray-700">Example Sentences</legend> <div class="space-y-2"><!--[-->`);
      const each_array_2 = ensure_array_like(manualSentences);
      for (let idx = 0, $$length = each_array_2.length; idx < $$length; idx++) {
        each_array_2[idx];
        $$renderer2.push(`<div class="flex gap-2"><textarea placeholder="Type a sentence using the word…" rows="2" class="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">`);
        const $$body = escape_html(manualSentences[idx]);
        if ($$body) {
          $$renderer2.push(`${$$body}`);
        }
        $$renderer2.push(`</textarea> `);
        if (manualSentences.length > 1) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button type="button" class="tap-target self-start rounded-xl border border-gray-200 px-3 py-2 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500">✕</button>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div> <button type="button" class="mt-2 text-sm text-blue-600 hover:underline">+ Add another sentence</button></fieldset> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <button type="submit"${attr("disabled", isSaving, true)} class="tap-target w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50">${escape_html("Save Word")}</button></form></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="mb-10 mt-8"><h2 class="mb-4 text-base font-semibold text-gray-700">Saved Words `);
    if (words.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="ml-1 text-gray-400">(${escape_html(words.length)})</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></h2> `);
    if (words.length === 0) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">No words yet. Add some above!</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array_3 = ensure_array_like(words);
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let word = each_array_3[$$index_3];
        $$renderer2.push(`<div class="flex items-start justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100"><div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="font-semibold text-gray-900">${escape_html(word.word)}</span> <span class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">${escape_html(word.gramCat)}</span></div> <p class="mt-0.5 truncate text-xs text-gray-400">${escape_html(word.sentences.length)} sentence${escape_html(word.sentences.length !== 1 ? "s" : "")}</p></div> <button class="tap-target flex-shrink-0 rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors" aria-label="Delete word">🗑</button></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
