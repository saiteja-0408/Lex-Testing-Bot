/**
 * Unit tests for lib/message-normalizer — runs with Node's built-in runner:
 *   npm run test:messages        (from lex-web-ui/)
 *   node --test test/unit/message-normalizer.test.js
 *
 * Fixture-driven: real payloads captured from the bot live in
 * test/unit/fixtures/. Every production surprise should become a fixture.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  parseMessageTemplate,
  normalizeCustomPayload,
  normalizeLexMessage,
} from '../../src/lib/message-normalizer/index.js';

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const fixture = (name) => readFileSync(path.join(fixturesDir, name), 'utf8');

/* ── parseMessageTemplate ──────────────────────────────────────── */

test('parses the real Kore button template (full envelope)', () => {
  const raw = fixture('kore-button-template.json');
  const tpl = parseMessageTemplate(raw);
  assert.ok(tpl, 'should parse');
  assert.equal(tpl.templateType, 'button');
  assert.equal(tpl.payload.buttons.length, 6);
  assert.equal(tpl.payload.buttons[0].title, 'Debit card');
  assert.match(tpl.payload.text, /\n\n/, 'keeps the \\n\\n paragraph break');
});

test('parses a bare payload without the Kore envelope', () => {
  const tpl = parseMessageTemplate(
    '{"template_type":"button","text":"Pick one","buttons":[{"title":"A","payload":"A"}]}',
  );
  assert.ok(tpl);
  assert.equal(tpl.templateType, 'button');
  assert.equal(tpl.payload.buttons.length, 1);
});

test('accepts camelCase templateType as alias', () => {
  const tpl = parseMessageTemplate('{"templateType":"button","buttons":[]}');
  assert.ok(tpl);
  assert.equal(tpl.templateType, 'button');
});

test('returns null for markdown, plain text, malformed and empty input', () => {
  assert.equal(parseMessageTemplate('**bold** markdown text'), null);
  assert.equal(parseMessageTemplate('hello world'), null);
  assert.equal(parseMessageTemplate('{broken json'), null);
  assert.equal(parseMessageTemplate('{"no":"template_type"}'), null);
  assert.equal(parseMessageTemplate(''), null);
  assert.equal(parseMessageTemplate(null), null);
  assert.equal(parseMessageTemplate(undefined), null);
});

/* ── normalizeCustomPayload ────────────────────────────────────── */

test('template payload → bubble text from template, no markdown alt', () => {
  const raw = fixture('kore-button-template.json');
  const norm = normalizeCustomPayload(raw, undefined);
  assert.equal(norm.template.templateType, 'button');
  assert.match(norm.text, /^Here are some frequently asked questions/);
  assert.equal(norm.alts, undefined, 'alts untouched for template payloads');
});

test('non-template payload → legacy markdown path preserved', () => {
  const norm = normalizeCustomPayload('**Deadline:** file by *Friday*.', undefined);
  assert.equal(norm.template, undefined);
  assert.equal(norm.alts.markdown, '**Deadline:** file by *Friday*.');
  assert.equal(norm.text, '**Deadline:** file by *Friday*.');
});

test('non-template payload merges into existing alts without clobbering', () => {
  const existing = { html: '<b>hi</b>' };
  const norm = normalizeCustomPayload('plain note', existing);
  assert.equal(norm.alts.html, '<b>hi</b>', 'existing alt kept');
  assert.equal(norm.alts.markdown, 'plain note');
});

test('template with missing text still renders (empty bubble text)', () => {
  const norm = normalizeCustomPayload(
    '{"template_type":"button","buttons":[{"title":"A","payload":"A"}]}',
    undefined,
  );
  assert.equal(norm.text, '');
  assert.equal(norm.template.templateType, 'button');
});

/* ── degradation ladder end-to-end ─────────────────────────────── */

test('unknown template types still parse (registry decides rendering)', () => {
  const tpl = parseMessageTemplate('{"template_type":"carousel_v9","cards":[]}');
  assert.ok(tpl, 'parser accepts unknown types — UI falls back if unregistered');
  assert.equal(tpl.templateType, 'carousel_v9');
});

/* ── normalizeLexMessage: MIXED multi-message response ─────────── */
/* One Lex response carrying PlainText + markdown + button template +
   the empty card-carrier placeholder — each message must normalize
   independently (loose coupling). Fixture mirrors client.js v1-format. */

test('mixed response: every message type normalizes independently', () => {
  const { messages } = JSON.parse(fixture('mixed-response.json'));
  const out = messages.map((m) => normalizeLexMessage(m, undefined));

  // 1. PlainText — \n preserved, no template, no markdown alt
  assert.match(out[0].text, /\n\n/);
  assert.equal(out[0].template, undefined);
  assert.equal(out[0].alts, undefined);

  // 2. CustomPayload markdown — named link preserved for marked
  assert.equal(out[1].alts.markdown, '**Status:** approved. [Details](https://mdes.ms.gov/details)');
  assert.equal(out[1].template, undefined);

  // 3. CustomPayload button template — text + ALL 4 buttons, no markdown
  assert.equal(out[2].template.templateType, 'button');
  assert.equal(out[2].template.payload.buttons.length, 4);
  assert.equal(out[2].text, 'Pick one');
  assert.equal(out[2].alts, undefined);

  // 4. Card-carrier placeholder — empty text (UI hides the bubble)
  assert.equal(out[3].text, '');
  assert.equal(out[3].template, undefined);

  // Only the true last message may display V2 cards
  assert.equal(messages[3].isLastMessageInGroup, 'true');
  assert.ok(messages.slice(0, 3).every((m) => m.isLastMessageInGroup === 'false'));
});

test('PlainText: literal backslash-n from Lex-console authoring becomes a real newline', () => {
  // real payload seen from the bot: "You will need the following information:\n* MDES User ID"
  const out = normalizeLexMessage(
    { type: 'PlainText', value: 'You will need:\\n* MDES User ID \\n* SSN\\n\\nReady?' },
    undefined,
  );
  assert.equal(out.text, 'You will need:\n* MDES User ID \n* SSN\n\nReady?');
});

test('CustomPayload JSON is NEVER unescaped (template payloads stay intact)', () => {
  const tpl = normalizeLexMessage(
    { type: 'CustomPayload', value: '{"template_type":"button","text":"a\\nb","buttons":[]}' },
    undefined,
  );
  // JSON.parse already turns \n into a real newline inside the parsed text;
  // the raw payload itself must not be pre-mangled before parsing.
  assert.equal(tpl.template.templateType, 'button');
  assert.equal(tpl.text, 'a\nb');
});

test('normalizeLexMessage: unknown content types fall back to text', () => {
  const out = normalizeLexMessage({ type: 'SSML', value: '<speak>hi</speak>' }, undefined);
  assert.equal(out.text, '<speak>hi</speak>');
  assert.equal(out.template, undefined);
});

test('normalizeLexMessage: null/absent message never throws', () => {
  assert.equal(normalizeLexMessage(null, undefined).text, '');
  assert.equal(normalizeLexMessage({}, undefined).text, '');
});
