<template>
  <!-- Terms "page navigate": MDES Disclaimer view (gradient header + bordered message) -->
  <div class="disclaimer-view">
    <div class="disclaimer-header">
      <!-- Back button: "‹ botName" — returns to the onboarding form -->
      <button
        ref="backButton"
        type="button"
        class="disclaimer-back"
        aria-label="Back to form"
        @click="$emit('back')"
      >
        <svg
          class="disclaimer-back-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span>{{ botName }}</span>
      </button>
      <!-- Close: closes the whole chat widget -->
      <button
        type="button"
        class="disclaimer-close"
        aria-label="Close"
        @click="$emit('close')"
      >
        &times;
      </button>
      <h2 class="disclaimer-title">
        {{ title }}
      </h2>
    </div>
    <div class="disclaimer-body">
      <div class="disclaimer-message">
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * MDES Disclaimer page ("Terms and services" target). Pure presentational:
 * content arrives via props; navigation is delegated via back/close events.
 */
export default {
  name: 'OnboardingDisclaimer',
  props: {
    /** Bot display name shown next to the back chevron (Kore go-back-button). */
    botName: { type: String, default: '' },
    /** Big white header title (MDES: "Disclaimer", 50px/700). */
    title: { type: String, default: 'Disclaimer' },
    /** Full message text; "\n\n" renders as paragraph breaks (pre-line). */
    message: { type: String, default: '' },
  },
  emits: ['back', 'close'],
  mounted() {
    // This view replaces the form wholesale, so the element that had focus
    // (the terms link) is gone — land keyboard users on the back button.
    this.$nextTick(() => this.$refs.backButton?.focus());
  },
};
</script>

<style scoped>
/* Matched to the live MDES disclaimer view (gradient header, bordered message). */
.disclaimer-view {
  position: fixed;      /* fill the whole panel (card height is auto) */
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  text-align: left;
  z-index: 3;
}
/* Colors reference the shared theme tokens with identical fallbacks
   (see ARCHITECTURE.md token bridge). */
.disclaimer-header {
  position: relative;
  flex: 0 0 auto;
  height: 30%;               /* MDES: header is 30% of the panel (~226px) */
  min-height: 30%;
  padding: 50px 18px 0 18px;
  color: #fff;
  background-image: var(--ms-disclaimer-gradient, linear-gradient(162deg, #09538b 60%, #f1f1e8));
}
/* Back button: "‹ botName", top-left, white 600 (MDES go-back-button) */
.disclaimer-back {
  position: absolute;
  top: 14px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  color: #fff;
  font-family: inherit;
  font-size: 22px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}
.disclaimer-back-icon {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: #fff;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.disclaimer-title {
  margin: 0;
  color: #fff;
  font-weight: 700;
  font-size: clamp(40px, 13vw, 50px);   /* MDES: 50px */
  line-height: 1.05;
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.6);
}
/* Close: lightgray x, top-right (MDES close-form-button) */
.disclaimer-close {
  position: absolute;
  top: 4px;
  right: 16px;
  border: none;
  background: none;
  color: #d3d3d3;
  font-size: 55px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}
.disclaimer-close:hover {
  color: #eee;
}
.disclaimer-back:focus-visible,
.disclaimer-close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
/* Body: pulled up so the message card overlaps the gradient tail (MDES) */
.disclaimer-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 0 18px 18px;
  margin-top: -58px;
  position: relative;
  z-index: 1;
  background: transparent;
}
.disclaimer-message {
  border: 1px groove #6e6e6e;
  border-radius: 8px;
  box-shadow: 5px 5px 5px grey;
  padding: 6px;
  color: var(--ms-label-grey, #737373);
  font-family: "Open Sans", sans-serif;
  font-size: 22px;
  font-weight: 300;          /* MDES light (~200/300) */
  line-height: normal;
  background: #fff;
}
.disclaimer-message p {
  margin: 0;
  white-space: pre-line;   /* render \n\n paragraph breaks from config */
}
</style>
