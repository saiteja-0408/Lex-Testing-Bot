<template>
  <div class="ms-tpl-buttons" role="group" aria-label="quick options">
    <button
      v-for="(btn, i) in buttons"
      :key="i"
      type="button"
      class="ms-tpl-btn"
      @click="$emit('send', { text: btn.payload || btn.title })"
    >
      {{ btn.title }}
    </button>
  </div>
</template>

<script>
/**
 * Kore-style "button" template: renders ALL buttons as MDES pills in one
 * wrapping row under the message bubble (never split across cards).
 * Button shape (Kore): { type: 'postback', title: 'Debit card', payload: 'Debit card' }
 * Clicking emits `send` with the payload text; the dispatcher posts it to Lex.
 */
export default {
  name: 'tpl-buttons',
  props: { payload: { type: Object, required: true } },
  emits: ['send'],
  computed: {
    buttons() {
      return Array.isArray(this.payload.buttons) ? this.payload.buttons : [];
    },
  },
};
</script>

<style scoped>
/* Token bridge: theme tokens rule when the theme CSS is loaded; the
   literal fallbacks keep the component self-contained (ARCHITECTURE.md). */
.ms-tpl-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 5px 6px;
  width: 100%;
}
.ms-tpl-btn {
  border: 1px solid var(--ms-btn-outline, #539FF2);
  color: var(--ms-btn-text, #539FF2);
  background: #fff;
  border-radius: var(--ms-pill-radius, 12px);
  font-family: inherit;
  font-size: var(--ms-bubble-font-size, 14px);
  line-height: 1.4;
  padding: 2px 11px;
  cursor: pointer;
}
/* Hover verified on live MDES: solid header-blue fill, white text */
.ms-tpl-btn:hover {
  background: var(--ms-header-accent, #1c3e64);
  color: #fff;
}
.ms-tpl-btn:focus-visible {
  outline: 2px solid var(--ms-btn-outline, #539FF2);
  outline-offset: 1px;
}
</style>
