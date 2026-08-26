# Using `reusa-lex-ui` as an npm module in `claimant-webapp`

This is the **exact mirror** of how `reusa-kore-ui` is wired — one `env.js` key switches between them.

---

## 1. Add the dependency to `claimant-webapp/package.json`

```json
"reusa-lex-ui": "0.0.1"
```

> Point the version at whatever is published to your private registry.
> Run `npm install` after adding it.

---

## 2. Add the Lex loader config JSON to `claimant-webapp`

Create the file below **exactly at this path** (Angular serves it as a static asset):

```
src/assets/lex-web-ui-loader-config.json
```

Copy it from `reusa-lex-ui`'s `bot-config/config.json` and update
`ui.parentOrigin` and `iframe.iframeOrigin` to the domain the Angular app
is actually served from (see step 6 for env-per-environment values).

---

## 3. Update `angular.json` — `assets` block

Inside `projects.app.architect.build.options.assets`, add **after** the existing `reusa-kore-ui` asset entries:

```json
{
  "glob": "**/*",
  "input": "node_modules/reusa-lex-ui/web-lex-standalone",
  "output": "lex-ui/"
},
{
  "glob": "**/*",
  "input": "node_modules/reusa-lex-ui/dist",
  "output": "lex-ui/dist/"
},
{
  "glob": "**/*",
  "input": "node_modules/reusa-lex-ui/bot-config",
  "output": "lex-ui/bot-config/"
}
```

> **Why**: The Lex iframe loader (`lex-web-ui-loader.min.js`) and the Vue
> bundle (`dist/lex-web-ui.js`) must be reachable from the same origin as
> the Angular app.  Placing them under `lex-ui/` keeps them isolated from
> the Kore `UI/` folder.

---

## 4. Update `angular.json` — `styles` block

Add **after** the existing `reusa-kore-ui` style entries:

```json
"./node_modules/reusa-lex-ui/web-lex-standalone/lex-web-ui-loader.min.css",
"./node_modules/reusa-lex-ui/web-lex-standalone/chat-frame.css"
```

> **Why**: `lex-web-ui-loader.min.css` positions the iframe container.
> `chat-frame.css` overrides the sizing/animation to match MDES geometry
> (390 px desktop, full-screen mobile, 56 px minimized FAB).

---

## 5. Update `angular.json` — `scripts` block

**No scripts to add.**

> Unlike Kore (which dumps jQuery + chatWindow.js as global scripts), the
> Lex loader is bootstrapped by the Angular `ChatbotService` at runtime by
> dynamically injecting `<script>` tags into the DOM.  The service controls
> this so the loader only runs when the chatbot is actually opened.

---

## 6. Update `src/assets/env.js` (and each `env.*.js`)

Add one key alongside the existing Kore keys:

```js
window["env"]["lexWebUiUrl"] = "http://localhost:8000";
```

For each environment file:

| File | Value |
|------|-------|
| `env.js` (local dev) | `"http://localhost:8000"` |
| `env.msst.js` | `"https://lex-ui.msst.yourstate.gov"` |
| `env.msuat.js` | `"https://lex-ui.msuat.yourstate.gov"` |
| `env.msprod.js` | `"https://lex-ui.msprod.yourstate.gov"` |

> `lexWebUiUrl` is the origin of the **running `reusa-lex-ui` server** — the
> Angular app iframe-embeds the chatbot from that URL.  It is **not** a
> path inside the Angular bundle.

---

## 7. Update `chatbot.service.ts`

### 7a. Add a `chatbotProvider` guard (reads `env.js`)

```typescript
private get provider(): string {
  return (window as any)['env']?.chatbotProvider ?? 'kore';
}
```

### 7b. Add `initializeLex()` private method

```typescript
private initializeLex(): void {
  const lexUrl: string = (window as any)['env']?.lexWebUiUrl ?? 'http://localhost:8000';

  // Inject the loader script once
  if (!document.getElementById('lex-loader-script')) {
    const script = document.createElement('script');
    script.id  = 'lex-loader-script';
    script.src = `${lexUrl}/web-lex-standalone/lex-web-ui-loader.min.js`;
    script.onload = () => this.bootstrapLexIframe(lexUrl);
    document.body.appendChild(script);
  } else {
    this.bootstrapLexIframe(lexUrl);
  }
}

private bootstrapLexIframe(lexUrl: string): void {
  const origin = lexUrl;

  // Fetch config from the running reusa-lex-ui server
  fetch(`${origin}/bot-config/config.json`)
    .then(r => r.json())
    .then((cfg: any) => {
      cfg.ui = cfg.ui || {};
      cfg.iframe = cfg.iframe || {};
      cfg.ui.parentOrigin    = origin;
      cfg.iframe.iframeOrigin = origin;
      cfg.iframe.shouldLoadIframeMinimized = false;

      const IframeLoader = (window as any).ChatBotUiLoader.IframeLoader;
      const loader = new IframeLoader({ baseUrl: origin + '/', shouldLoadMinDeps: true });
      return loader.load(cfg);
    })
    .then(() => console.log('Lex Web UI ready'))
    .catch((err: Error) => console.error('Lex Web UI failed to load', err));
}
```

### 7c. Branch in `initializeChatbot()` (keep Kore untouched)

```typescript
initializeChatbot(): void {
  if (this.provider === 'lex') {
    this.initializeLex();
  } else {
    // --- existing Kore initialization code stays here, unchanged ---
  }
}
```

---

## 8. Switch between Kore and Lex

In `src/assets/env.js`:

```js
// Use Kore:
window["env"]["chatbotProvider"] = "kore";

// Use Lex:
window["env"]["chatbotProvider"] = "lex";
```

One word change. No rebuild needed in dev (env.js is a plain asset).

---

## File change summary

| File | Change |
|------|--------|
| `package.json` | Add `"reusa-lex-ui": "0.0.1"` |
| `angular.json` | 3 asset entries + 2 style entries |
| `src/assets/env.js` (+ env.*.js) | Add `lexWebUiUrl` key |
| `src/app/services/chatbot.service.ts` | Add `initializeLex()` + branch in `initializeChatbot()` |
| `src/assets/lex-web-ui-loader-config.json` | New file — copy from `bot-config/config.json` |

No Kore files are touched. Rollback = change `chatbotProvider` back to `"kore"`.
