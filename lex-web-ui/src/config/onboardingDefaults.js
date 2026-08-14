/**
 * Default copy + colors for the MDES onboarding flow.
 *
 * What it does:      single source of truth for every fallback value used
 *                    when the loader config omits a `ui.onboarding*` key.
 * What it does NOT:  read the store, the DOM, or the network — plain
 *                    frozen data and one pure lookup helper only.
 * Called by:         OnboardingForm.vue (and unit tests). Mirrors the role
 *                    kore-config.js plays in the Kore reference UI.
 */

export const ONBOARDING_DEFAULTS = Object.freeze({
  onboardingWelcomeTitle: 'Welcome!',
  onboardingWelcomeSubtitle: 'Please fill out information below!',
  onboardingFirstNameLabel: 'First Name',
  onboardingLastNameLabel: 'Last Name',
  onboardingEmailLabel: 'Email (Optional)',
  onboardingTermsUrl: '#',
  onboardingTermsLinkText: 'Terms and services',
  onboardingTermsBeforeLink: 'I have read and agree to the ',
  onboardingTermsAfterLink:
    ' in regards to the use of personal information in this chat bot.',
  onboardingStartButtonText: 'Start Chatting',
  // MS submit button colour (Kore .submit-form background)
  onboardingButtonColor: '#09538b',
  onboardingAgentAvatarUrl: '',
  onboardingTermsTitle: 'Disclaimer',
  onboardingDisclaimerHeading: 'Important message',
  onboardingDisclaimerMessage:
    'This virtual assistant may ask for identifying information needed to '
    + 'answer your question(s). We follow strict security guidelines to protect '
    + 'your sensitive information. To further protect your information you should '
    + 'close the chat window and browser when you are finished.',
});

/**
 * Resolve an onboarding config value: the ui config wins, else the default.
 * Pure — safe to unit test without a browser.
 *
 * @param {Object} uiConfig  the store's config.ui object (may be undefined)
 * @param {string} key       one of the ONBOARDING_DEFAULTS keys
 * @returns {string}
 */
export function onboardingValue(uiConfig, key) {
  const cfg = uiConfig || {};
  return cfg[key] || ONBOARDING_DEFAULTS[key] || '';
}
