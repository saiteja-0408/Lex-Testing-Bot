# Bot response authoring guide

The contract between the Lex bot and this UI. If a response follows one of
the four shapes below, the UI renders it correctly — no UI change needed.

**Golden rule: prose goes in text messages; buttons go in button
structures; never mix.**

How it works under the hood (see ARCHITECTURE.md):

```
Lex response ─▶ lib/message-normalizer   (ALL payload conversions — one file)
                    │  canonical message: { text, template?, alts? }
                    ▼
             Message.vue ─▶ components/message-templates/registry
                            (templateType → component, one line per type)
```

---

## Shape 1 — Plain sentence (most responses)

```json
{ "contentType": "PlainText",
  "content": "Your claim was received.\n\nProcessing takes 5–7 days." }
```

- `\n` renders as a real line break (theme sets `white-space: pre-line`)
- Bare URLs auto-become clickable links (`convertUrlToLinksInBotMessages`)

## Shape 2 — Sentence + a few buttons (1–3)

One ImageResponseCard: the message text goes in `title`, which the UI
renders styled exactly like a regular bot bubble (navy, wrapping, no
truncation), with the button pills underneath.

```json
"messages": [
  { "contentType": "ImageResponseCard",
    "imageResponseCard": {
      "title": "Please check your user ID and password. If you forgot your password, I can help.",
      "buttons": [ { "text": "Forgot password", "value": "Forgot password" } ] } }
]
```

- **Titles are VISIBLE** (`shouldDisplayResponseCardTitle: true`) — the
  title IS the message. Never send stub titles like "options"; they will
  show on screen.
- `title` has a **250-character Lex hard limit**. Longer prose? Send a
  PlainText message first (Shape 1) and keep the card title short — both
  render as bubbles, so it reads as two messages.

## Shape 3 — Sentence + many buttons (4+, one block, never split)

One CustomPayload whose content is the Kore-style button template —
**Kore payloads can be pasted verbatim** (the full `{"type":"template",
"payload":{...}}` envelope or just the inner payload both work):

```json
{ "contentType": "CustomPayload",
  "content": "{\"type\":\"template\",\"payload\":{\"template_type\":\"button\",\"text\":\"Here are some frequently asked questions I can help you with.\\n\\n You can select the options below or enter your question in the input bar.\",\"buttons\":[{\"type\":\"postback\",\"title\":\"Debit card\",\"payload\":\"Debit card\"},{\"type\":\"postback\",\"title\":\"Email status\",\"payload\":\"Email status\"}]}}" }
```

Renders as: navy bubble with the `text` (paragraph break honored) + ALL
buttons as one wrapping pill row underneath — never split into cards.

## Shape 4 — Rich formatting (bold, lists, markdown links)

CustomPayload containing markdown (anything that is not template JSON):

```json
{ "contentType": "CustomPayload",
  "content": "**Deadline:** file by *Friday*.\n\n[Full rules](https://mdes.ms.gov/rules)" }
```

---

## Cross-cutting rules

1. **Button `value`/`payload` = exactly what a user would type.** Clicking
   posts it as user text; Lex must have a matching utterance/intent.
2. **Order: text first, buttons last** in the messages array.
3. **Keep it lean** — Lex caps message content length; short button titles.
4. **Unknown `template_type`s never crash** — the UI falls back to text, so
   the bot may ship a new type before the UI supports it.
5. **Version future schemas** — add `"version": 1` to new template types.

## Adding a NEW template type (UI side)

1. `lex-web-ui/src/components/message-templates/TplYourType.vue`
   (props: `payload`; emits: `send`)
2. One line in `message-templates/registry.js`
3. If the payload needs custom parsing, extend `lib/message-normalizer`
   and add a fixture + test in `test/unit/` (`npm run test:messages`)

Nothing else — Message.vue and the store are never touched.
