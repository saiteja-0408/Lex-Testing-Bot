# Architecture — MDES-themed Lex Web UI

This fork of [aws-lex-web-ui](https://github.com/aws-samples/aws-lex-web-ui)
replicates the look & feel of the MDES "Sippi" chatbot
(https://reemployms.mdes.ms.gov/cp/landing, a Kore.ai bot) on top of an
Amazon Lex backend. The Kore reference implementation lives in the sibling
repo `../web-kore-standalone` (see `UI/chatWindowMS.css`, `UI/chatWindow.js`).

## Layer diagram

```
┌─ Host page ──────────────────────────────────────────────────────┐
│  web-lex-standalone/right-panel.html      (structure only)       │
│    ├─ demo-page.css        demo site shell — replace in prod     │
│    ├─ chat-frame.css       ★ panel geometry + minimized launcher │
│    ├─ lex-web-ui-loader.min.js/.css       (AWS loader, vendored) │
│    └─ right-panel-loader.js               bootstrap: fetch config,│
│                                           patch origins, load()  │
│         │ injects <div class="lex-web-ui-iframe"><iframe>        │
│         ▼                                                        │
│  ┌─ Chat iframe (/index.html#/?lexWebUiEmbed=true) ────────────┐ │
│  │  dist/index.html                                            │ │
│  │    ├─ custom-chatbot-style.css   ★ GENERATED theme (tokens) │ │
│  │    ├─ lex-web-ui.min.js/.css     built Vue app              │ │
│  │    └─ vue/vuetify/vuex deps                                 │ │
│  │  Vue components: lex-web-ui/src/components/*.vue            │ │
│  │    OnboardingForm.vue   MS welcome form + disclaimer page   │ │
│  │    MinButton.vue        gold MDES FAB launcher              │ │
│  │    ToolbarContainer.vue header (title/status/controls)      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
     ▲ served by server.js (Express, :8000)
```

## Directory map

| Path | Role | Edit? |
|---|---|---|
| `src/website/styles/*.css` | **Theme source partials** (tokens + sections) | ✅ edit here |
| `src/website/custom-chatbot-style.css` | GENERATED from partials | ❌ never edit |
| `web-lex-standalone/chat-frame.css` | Panel frame geometry (parent page) | ✅ |
| `web-lex-standalone/demo-page.css` | Demo host-page styles | ✅ (demo only) |
| `web-lex-standalone/right-panel-loader.js` | Bootstrap script | ✅ |
| `web-lex-standalone/right-panel.html` | Host page structure | ✅ |
| `web-lex-standalone/lex-web-ui-loader.min.*` | Vendored AWS loader v0.24 | ❌ vendored |
| `lex-web-ui/src/components/*.vue` | Vue app (themed: OnboardingForm, MinButton, ToolbarContainer) | ✅ |
| `src/config/lex-web-ui-loader-config.json` | Runtime config (bot IDs, UI knobs) | ✅ |
| `dist/` | Deployable output (bundle + deps + generated CSS) | ❌ generated |
| `bot-config/` | Bot assets (magnolia `AvatarIcon.png`) | ✅ |
| `build/copy-assets.js` | Builds theme CSS + syncs all copies | ✅ |

## Build & sync pipeline

```
edit src/website/styles/*.css  ──┐
edit lex-web-ui/src/**          ─┤
                                 ▼
npm run build-all
  ├─ build-dist    → vite builds lex-web-ui/dist/bundle/*
  └─ sync-assets   → node build/copy-assets.js
       ├─ concatenates styles/*.css → src/website/custom-chatbot-style.css
       ├─ copies bundle + deps + generated CSS → dist/
       └─ syncs generated CSS → web-lex-standalone/
```

- **CSS-only change:** `npm run sync-assets` (no vite build needed).
- **Component change:** `npm run build-all`.
- **Config change:** nothing — `server.js` serves the JSON directly.
- Run locally: `npm start` → http://localhost:8000/right-panel.html

## Where to change what

| Want to change | Edit |
|---|---|
| A theme color / font / bubble size | `src/website/styles/05-tokens.css` (single source of truth) |
| Header / bubbles / input styling rules | matching partial in `src/website/styles/` |
| Panel size, position, breakpoints, launcher circle | `web-lex-standalone/chat-frame.css` |
| Onboarding form / disclaimer layout | `lex-web-ui/src/components/OnboardingForm.vue` (then `build-all`) |
| Launcher icon/color defaults | `MinButton.vue` + config `ui.minButtonColor` |
| Texts, labels, disclaimer copy, bot IDs | `src/config/lex-web-ui-loader-config.json` |

## Config knobs added by this fork (all under `ui.`)

`showOnboardingForm`, `onboardingWelcomeTitle/Subtitle`, `onboarding*Label`,
`onboardingTermsUrl/LinkText/Title/BeforeLink/AfterLink`,
`onboardingDisclaimerHeading/Message` (`\n\n` = paragraph break),
`onboardingStartButtonText`, `onboardingButtonColor`, `onboardingPrimaryColor`,
`onboardingAgentAvatarUrl`, `onboardingRememberCompletion`,
`minButtonColor`, `showToolbarStatus`, `toolbarStatusText`.

## Token bridge (theme ↔ components)

Component scoped styles reference theme tokens **with identical literal
fallbacks**: `color: var(--ms-label-grey, #737373)`. Rules:

- The theme stylesheet (`05-tokens.css` → generated CSS) is the single
  source of truth: change a token and both theme rules *and* components
  follow.
- The fallback keeps every component self-contained — the app renders
  correctly even when the theme CSS is not loaded (vite dev server,
  reuse of a component elsewhere).
- When you add a token, keep the fallback literal in the component in
  sync with the token value (they are duplicates *by design*; the token
  wins at runtime whenever the theme is present).
- Config still has the last word where a knob exists
  (e.g. `ui.minButtonColor` → token → literal, in that order).

## Gotchas (learned the hard way)

1. **Never edit `custom-chatbot-style.css` directly** — it is generated;
   your change will be overwritten by the next `sync-assets`.
2. **Vue: a directive-less `<template>` renders as a real `<template>`
   element** (`display:none`) and silently hides everything inside it.
   Verify onboarding *visually*, not just via `querySelector`.
3. **Mobile frame height:** the AWS loader CSS forces `align-self:center`
   + `min-height` on the iframe container, so `height:auto` collapses.
   Use an explicit `calc(100dvh - 80px)` + `align-self: stretch`.
4. **Bubble shadows:** Vuetify adds a subtle `box-shadow` to bubbles that
   reads as an "extra border" vs the Kore look — kept disabled in
   `30-messages.css`.
5. **Don't paint `#lex-web` (app root)** — it shows as a grey square
   behind the round minimized launcher. Paint `.v-main` instead.
6. **Config nesting:** `recorder`, `ui`, `lex`, `cognito`, `iframe` must
   all be TOP-LEVEL keys in the loader config JSON.
7. **`!important` is required** in theme partials — they compete with
   Vuetify's own `!important` utilities; specificity alone won't win
   (e.g. `.min-button.min-button-fab` double-class to beat `.elevation-0`).
8. **Kore parity:** panel = 390px / 95vh / right 10 / bottom 15; mobile
   (≤767px) = 5px margins + 75px top, rounded corners kept, **no tablet
   breakpoint**. Reference: `web-kore-standalone/UI/chatWindowMS.css`.

## What this fork deliberately does NOT replicate

The Kore engine renders ~25 message template types (carousel, D3 charts,
forms, TTS/speech, expand state, language toggle). Our Lex bot only emits
text, response-card buttons, and quick replies — so only the *look* of the
MS theme is ported, not the template engine (Approach C).
