# How to Set Up Playwright in This Codespace Environment

This guide is written for a coding agent operating in a GitHub Codespace running **Ubuntu 24.04** with **Node.js v24** (via nvm). It documents exactly what works, and what to avoid, based on hard-won experience.

---

## Overview of What Works

- Playwright is installed **outside the project** in a temp directory (avoids polluting `package.json`)
- Chromium is downloaded via `npx playwright install chromium`
- System dependencies are installed manually via `apt-get` (the automated `install-deps` command fails here due to a broken Yarn GPG key in apt sources)
- Test scripts are written as **plain JavaScript `.mjs` files** (not TypeScript — no tsconfig or transpiler is available in the temp context)
- The app server is started in **async mode** (`mode: 'async'`) so it stays alive while tests run in a separate sync terminal

---

## Step-by-Step Setup

### 1. Install Playwright in a Temp Directory

Do NOT install Playwright into the project (it adds ~80 MB to `node_modules` and modifies `package.json`). Install it in `/tmp/pw-test` instead:

```bash
npm install -D playwright@1.59.1 --prefix /tmp/pw-test
```

> **Why a pinned version?** The codespace's cached Chromium download matches a specific Playwright version. Mismatching causes browser launch failures.

---

### 2. Install the Chromium Browser Binary

```bash
npx playwright install chromium
```

This downloads to `~/.cache/ms-playwright/`. You only need to do this once per codespace lifetime (the cache persists across terminal sessions).

---

### 3. Install System Dependencies Manually

> **Do NOT run** `npx playwright install-deps chromium` — it will fail with:
> ```
> E: The repository 'https://dl.yarnpkg.com/debian stable InRelease' is not signed.
> Failed to install browser dependencies
> ```
> This is caused by a broken Yarn GPG key in the system apt sources. The automated installer exits with code 100.

Instead, install the required libraries directly with `apt-get`:

```bash
sudo apt-get install -y \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2t64 \
  libpango-1.0-0 \
  libpangocairo-1.0-0
```

> **Critical:** Use `libasound2t64`, NOT `libasound2`. On Ubuntu 24.04, `libasound2` is a virtual package with no installation candidate and the command will fail.

After installing, verify Chromium launches successfully:

```bash
/home/codespace/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell --version
```

Expected output: `Google Chrome for Testing 147.x.x.x`

> **Note:** `ldconfig -p | grep atk` may show "not found" even after a successful install. This is a cache artifact — ignore it. The `ldd` and direct binary execution are the reliable checks.

---

### 4. Write Test Scripts as Plain JavaScript `.mjs` Files

Test scripts must be `.mjs` (ES module) files using **plain JavaScript only** — no TypeScript syntax. The Node.js runtime executing them has no TypeScript compiler.

**Correct import path** (uses the temp-installed package):

```js
import { chromium } from '/tmp/pw-test/node_modules/playwright/index.mjs';
```

**What NOT to do:**

```js
// WRONG — 'playwright' is not in $NODE_PATH or the project's node_modules
import { chromium } from 'playwright';

// WRONG — TypeScript syntax in a .mjs file causes SyntaxError
const errors: string[] = [];
```

**Minimal working test skeleton:**

```js
import { chromium } from '/tmp/pw-test/node_modules/playwright/index.mjs';

const BASE = 'http://localhost:4173';
let passed = 0, failed = 0;

function assert(cond, label) {
  if (cond) { console.log('  OK', label); passed++; }
  else { console.error('  FAIL', label); failed++; }
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.goto(BASE + '/');
await page.waitForLoadState('networkidle');
assert(await page.title() !== '', 'Page has a title');

await browser.close();
console.log('Results:', passed, 'passed,', failed, 'failed');
if (failed > 0) process.exit(1);
```

Run it with:

```bash
node /tmp/test-mytest.mjs
```

---

### 5. Start the App Server Correctly

> **Do NOT** start the server with `mode: 'sync'` or as a background `&` job and then immediately run tests in the same terminal call. The server process gets killed when the sync command completes.

**Correct approach:** Start the server in `mode: 'async'` (which keeps it alive in the background), then run tests in a separate sync terminal call.

```bash
# Terminal call 1 — async mode keeps the process alive
cd /workspaces/codespaces-blank/clozeflow && npm run preview -- --port 4173 --host
```
(use `mode: 'async'` in the tool call)

Wait for the output to show the local URL, then in a **separate** terminal call:

```bash
# Terminal call 2 — sync, runs and exits
node /tmp/test-mytest.mjs
```

If the port is already in use, Vite will auto-increment (4174, 4175, …). Check the terminal output for the actual port and update your test script's `BASE` constant accordingly.

---

## Quick Reference Checklist

| Step | Command | One-time? |
|---|---|---|
| Install Playwright package | `npm install -D playwright@1.59.1 --prefix /tmp/pw-test` | Once per codespace |
| Install Chromium binary | `npx playwright install chromium` | Once per codespace |
| Install system libraries | `sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2t64 libpango-1.0-0 libpangocairo-1.0-0` | Once per codespace |
| Verify browser works | `/home/codespace/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell --version` | After install |
| Start app server | `npm run preview -- --port 4173 --host` in **async** mode | Before each test run |
| Run tests | `node /tmp/test-*.mjs` in a new **sync** terminal | Each test run |

---

## Common Failure Modes

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find package 'playwright'` | Playwright not in Node resolve path | Use full path: `/tmp/pw-test/node_modules/playwright/index.mjs` |
| `libatk-1.0.so.0: cannot open shared object file` | System deps missing | Run the `apt-get install` command in Step 3 |
| `Package 'libasound2' has no installation candidate` | Wrong package name for Ubuntu 24.04 | Use `libasound2t64` instead |
| `Failed to install browser dependencies` (exit code 100) | Broken Yarn GPG in apt sources | Skip `install-deps`, use manual `apt-get` |
| `page.goto: Timeout 30000ms exceeded` | App server not running or wrong port | Start server in async mode first; check actual port in output |
| `SyntaxError: Missing initializer in const declaration` | TypeScript syntax in `.mjs` file | Remove type annotations (`: string[]`, etc.) — use plain JS |
| Server stops before tests run | Server started as sync background `&` job | Use `mode: 'async'` for the server terminal call |
