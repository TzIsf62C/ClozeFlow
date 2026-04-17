import { h as head, s as store_get, e as ensure_array_like, d as escape_html, c as attr, a as attr_class, f as stringify, u as unsubscribe_stores } from "../../../chunks/renderer.js";
import { b as base } from "../../../chunks/server.js";
import "../../../chunks/index.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import { D as DEFAULT_GRAM_CATS } from "../../../chunks/db.js";
import { s as sessionStore, a as allBlanksFilled } from "../../../chunks/session.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let availableCategories = ["All", ...DEFAULT_GRAM_CATS];
    let selectedCat = "All";
    let isLoading = false;
    function getBlankAnswer(sentence) {
      const blank = sentence.parts.find((p) => p.type === "blank");
      return blank && blank.type === "blank" ? blank.answer : "";
    }
    head("13r34ge", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>ClozeFlow — Activity</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-lg px-4 pt-6"><div class="mb-6 text-center"><h1 class="text-2xl font-bold text-gray-900">ClozeFlow</h1> <p class="mt-1 text-sm text-gray-500">Fill in the blanks with the correct word</p></div> `);
    if (store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "idle") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"><h2 class="mb-4 text-lg font-semibold text-gray-800">Start a Session</h2> <div class="mb-4"><label for="cat-select" class="mb-1.5 block text-sm font-medium text-gray-700">Category</label> `);
      $$renderer2.select(
        {
          id: "cat-select",
          value: selectedCat,
          class: "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(availableCategories);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let cat = each_array[$$index];
            $$renderer3.option({ value: cat }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(cat)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div> `);
      if (store_get($$store_subs ??= {}, "$sessionStore", sessionStore).errorMsg) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${escape_html(store_get($$store_subs ??= {}, "$sessionStore", sessionStore).errorMsg)} <a${attr("href", `${stringify(base)}/manage`)} class="ml-1 font-semibold underline">Add words →</a></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <button${attr("disabled", isLoading, true)} class="tap-target flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50">${escape_html("Start Session")}</button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "active" || store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "graded") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr_class(`mb-4 space-y-3 ${stringify(store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "active" ? "pb-52" : "pb-4")}`)}><!--[-->`);
      const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$sessionStore", sessionStore).sentences);
      for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
        let sentence = each_array_1[idx];
        const answer = getBlankAnswer(sentence);
        $$renderer2.push(`<div class="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-100"><p class="text-base leading-relaxed text-gray-900"><!--[-->`);
        const each_array_2 = ensure_array_like(sentence.parts);
        for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
          let part = each_array_2[$$index_1];
          if (part.type === "text") {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span>${escape_html(part.content)}</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`<button${attr_class(` tap-target relative mx-1 inline-flex min-w-[80px] items-center justify-center rounded-lg border-2 px-3 py-1 align-middle text-sm font-semibold transition-all ${stringify(sentence.gradeResult === "correct" ? "border-green-400 bg-green-50 text-green-800" : sentence.gradeResult === "incorrect" ? "border-red-400 bg-red-50 text-red-800" : sentence.userSelection ? "border-blue-400 bg-blue-50 text-blue-800 hover:bg-blue-100" : "border-dashed border-gray-300 bg-gray-50 text-gray-400")} `)}>`);
            if (sentence.gradeResult === "incorrect" && sentence.showAnswer) {
              $$renderer2.push("<!--[0-->");
              $$renderer2.push(`<span class="text-green-700">${escape_html(answer)}</span>`);
            } else if (sentence.userSelection) {
              $$renderer2.push("<!--[1-->");
              $$renderer2.push(`${escape_html(sentence.userSelection.text)}`);
            } else {
              $$renderer2.push("<!--[-1-->");
              $$renderer2.push(`<span class="opacity-40">_____</span>`);
            }
            $$renderer2.push(`<!--]--></button>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></p> `);
        if (sentence.gradeResult === "incorrect" && !sentence.showAnswer) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<p class="mt-2 text-xs text-red-500">Tap blank to see correct answer</p>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div> `);
      if (store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "active") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 pb-4 pt-3 shadow-lg"><div class="mx-auto max-w-lg"><div class="mb-3 flex gap-3"><button class="tap-target flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50">← Back</button> <button${attr("disabled", !store_get($$store_subs ??= {}, "$allBlanksFilled", allBlanksFilled) || isLoading, true)} class="tap-target flex-1 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">${escape_html("Check Answers")}</button></div> <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Word Bank</p> <div class="flex flex-wrap gap-2"><!--[-->`);
        const each_array_3 = ensure_array_like(store_get($$store_subs ??= {}, "$sessionStore", sessionStore).wordBank);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let chip = each_array_3[$$index_3];
          $$renderer2.push(`<button${attr("disabled", chip.isUsed, true)}${attr_class(` tap-target rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all ${stringify(chip.isUsed ? "border-gray-200 bg-gray-100 text-gray-300 opacity-50" : "border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-400 hover:bg-blue-100 active:scale-95")} `)}>${escape_html(chip.text)}</button>`);
        }
        $$renderer2.push(`<!--]--></div></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="mb-8 flex gap-3">`);
      if (store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "graded") {
        $$renderer2.push("<!--[0-->");
        const correct = store_get($$store_subs ??= {}, "$sessionStore", sessionStore).sentences.filter((s) => s.gradeResult === "correct").length;
        const total = store_get($$store_subs ??= {}, "$sessionStore", sessionStore).sentences.length;
        $$renderer2.push(`<button class="tap-target flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50">← Back</button>  <div class="flex flex-1 items-center justify-center rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">Score: <span class="ml-1 text-lg font-bold text-blue-600">${escape_html(correct)}/${escape_html(total)}</span></div> <button${attr("disabled", isLoading, true)} class="tap-target flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-40">${escape_html("Next →")}</button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
