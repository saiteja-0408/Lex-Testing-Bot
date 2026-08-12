# AWS Lex Web UI Customization README

This document explains the customization work done on top of the original `aws-samples/aws-lex-web-ui` repository, with a focus on:

- Right-side floating panel UX
- PII onboarding flow (first name, last name, email, terms)
- Toolbar/status/quick-reply customization
- Build and local runtime adjustments

It also serves as a migration guide to replicate the same experience in a fresh fork.

**Extended narrative (flows, FAQ, troubleshooting, and README-aligned §10–20):** see [RIGHT_PANEL_CUSTOMIZATION_GUIDE.md](RIGHT_PANEL_CUSTOMIZATION_GUIDE.md) — especially sections **10–20**, which mirror this README and add upstream playbook links and 3-state toolbar notes.

---

1) Page + runtime config
src/website/right-panel.html
src/config/lex-web-ui-loader-config.json
src/website/custom-chatbot-style.css (for same colors/look)

2) Onboarding + chat UI behavior (PII flow)
lex-web-ui/src/components/LexWeb.vue
lex-web-ui/src/components/OnboardingForm.vue
lex-web-ui/src/components/DefaultQuickReplies.vue
lex-web-ui/src/components/ToolbarContainer.vue
lex-web-ui/src/config/index.js (UI default keys used by components)

3) Loader/iframe behavior fixes
src/dependencies/initiate-loader.js
src/lex-web-ui-loader/js/defaults/loader.js
src/lex-web-ui-loader/js/lib/iframe-component-loader.js

4) Build + serve pipeline
build/copy-assets.js
lex-web-ui/scripts/post-build-css.js
server.js
package.json (root)
lex-web-ui/package.json (only if your new fork is missing same deps)

5) Optional but useful if you use parent page too
src/website/parent.html

---

## 1) What was changed at a high level

Compared to the original repository, this project now behaves like a productized assistant panel:

- The bot opens as a polished right-side floating panel
- A pre-chat onboarding form can be shown before normal chat
- Terms and services can be opened inside the onboarding experience
- Quick replies appear as chips above the input area
- Toolbar includes branded status details (for example, `Online` + indicator)
- Build and server flow are tuned to reliably serve these custom assets locally

---

## 2) File-by-file change map

### A. Page entry / host pages

#### `src/website/right-panel.html`
- Added full page shell and right floating iframe styles
- Uses fetch-based config loading (`lex-web-ui-loader-config.json`)
- Forces same-origin parent/iframe setup
- Starts panel expanded by default

**Impact:** This file defines the final right-panel look and startup behavior.

#### `src/website/parent.html`
- Can be kept as debug page or adapted to right-panel style
- Uses iframe loader integration

**Impact:** If kept in debug mode, it shows diagnostics panels; if aligned with right-panel shell, it matches the clean production-like UI.

#### `src/website/custom-chatbot-style.css`
- Added active custom styling for toolbar, messages, quick replies, and input area

**Impact:** Controls branding and visual theme inside chatbot UI.

---

### B. Runtime config

#### `src/config/lex-web-ui-loader-config.json`
- Contains Cognito, Lex bot, UI, and iframe settings
- Adds onboarding labels, quick replies, toolbar status options, etc.

**Impact:** Main runtime switchboard for behavior and text. Missing/incorrect values cause startup issues or degraded UX.

---

### C. Lex UI components (inside iframe app)

#### `lex-web-ui/src/components/OnboardingForm.vue` (custom/new)
- PII form fields
- Terms link + in-panel terms content
- Validation and completion events

**Impact:** Pre-chat onboarding UX users see first when enabled.

#### `lex-web-ui/src/components/LexWeb.vue`
- Integrates onboarding and quick replies into core app flow
- Controls transition from onboarding to chat
- Sets onboarding-derived session attributes
- Adjusts layout when quick-reply strip is visible

**Impact:** Core behavior orchestration for onboarding-to-chat experience.

#### `lex-web-ui/src/components/DefaultQuickReplies.vue` (custom/new)
- Renders default quick-reply chips
- Sends selected values as user messages

**Impact:** Guided interaction shortcuts for common intents.

#### `lex-web-ui/src/components/ToolbarContainer.vue`
- Branded header layout
- Status line support (for example, `Online`)
- Default avatar behavior and configurable minimize icon

**Impact:** Final toolbar branding and controls.

#### `lex-web-ui/src/config/index.js`
- Adds defaults for onboarding, quick replies, toolbar status/avatar/icon values

**Impact:** Prevents undefined behavior when optional config values are not provided.

---

### D. Loader and embed behavior

#### `src/dependencies/initiate-loader.js`
#### `src/lex-web-ui-loader/js/defaults/loader.js`
- Adjusted embedded config behavior so iframe mode still receives full config

**Impact:** Avoids config loss when running embedded.

#### `src/lex-web-ui-loader/js/lib/iframe-component-loader.js`
- Hardened minimize state persistence logic (safer key handling)

**Impact:** Reduces edge-case failures in localStorage/minimize state restore.

---

### E. Build + serve pipeline

#### `build/copy-assets.js`
- Ensures right-panel and website assets are copied to `dist`

**Impact:** Without this, output may not reflect source custom pages.

#### `lex-web-ui/scripts/post-build-css.js`
- Improved CSS file handling across build output variations

**Impact:** More reliable CSS availability after builds.

#### `server.js`
- Serves local assets for right-panel usage

**Impact:** Enables local run path at `http://localhost:8000`.

#### `package.json` (root and `lex-web-ui/package.json`)
- Script/dependency adjustments to support current local workflow

**Impact:** Enables consistent local start/build behavior.

---

## 3) Required files to copy into a fresh fork

If replicating this customization in a newly forked repo, copy these source files:

- `src/website/right-panel.html`
- `src/website/custom-chatbot-style.css`
- `src/config/lex-web-ui-loader-config.json`
- `lex-web-ui/src/components/OnboardingForm.vue`
- `lex-web-ui/src/components/DefaultQuickReplies.vue`
- `lex-web-ui/src/components/LexWeb.vue`
- `lex-web-ui/src/components/ToolbarContainer.vue`
- `lex-web-ui/src/config/index.js`
- `src/dependencies/initiate-loader.js`
- `src/lex-web-ui-loader/js/defaults/loader.js`
- `src/lex-web-ui-loader/js/lib/iframe-component-loader.js`
- `build/copy-assets.js`
- `lex-web-ui/scripts/post-build-css.js`
- `server.js`
- `package.json`
- `lex-web-ui/package.json`

Note: Copy from `src`/component sources, not from `dist`, whenever possible.

---

## 4) Local run steps

From repo root:

```bash
cd lex-web-ui
npm install
npm run build-dist
cd ..
npm install
node build/copy-assets.js
npm start
```

Open:

- `http://localhost:8000/right-panel.html`

Optional:

- `http://localhost:8000/parent.html` (if maintained)

---

## 5) Common issues and fixes

### Issue: White/blank page
- Usually means missing or stale built assets.
- Re-run build and copy steps, then restart server.

### Issue: `missing cognito poolId config`
- `src/config/lex-web-ui-loader-config.json` has missing or wrong Cognito config.

### Issue: Bot loads but says "unable to process your message"
- UI is loaded, but Lex backend config/permissions are invalid.
- Verify bot ID, alias ID, locale, region, and IAM permissions.

### Issue: Quick-reply chips overlap input area
- Layout reservation and quick-reply strip height mismatch.
- Align values in:
  - `lex-web-ui/src/components/LexWeb.vue`
  - `lex-web-ui/src/components/DefaultQuickReplies.vue`

---

## 6) Notes on behavior

- Onboarding appears when `ui.showOnboardingForm` is `true`.
- Terms content behavior comes from `OnboardingForm.vue`.
- Closing onboarding emits `close` and maps to minimize/close behavior in `LexWeb.vue`.
- Quick replies are purely UI shortcuts; each sends configured `value` text to Lex.

---

## 7) Summary

This customization transforms the upstream sample into a branded right-panel assistant flow with onboarding and guided actions. The changes are spread across host page, runtime config, iframe components, loader behavior, and build pipeline; all parts are needed for full parity in a new fork.

---

## 8) Exact replacements (copy/paste guide)

This section is the "do this exactly" version. It tells you what to search for and what to replace.

### A) `src/website/right-panel.html` (or `src/website/parent.html` if using parent as right-panel)

#### Replace loader options with fetch-based config flow

Find loader options and make sure they include:

```js
var loaderOpts = {
  baseUrl: origin + '/',
  shouldLoadConfigFromEvent: false,
  shouldLoadConfigFromJsonFile: false,
  shouldLoadMinDeps: true,
};
```

Then make sure load logic is:

```js
fetch(origin + '/lex-web-ui-loader-config.json')
  .then(function (r) { return r.json(); })
  .then(function (cfg) {
    cfg.ui = cfg.ui || {};
    cfg.iframe = cfg.iframe || {};
    cfg.ui.parentOrigin = origin;
    cfg.iframe.iframeOrigin = origin;
    cfg.iframe.iframeSrcPath = '/index.html#/?lexWebUiEmbed=true';
    cfg.iframe.shouldLoadIframeMinimized = false;
    return iframeLoader.load(cfg);
  });
```

**Why this helps:** removes brittle event config handoff and ensures iframe starts with full config.

---

### B) `src/config/lex-web-ui-loader-config.json`

#### Ensure these required keys exist (replace placeholders)

```json
{
  "region": "us-east-1",
  "cognito": {
    "poolId": "us-east-1:REPLACE_ME",
    "appUserPoolClientId": "REPLACE_ME"
  },
  "lex": {
    "v2BotId": "REPLACE_ME",
    "v2BotAliasId": "REPLACE_ME",
    "v2BotLocaleId": "en_US",
    "region": "us-east-1"
  },
  "ui": {
    "showOnboardingForm": true,
    "showToolbarStatus": true,
    "toolbarStatusText": "Online",
    "toolbarMinimizeButtonIcon": "close"
  },
  "iframe": {
    "iframeOrigin": "http://localhost:8000",
    "iframeSrcPath": "/index.html#/?lexWebUiEmbed=true"
  }
}
```

**Why this helps:** these values drive startup, onboarding visibility, toolbar status, and bot connectivity.

---

### C) `lex-web-ui/src/components/LexWeb.vue`

#### Ensure onboarding is mounted and controls chat visibility

Look for:

```vue
<onboarding-form
  v-if="showOnboarding"
  @complete="onOnboardingComplete"
  @close="toggleMinimizeUi"
/>
```

And ensure chat sections use `!showOnboarding` guards:

```vue
v-if="!isUiMinimized && !showOnboarding"
```

**Why this helps:** prevents chat UI from appearing before onboarding is completed.

#### Quick-reply overlap fix (important)

In style section, change:

```css
height: calc(... - 100px)
```

to:

```css
height: calc(... - 140px)
```

for all three:

- `.toolbar-height-sm`
- `.toolbar-height-md`
- `.toolbar-height-lg`

**Why this helps:** reserves enough space for wrapped quick-reply chips so they do not overlap input.

---

### D) `lex-web-ui/src/components/DefaultQuickReplies.vue`

Ensure quick-reply strip remains capped and scrollable:

```css
.lex-default-quick-replies {
  bottom: 56px;
  max-height: 140px;
  overflow-y: auto;
}
```

**Why this helps:** keeps chips inside a bounded area and aligns with reserved space in `LexWeb.vue`.

---

### E) `lex-web-ui/src/components/ToolbarContainer.vue`

Ensure status/branding pieces exist:

```vue
<div v-if="showToolbarStatus" class="toolbar-maggi-status">
  <span class="toolbar-maggi-status-dot" aria-hidden="true"></span>
  <span class="toolbar-maggi-status-text">{{ toolbarStatusText }}</span>
</div>
```

And computed values:

```js
showToolbarStatus() { return !!this.$store.state.config.ui.showToolbarStatus; }
toolbarStatusText() { return this.$store.state.config.ui.toolbarStatusText || 'Online'; }
toolbarMinimizeButtonIcon() { return this.$store.state.config.ui.toolbarMinimizeButtonIcon || 'arrow_drop_down'; }
```

**Why this helps:** makes online indicator and close icon configurable from JSON.

---

### F) `src/dependencies/initiate-loader.js` and `src/lex-web-ui-loader/js/defaults/loader.js`

Set:

```js
shouldIgnoreConfigWhenEmbedded: false
```

**Why this helps:** prevents embedded mode from dropping local config fields (Cognito/Lex/UI).

---

### G) `src/lex-web-ui-loader/js/lib/iframe-component-loader.js`

Harden minimize state key usage (null-safe):

- guard `this.config.cognito && this.config.cognito.appUserPoolClientId`
- write/read localStorage only when key exists

**Why this helps:** avoids crashes when client ID is absent in edge environments.

---

### H) `build/copy-assets.js`

Ensure website copy list includes:

```js
const websiteFiles = ['custom-chatbot-style.css', 'right-panel.html'];
```

**Why this helps:** guarantees right-panel page is present in `dist` after build.

---

### I) `server.js`

Use ESM-compatible server and ensure static serving includes:

- `dist/`
- `src/config/`
- optional extra folders used by your setup

**Why this helps:** prevents startup/runtime path mismatch on modern Node + module mode.

---

## 9) Build, copy, run (must run after replacements)

```bash
cd lex-web-ui
npm run build-dist
cd ..
node build/copy-assets.js
npm start
```

Hard refresh browser after startup (`Cmd+Shift+R` on macOS).

**Why this helps:** source changes do not appear until rebuilt/copied into `dist`.

