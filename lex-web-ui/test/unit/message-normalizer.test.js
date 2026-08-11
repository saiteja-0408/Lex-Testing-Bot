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
