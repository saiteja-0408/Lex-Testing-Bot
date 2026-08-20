/**
 * Message normalizer — ALL Lex payload conversions live here (see
 * docs/BOT-RESPONSES.md). Returns the canonical message model
 * { text, template?, alts? } consumed by Message.vue.
 *
 * Degradation ladder, never throws: template JSON -> markdown -> text.
 * Pure functions only — tested via test/unit/message-normalizer.test.js.
 */

/**
 * Parse a CustomPayload string into a template descriptor, accepting the
 * Kore envelope ({"type":"template","payload":{...}}) or a bare payload.
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

/** Normalize one CustomPayload: template if recognized, else markdown. */
export function normalizeCustomPayload(raw, alts) {
  const template = parseMessageTemplate(raw);
  if (template) {
    // The bubble shows the template's own text, not the raw JSON.
    return { text: template.payload.text || '', template, alts };
  }
  // Copy rather than mutate the caller's alts — this module is pure.
  return { text: raw, template: undefined, alts: { ...alts, markdown: raw } };
}

/**
 * Normalize one Lex message of any content type (single dispatch point).
 * ImageResponseCards never reach here — the lex client extracts them
 * into responseCardLexV2 first.
 */
export function normalizeLexMessage(mes, alts) {
  if (!mes) return { text: '', template: undefined, alts };
  const contentType = mes.type || mes.contentType;
  const raw = (mes.value !== undefined && mes.value !== null)
    ? mes.value
    : (mes.content !== undefined && mes.content !== null) ? mes.content : '';
  if (contentType === 'CustomPayload') {
    return normalizeCustomPayload(raw, alts);
  }
  // A "\n" typed in the Lex console arrives as literal backslash-n; treat
  // it as the intended line break. Plain text only — never payload JSON.
  const text = typeof raw === 'string' ? raw.replace(/\\n/g, '\n') : raw;
  return { text, template: undefined, alts };
}
