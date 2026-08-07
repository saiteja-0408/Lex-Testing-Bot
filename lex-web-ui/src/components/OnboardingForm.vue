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
      >&times;</button>

      <!-- Terms "page navigate": MDES Disclaimer view (gradient header + bordered message) -->
      <div v-if="showTermsViewer" class="disclaimer-view">
        <div class="disclaimer-header">
          <!-- Back button: "‹ botName" — returns to the onboarding form -->
          <button
            type="button"
            class="disclaimer-back"
            aria-label="Back to form"
            @click="closeTermsViewer"
          >
            <svg class="disclaimer-back-icon" viewBox="0 0 24 24" aria-hidden="true">
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
          >&times;</button>
          <h2 class="disclaimer-title">{{ termsTitle }}</h2>
        </div>
        <div class="disclaimer-body">
          <div class="disclaimer-message">
            <p>{{ disclaimerFullText }}</p>
          </div>
        </div>
      </div>

      <div v-else class="onboarding-content">
          <!-- MS banner: magnolia logo + cornflowerblue welcome + bold subtitle -->
          <div class="ms-banner">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              class="ms-logo"
              alt=""
            >
            <div v-else class="ms-logo ms-logo--fallback">
              <v-icon size="64" color="white">local_florist</v-icon>
            </div>

            <h1 id="onboarding-welcome-title" class="onboarding-welcome">
              {{ welcomeTitle }}
            </h1>
            <p class="onboarding-sub">{{ welcomeSubtitle }}</p>
          </div>

          <!-- MS form: static label-above + plain outlined inputs -->
          <form class="ms-form" novalidate @submit.prevent="onSubmit">
            <div class="ms-field">
              <label for="ob-first-name" class="ms-label">{{ firstNameLabel }}</label>
              <input
                id="ob-first-name"
                v-model="firstName"
                class="ms-input"
                type="text"
                autocomplete="given-name"
              >
              <div v-if="errors.firstName" class="ms-error">{{ errors.firstName }}</div>
            </div>

            <div class="ms-field">
              <label for="ob-last-name" class="ms-label">{{ lastNameLabel }}</label>
              <input
                id="ob-last-name"
                v-model="lastName"
                class="ms-input"
                type="text"
                autocomplete="family-name"
              >
              <div v-if="errors.lastName" class="ms-error">{{ errors.lastName }}</div>
            </div>

            <div class="ms-field">
              <label for="ob-email" class="ms-label">{{ emailLabel }}</label>
              <input
                id="ob-email"
                v-model="email"
                class="ms-input"
                type="email"
                autocomplete="email"
              >
            </div>

            <div class="ms-agreement">
              <label class="ms-check">
                <input v-model="termsAccepted" type="checkbox">
                <span>
                  {{ termsBeforeLink }}
                  <a
                    :href="termsUrl"
                    class="onboarding-terms-link"
                    @click.prevent.stop="openTermsViewer"
                  >{{ termsLinkText }}</a>
                  {{ termsAfterLink }}
                </span>
              </label>
              <div v-if="errors.terms" class="ms-error">{{ errors.terms }}</div>
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
export default {
  name: 'onboarding-form',
  emits: ['close', 'complete'],
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      termsAccepted: false,
      submitting: false,
      showTermsViewer: false,
      errors: { firstName: '', lastName: '', terms: '' },
    };
  },
  computed: {
    c() {
      return this.$store.state.config.ui;
    },
    welcomeTitle() {
      return this.c.onboardingWelcomeTitle || 'Welcome!';
    },
    welcomeSubtitle() {
      return this.c.onboardingWelcomeSubtitle || 'Please fill out information below!';
    },
    firstNameLabel() {
      return this.c.onboardingFirstNameLabel || 'First Name';
    },
    lastNameLabel() {
      return this.c.onboardingLastNameLabel || 'Last Name';
    },
    emailLabel() {
      return this.c.onboardingEmailLabel || 'Email (Optional)';
    },
    termsUrl() {
      return this.c.onboardingTermsUrl || '#';
    },
    termsLinkText() {
      return this.c.onboardingTermsLinkText || 'Terms and services';
    },
    termsBeforeLink() {
      return this.c.onboardingTermsBeforeLink
        || 'I have read and agree to the ';
    },
    termsAfterLink() {
      return this.c.onboardingTermsAfterLink
        || ' in regards to the use of personal information in this chat bot.';
    },
    startButtonText() {
      return this.c.onboardingStartButtonText || 'Start Chatting';
    },
    // MS submit button colour (#09538b); config-overridable.
    ctaColor() {
      return this.c.onboardingButtonColor || '#09538b';
    },
    // MS magnolia logo, e.g. onboardingAgentAvatarUrl: "/bot-config/AvatarIcon.png"
    avatarUrl() {
      return this.c.onboardingAgentAvatarUrl || '';
    },
    // Disclaimer ("page navigate") content — matches the MDES disclaimer view.
    botName() {
      return this.c.toolbarTitle || this.c.pageTitle || '';
    },
    termsTitle() {
      return this.c.onboardingTermsTitle || 'Disclaimer';
    },
    disclaimerHeading() {
      return this.c.onboardingDisclaimerHeading || 'Important message';
    },
    disclaimerMessage() {
      return this.c.onboardingDisclaimerMessage
        || 'This virtual assistant may ask for identifying information needed to '
         + 'answer your question(s). We follow strict security guidelines to protect '
         + 'your sensitive information. To further protect your information you should '
         + 'close the chat window and browser when you are finished.';
    },
    // MDES renders heading + body as one light paragraph (heading, blank line, body).
    disclaimerFullText() {
      return `${this.disclaimerHeading}\n\n${this.disclaimerMessage}`;
    },
  },
  methods: {
    openTermsViewer() {
      this.showTermsViewer = true;
    },
    closeTermsViewer() {
      this.showTermsViewer = false;
    },
    onSubmit() {
      this.errors = { firstName: '', lastName: '', terms: '' };
      let valid = true;
      if (!this.firstName.trim()) {
        this.errors.firstName = 'This field is required';
        valid = false;
      }
      if (!this.lastName.trim()) {
        this.errors.lastName = 'This field is required';
        valid = false;
      }
      if (!this.termsAccepted) {
        this.errors.terms = 'You must accept the terms to continue';
        valid = false;
      }
      if (!valid) return;

      this.submitting = true;
      try {
        this.$emit('complete', {
          firstName: this.firstName.trim(),
          lastName: this.lastName.trim(),
          email: this.email.trim(),
          termsAccepted: this.termsAccepted,
        });
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
/* ============================================================
   MS "collect user details" form — matched to the live
   reemployms.mdes.ms.gov "Sippi" onboarding form:
     welcome   : 37px cornflowerblue 700 Open Sans
     subtitle  : bold black 13px
     field     : static label above (#737373 16px) + plain box
                 (1px #ccc, 4px radius, white)
     logo      : navy magnolia AvatarIcon
     form card : white, curved bottom over grey body
     submit    : full width #09538b, radius 4px, 15px 700
   ============================================================ */
.onboarding-wrap {
  position: fixed;
  z-index: 2000;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: stretch;
  background: #eaeef3;
  padding: 0;
  box-sizing: border-box;
  font-family: "freight-sans-pro", "Open Sans", "Segoe UI", system-ui, sans-serif;
}
.onboarding-card {
  position: relative;
  width: 100%;
  height: auto;
  max-height: 100%;
  overflow-y: auto;
  background: #fff !important;
  border-bottom-left-radius: 120px 55px !important;
  border-bottom-right-radius: 120px 55px !important;
  box-shadow: 0 8px 18px rgba(15, 30, 60, 0.10);
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
  color: #737373;
  font-size: 16px;
  margin-bottom: 6px;
}
.ms-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cccccc;
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
  border-color: #09538b;
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
  color: #0192ff;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
}
.onboarding-terms-link:hover {
  text-decoration: underline;
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
  color: #e53935;
  font-size: 12px;
  margin-top: 4px;
}

/* ============================================================
   Disclaimer "page navigate" — matches the MDES disclaimer view:
     header  : linear-gradient(162deg, #09538b 60%, #f1f1e8), white 700 title
     message : bordered box (1px groove #6e6e6e, radius 8px, drop shadow), #737373 Open Sans
   ============================================================ */
.disclaimer-view {
  position: fixed;      /* fill the whole panel (card height is auto) */
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  text-align: left;
  z-index: 3;
}
.disclaimer-header {
  position: relative;
  flex: 0 0 auto;
  height: 30%;               /* MDES: header is 30% of the panel (~226px) */
  min-height: 30%;
  padding: 50px 18px 0 18px;
  color: #fff;
  background-image: linear-gradient(162deg, #09538b 60%, #f1f1e8);
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
  color: #737373;
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
