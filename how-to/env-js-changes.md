# `env.js` — Exact changes needed for Lex

## Add these 2 keys to every env file

### `src/assets/env.js` (local dev — Angular on 8100, Lex server on 8000)
```js
window["env"]["chatbotProvider"] = "lex";
window["env"]["lexWebSdkUrl"]    = "http://localhost:8000/";
```

### `src/assets/env.msst.js`
```js
window["env"]["chatbotProvider"] = "lex";
window["env"]["lexWebSdkUrl"]    = "https://lex-ui.msst.yourstate.gov/";
```

### `src/assets/env.msuat.js`
```js
window["env"]["chatbotProvider"] = "lex";
window["env"]["lexWebSdkUrl"]    = "https://lex-ui.msuat.yourstate.gov/";
```

### `src/assets/env.msprod.js`
```js
window["env"]["chatbotProvider"] = "lex";
window["env"]["lexWebSdkUrl"]    = "https://lex-ui.msprod.yourstate.gov/";
```

---

## ⚠️ Critical: trailing slash on lexWebSdkUrl

`lexWebSdkUrl` **MUST end with `/`**.

The IframeLoader does this internally:
```js
baseUrl + 'lex-web-ui-loader-config.json'
// → "http://localhost:8000/lex-web-ui-loader-config.json"  ✅ correct
// → "http://localhost:8000lex-web-ui-loader-config.json"   ✗ broken if no slash
```

---

## What each key does in LibConstants

| Key | Used by | Effect |
|-----|---------|--------|
| `chatbotProvider` | `initializeChatbot()` | `"lex"` → calls `openBotLex()`, `"kore"` → calls `openbot()` |
| `lexWebSdkUrl` | `openBotLex()` | Origin of running `reusa-lex-ui` Express server |

---

## One-word rollback to Kore

```js
window["env"]["chatbotProvider"] = "kore";
```

No rebuild needed — `env.js` is a plain runtime asset.
