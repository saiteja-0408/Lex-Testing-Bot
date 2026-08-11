/**
 * ============================================================
 * MESSAGE NORMALIZER — all Lex→UI response conversions live HERE.
 * ============================================================
 * Single source of truth for turning raw Lex payload strings into the
 * canonical message model the UI renders. Nothing else in the app may
 * parse bot payloads (see ARCHITECTURE.md and docs/BOT-RESPONSES.md).
 *
 * Canonical message model (fields consumed by Message.vue):
 *   {
 *     text:     string        // what the navy bubble shows ('' = no bubble text)
 *     template: {             // present only for recognized JSON templates —
 *       templateType: string  //   rendered by components/message-templates/registry
 *       payload: object
 *     } | undefined
 *     alts:     { markdown } | undefined   // legacy markdown rendering path
 *   }
 *
 * Degradation ladder (never throws):
 *   1. Parseable JSON with template_type  → template  (registry renders)
 *   2. Anything else in a CustomPayload   → markdown  (marked renders)
 *   3. PlainText                          → text      (bubble renders; \n honored)
 *
 * PURE FUNCTIONS ONLY: no store, no components, no side effects — this
 * module is unit-tested with plain Node (test/unit/message-normalizer.test.js).
 */

/**
 * Parse a CustomPayload string into a template descriptor.
 *
 * Accepts BOTH shapes so bot authors can paste Kore.ai payloads verbatim:
 *   1. Kore envelope:  { "type": "template", "payload": { "template_type": "button", ... } }
 *   2. Bare payload:   { "template_type": "button", ... }
 *
 * Returns { templateType, payload } or null (caller falls back to markdown).
 */
export function parseMessageTemplate(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s.startsWith('{')) return null;
  let obj;
  try {
    obj = JSON.parse(s);
  } catch (e) {
    return null;
  }
  const payload = (obj && obj.type === 'template' && obj.payload) ? obj.payload : obj;
  const templateType = payload && (payload.template_type || payload.templateType);
  if (!templateType || typeof templateType !== 'string') return null;
  return { templateType, payload };
}

/**
 * Normalize one CustomPayload message.
 *
 * @param {string} raw   - the CustomPayload content from Lex
 * @param {object} alts  - existing alt-messages object (may be undefined)
 * @returns {{ text, template, alts }} canonical fields for pushMessage
 */
export function normalizeCustomPayload(raw, alts) {
  const template = parseMessageTemplate(raw);
  if (template) {
    // Template messages show the template's own text in the bubble
    // instead of the raw JSON payload.
    return { text: template.payload.text || '', template, alts };
  }
  // Legacy behavior: any non-template CustomPayload renders as markdown.
  const nextAlts = alts === undefined ? {} : alts;
  nextAlts.markdown = raw;
  return { text: raw, template: undefined, alts: nextAlts };
}
