# Lex toolbar online status (3-state indicator)

This document describes the **offline / connecting / online** indicator in the chat toolbar and how it maps to Lex runtime behavior in this fork.

## What it represents

Amazon Lex V2 in this UI is reached through **HTTP requests** (for example `RecognizeText` and session APIs), not a persistent browser “socket connection.” The indicator therefore reflects **whether a Lex call is in flight** and **whether the last relevant call succeeded**, not a literal TCP/WebSocket session.

| UI state | Dot color | Label |
|----------|-----------|--------|
| `offline` | Red | Offline |
| `connecting` | Amber | Connecting... |
| `online` | Green | Online (or `ui.toolbarStatusText` from config when online) |

## Source of truth (Vuex)

- **State:** `lex.connectionStatus` — one of `offline`, `connecting`, `online`.
- **Initial value:** `offline` in `lex-web-ui/src/store/state.js`.
- **Mutation:** `setLexConnectionStatus` in `lex-web-ui/src/store/mutations.js` (only the three strings above are accepted).

## When each status is set

### Chat and voice (`lexPostText`, `lexPostContent`)

- **`connecting`** — committed at the start of the action, before credentials refresh and the Lex client call.
- **`online`** — committed after a successful response and normal completion of processing.
- **`offline`** — committed in the `catch` path when the call fails.

### New session (`startNewSession`)

Same pattern: **`connecting`** while work is in progress, **`online`** on success, **`offline`** on error.

### Onboarding (“Start Chatting”)

In `lex-web-ui/src/components/LexWeb.vue`, `onOnboardingComplete` dispatches **`testLexConnection`** in the same tick as **`sendInitialUtterance`**.

- **`testLexConnection`** (in `lex-web-ui/src/store/actions.js`) sets **`connecting`**, refreshes credentials, performs a lightweight Lex runtime round-trip (`deleteSession`), then sets **`online`** on success or **`offline`** on failure.
- This makes the toolbar show **Connecting...** immediately after the user submits onboarding, even before the first `RecognizeText` from the initial utterance finishes.

If **`testLexConnection`** and **`sendInitialUtterance`** overlap, both may set **`connecting`** in sequence; that is expected whenever multiple Lex operations run close together.

## UI binding

`lex-web-ui/src/components/ToolbarContainer.vue`:

- **`connectionDotClass`** — maps `connectionStatus` to CSS modifier classes on the status dot.
- **`displayToolbarStatusText`** — maps `connectionStatus` to the visible label (`Offline`, `Connecting...`, or the configured online string).

Toolbar visibility still respects **`ui.showToolbarStatus`** in the loader config.

## Build and deploy

After changing Vue or store code, rebuild and copy assets so `dist/` matches source (for example `npm run build-dist` and `node build/copy-assets.js` from the repo root that owns this package), then deploy or serve the updated bundle.

## Related files

| Area | Path |
|------|------|
| Initial state | `lex-web-ui/src/store/state.js` |
| Mutation | `lex-web-ui/src/store/mutations.js` |
| Actions | `lex-web-ui/src/store/actions.js` (`testLexConnection`, `lexPostText`, `lexPostContent`, `startNewSession`) |
| Onboarding hook | `lex-web-ui/src/components/LexWeb.vue` |
| Toolbar | `lex-web-ui/src/components/ToolbarContainer.vue` |
| Optional global styles | `src/website/custom-chatbot-style.css` |
