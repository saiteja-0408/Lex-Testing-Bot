# `angular.json` — Exact changes needed for `reusa-lex-ui`

Copy-paste these additions into the matching arrays.
**Do NOT remove or touch any existing `reusa-kore-ui` entries.**

---

## ASSETS — add these 3 entries after the last `reusa-kore-ui` asset block

Existing last Kore asset entry (find it as your anchor):
```json
{
  "glob": "**/*",
  "input": "node_modules/reusa-kore-ui/UI/assets",
  "output": "ss/UI/assets/"
}
```

Add **immediately after** that closing `}`:
```json
,
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

### What each output path serves at runtime

| Angular output path | What's in it | Why needed |
|---|---|---|
| `lex-ui/` | `lex-web-ui-loader.min.js`, `right-panel-loader.js`, `right-panel.html`, CSS files | The iframe loader library + bootstrap script |
| `lex-ui/dist/` | `lex-web-ui.js`, Vue/Vuex/Vuetify bundles, wav-worker | The actual chat component loaded inside the iframe |
| `lex-ui/bot-config/` | `config.json`, `bot-icon.png` | Cognito + Lex bot settings + toolbar icon |

---

## STYLES — add these 2 entries after the last `reusa-kore-ui` style entry

Existing last Kore style entry (anchor):
```json
"./node_modules/reusa-kore-ui/UI/custom/customTemplate.css"
```

Add **immediately after** that line:
```json
"./node_modules/reusa-lex-ui/web-lex-standalone/lex-web-ui-loader.min.css",
"./node_modules/reusa-lex-ui/web-lex-standalone/chat-frame.css"
```

### Why these two CSS files
- `lex-web-ui-loader.min.css` — positions the `<div class="lex-web-ui-iframe">` container (fixed positioning, z-index stack)
- `chat-frame.css` — MDES geometry overrides: 390px wide desktop, full-screen mobile, 56px circular FAB when minimized

---

## SCRIPTS — **nothing to add**

The Lex loader is injected at runtime by `ChatbotService.initializeLex()` via
`document.createElement('script')`. It must not be loaded eagerly in `scripts[]`
because it registers a global `ChatBotUiLoader` that should only exist when the
user actually opens the chatbot.

---

## Complete diff view (for code-review clarity)

### assets array — before/after

```diff
         {
           "glob": "**/*",
           "input": "node_modules/reusa-kore-ui/UI/assets",
           "output": "ss/UI/assets/"
-        }
+        },
+        {
+          "glob": "**/*",
+          "input": "node_modules/reusa-lex-ui/web-lex-standalone",
+          "output": "lex-ui/"
+        },
+        {
+          "glob": "**/*",
+          "input": "node_modules/reusa-lex-ui/dist",
+          "output": "lex-ui/dist/"
+        },
+        {
+          "glob": "**/*",
+          "input": "node_modules/reusa-lex-ui/bot-config",
+          "output": "lex-ui/bot-config/"
+        }
       ],
```

### styles array — before/after

```diff
         "./node_modules/reusa-kore-ui/UI/custom/customTemplate.css",
+        "./node_modules/reusa-lex-ui/web-lex-standalone/lex-web-ui-loader.min.css",
+        "./node_modules/reusa-lex-ui/web-lex-standalone/chat-frame.css",
         "./node_modules/ngx-spinner/animations/ball-scale-multiple.css",
```
