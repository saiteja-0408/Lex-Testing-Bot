<template>
  <div
    class="onboarding-wrap"
    role="dialog"
    aria-modal="true"
    aria-labelledby="onboarding-welcome-title"
  >
    <v-card
      class="onboarding-card"
      rounded="0"
      elevation="0"
    >
      <button
        v-if="!showTermsViewer"
        type="button"
        class="onboarding-close"
        aria-label="Close"
        @click="$emit('close')"
      >
        &times;
      </button>

      <!-- Terms "page navigate": extracted MDES Disclaimer component -->
      <onboarding-disclaimer
        v-if="showTermsViewer"
        :bot-name="botName"
        :title="termsTitle"
        :message="disclaimerFullText"
        @back="closeTermsViewer"
        @close="$emit('close')"
      />

      <div
        v-else
        class="onboarding-content"
      >
        <!-- MS banner: magnolia logo + cornflowerblue welcome + bold subtitle -->
        <div class="ms-banner">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            class="ms-logo"
            alt=""
          >
          <div
            v-else
            class="ms-logo ms-logo--fallback"
          >
            <v-icon
              size="64"
              color="white"
            >
              local_florist
            </v-icon>
          </div>

          <h1
            id="onboarding-welcome-title"
            class="onboarding-welcome"
          >
            {{ welcomeTitle }}
          </h1>
          <p class="onboarding-sub">
            {{ welcomeSubtitle }}
          </p>
        </div>

        <!-- MS form: static label-above + plain outlined inputs -->
        <form
          class="ms-form"
          novalidate
          @submit.prevent="onSubmit"
        >
          <div class="ms-field">
            <label
              for="ob-first-name"
              class="ms-label"
            >{{ firstNameLabel }}</label>
            <input
              id="ob-first-name"
              ref="firstNameInput"
              v-model="firstName"
              class="ms-input"
              type="text"
              autocomplete="given-name"
              :aria-invalid="errors.firstName ? 'true' : undefined"
              :aria-describedby="errors.firstName ? 'ob-first-name-error' : undefined"
            >
            <div
              v-if="errors.firstName"
              id="ob-first-name-error"
              role="alert"
              class="ms-error"
            >
              {{ errors.firstName }}
            </div>
          </div>

          <div class="ms-field">
            <label
              for="ob-last-name"
              class="ms-label"
            >{{ lastNameLabel }}</label>
            <input
              id="ob-last-name"
              v-model="lastName"
              class="ms-input"
              type="text"
              autocomplete="family-name"
              :aria-invalid="errors.lastName ? 'true' : undefined"
              :aria-describedby="errors.lastName ? 'ob-last-name-error' : undefined"
            >
            <div
              v-if="errors.lastName"
              id="ob-last-name-error"
              role="alert"
              class="ms-error"
            >
              {{ errors.lastName }}
            </div>
          </div>

          <div class="ms-field">
            <label
              for="ob-email"
              class="ms-label"
            >{{ emailLabel }}</label>
            <input
              id="ob-email"
              v-model="email"
              class="ms-input"
              type="email"
              autocomplete="email"
              :aria-invalid="errors.email ? 'true' : undefined"
              :aria-describedby="errors.email ? 'ob-email-error' : undefined"
            >
            <div
              v-if="errors.email"
              id="ob-email-error"
              role="alert"
              class="ms-error"
            >
              {{ errors.email }}
            </div>
          </div>

          <div class="ms-agreement">
            <label class="ms-check">
              <input
                v-model="termsAccepted"
                type="checkbox"
                :aria-invalid="errors.terms ? 'true' : undefined"
                :aria-describedby="errors.terms ? 'ob-terms-error' : undefined"
              >
              <span>
                {{ termsBeforeLink }}
                <a
                  ref="termsLink"
                  :href="termsUrl"
                  class="onboarding-terms-link"
                  @click.prevent.stop="openTermsViewer"
                >{{ termsLinkText }}</a>
                {{ termsAfterLink }}
              </span>
            </label>
            <div
              v-if="errors.terms"
              id="ob-terms-error"
              role="alert"
              class="ms-error"
            >
              {{ errors.terms }}
            </div>
          </div>

          <button
            type="submit"
            class="onboarding-cta"
            :style="{ background: ctaColor }"
            :disabled="submitting"
          >
            {{ startButtonText }}
          </button>
        </form>
      </div>
    </v-card>
  </div>
</template>

<script>
/**
 * MDES onboarding form. Renders the welcome form and hosts the disclaimer
 * sub-view; emits "complete" with the collected fields — LexWeb.vue decides
 * what happens next. Fallback copy/colors: config/onboardingDefaults.js.
 */
import OnboardingDisclaimer from './OnboardingDisclaimer.vue';
import { onboardingValue } from '../config/onboardingDefaults';

export default {
  name: 'OnboardingForm',
  components: { OnboardingDisclaimer },
  props: {
    // Optional injection point: pass the ui config object to render this
    // component without a Vuex store (unit tests, reuse outside LexWeb).
    uiConfig: { type: Object, default: null },
  },
  emits: ['close', 'complete'],
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      termsAccepted: false,
      submitting: false,
      showTermsViewer: false,
      errors: { firstName: '', lastName: '', email: '', terms: '' },
    };
  },
  computed: {
    c() {
      return this.uiConfig || this.$store.state.config.ui;
    },
    // All fallback copy/colors live in config/onboardingDefaults.js —
    // change defaults there, not here.
    welcomeTitle() { return this.cfg('onboardingWelcomeTitle'); },
    welcomeSubtitle() { return this.cfg('onboardingWelcomeSubtitle'); },
    firstNameLabel() { return this.cfg('onboardingFirstNameLabel'); },
    lastNameLabel() { return this.cfg('onboardingLastNameLabel'); },
    emailLabel() { return this.cfg('onboardingEmailLabel'); },
    termsUrl() { return this.cfg('onboardingTermsUrl'); },
    termsLinkText() { return this.cfg('onboardingTermsLinkText'); },
    termsBeforeLink() { return this.cfg('onboardingTermsBeforeLink'); },
    termsAfterLink() { return this.cfg('onboardingTermsAfterLink'); },
    startButtonText() { return this.cfg('onboardingStartButtonText'); },
    ctaColor() { return this.cfg('onboardingButtonColor'); },
    // MS magnolia logo, e.g. onboardingAgentAvatarUrl: "/bot-config/AvatarIcon.png"
    avatarUrl() { return this.cfg('onboardingAgentAvatarUrl'); },
    // Disclaimer ("page navigate") content — rendered by OnboardingDisclaimer.vue
    botName() {
      return this.c.toolbarTitle || this.c.pageTitle || '';
    },
    termsTitle() { return this.cfg('onboardingTermsTitle'); },
    disclaimerHeading() { return this.cfg('onboardingDisclaimerHeading'); },
    disclaimerMessage() { return this.cfg('onboardingDisclaimerMessage'); },
    // MDES renders heading + body as one light paragraph (heading, blank line, body).
    disclaimerFullText() {
      return `${this.disclaimerHeading}\n\n${this.disclaimerMessage}`;
    },
  },
  watch: {
    // Clear each field's error as soon as the user fixes it, instead of
    // leaving a stale message up until the next submit attempt.
    firstName(value) { if (value.trim()) this.errors.firstName = ''; },
    lastName(value) { if (value.trim()) this.errors.lastName = ''; },
    email() { this.errors.email = ''; },
    termsAccepted(checked) { if (checked) this.errors.terms = ''; },
  },
  mounted() {
    // role="dialog": move focus into the dialog so keyboard/screen-reader
    // users land on the first field, not on the page behind it.
    this.$nextTick(() => this.$refs.firstNameInput?.focus());
  },
  methods: {
    /** Config value with fallback from ONBOARDING_DEFAULTS (pure helper). */
    cfg(key) {
      return onboardingValue(this.c, key);
    },
    openTermsViewer() {
      this.showTermsViewer = true;
    },
    closeTermsViewer() {
      this.showTermsViewer = false;
      // Return focus to the link that opened the disclaimer — the whole
      // view was swapped out, so focus would otherwise fall to <body>.
      this.$nextTick(() => this.$refs.termsLink?.focus());
    },
    onSubmit() {
      if (this.submitting) return; // double-submit guard (Enter + click)
      this.errors = { firstName: '', lastName: '', email: '', terms: '' };
      let valid = true;
      if (!this.firstName.trim()) {
        this.errors.firstName = 'This field is required';
        valid = false;
      }
      if (!this.lastName.trim()) {
        this.errors.lastName = 'This field is required';
        valid = false;
      }
      // Email is optional, but if one is provided it must look like one.
      const email = this.email.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this.errors.email = 'Please enter a valid email address';
        valid = false;
      }
      if (!this.termsAccepted) {
        this.errors.terms = 'You must accept the terms to continue';
        valid = false;
      }
      if (!valid) return;

      // Stays true for the component's lifetime: the parent unmounts this
      // form on 'complete', so re-enabling would only re-open the
      // double-submit window it exists to close.
      this.submitting = true;
      this.$emit('complete', {
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email,
        termsAccepted: this.termsAccepted,
      });
    },
  },
};
</script>

<style scoped>
/* Matched to the live MDES onboarding form. Colors use theme tokens with
   identical literal fallbacks so the component renders without the theme. */
.onboarding-wrap {
  position: fixed;
  z-index: 2000;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: var(--ms-body-bg, #eaeef3);
  padding: 0;
  box-sizing: border-box;
  overflow-y: auto;          /* scroll the whole card as one unit, so the curve
                                is always visible at the content's end (any height) */
  font-family: var(--ms-font-stack, "freight-sans-pro", "Open Sans", "Segoe UI", system-ui, sans-serif);
}
.onboarding-card {
  position: relative;
  width: 100%;
  height: auto;
  flex: 0 0 auto;
  /* Fill the panel minus a fixed grey band, so the curve + grey below it look
     the SAME at any screen height (band no longer swells on tall screens). */
  min-height: calc(100% - 64px);
  max-height: none;
  overflow: visible;
  background: #fff !important;
  /* Kore .form-container curve. Horizontal radius is proportional (31% ≈ Kore's
     120px at 390px) so the curve shape stays consistent at any panel width.
     No shadow (the shadow read as an extra bottom border). */
  border-bottom-left-radius: 31% 65px !important;
  border-bottom-right-radius: 31% 65px !important;
  box-shadow: none !important;
}
.onboarding-content {
  height: auto;
  padding: 20px 22px 40px;
  text-align: center;
}
/* Onboarding close: matches MDES (55px, lightgray, top-right) */
.onboarding-close {
  position: absolute;
  top: 5px;
  right: 20px;
  z-index: 2;
  border: none;
  background: none;
  color: #d3d3d3;
  font-size: 55px;
  line-height: 1;
  cursor: pointer;
  padding: 0 6px;
}
.onboarding-close:hover {
  color: #bdbdbd;
}
/* Keyboard affordance only — the resting #d3d3d3 is an exact MDES value,
   so contrast help is limited to focus (visible ring + darker glyph). */
.onboarding-close:focus-visible {
  outline: 2px solid var(--ms-cta-blue, #09538b);
  outline-offset: 2px;
  color: var(--ms-control-grey, #5a6b7a);
}

/* Banner */
.ms-banner {
  text-align: center;
  margin-bottom: 14px;
}
.ms-logo {
  display: block;
  width: 45%;
  max-width: 160px;
  height: auto;
  margin: 6px auto 0;
}
.ms-logo--fallback {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #1e3a5f;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 6px auto 0;
}
.onboarding-welcome {
  color: cornflowerblue;
  font-weight: 700;
  font-size: 37px;
  line-height: 1.1;
  margin: 8px 0 0;
}
.onboarding-sub {
  color: #000;
  font-weight: 700;
  font-size: 13px;
  margin: 4px 0 0;
}

/* Form: static label above + plain outlined input */
.ms-form {
  text-align: left;
}
.ms-field {
  margin-bottom: 14px;
}
.ms-label {
  display: block;
  color: var(--ms-label-grey, #737373);
  font-size: 16px;
  margin-bottom: 6px;
}
.ms-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--ms-input-border, #cccccc);
  border-radius: 4px;
  height: 36px;
  padding: 6px 10px;
  font-size: 15px;
  color: #333;
  background: #fff;
  font-family: inherit;
}
.ms-input:focus {
  outline: none;
  border-color: var(--ms-cta-blue, #09538b);
}

/* Agreement */
.ms-agreement {
  margin: 6px 0 16px;
}
.ms-check {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  cursor: pointer;
}
.ms-check input {
  margin-top: 3px;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
/* Terms "readmore" link: MDES bright blue, no underline */
.onboarding-terms-link {
  color: var(--ms-terms-link, #0192ff);
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
}
.onboarding-terms-link:hover,
.onboarding-terms-link:focus-visible {
  text-decoration: underline;
}
.onboarding-terms-link:focus-visible {
  outline: 2px solid var(--ms-cta-blue, #09538b);
  outline-offset: 1px;
}

/* Submit (MS #09538b) */
.onboarding-cta {
  width: 100%;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  color: #eee;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  margin-top: 4px;
}
.onboarding-cta:disabled {
  opacity: 0.7;
  cursor: default;
}
.ms-error {
  color: var(--ms-error-red, #e53935);
  font-size: 12px;
  margin-top: 4px;
}
/* Disclaimer styles live in OnboardingDisclaimer.vue */
</style>
