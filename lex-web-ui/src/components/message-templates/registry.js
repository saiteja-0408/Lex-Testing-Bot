/**
 * Message-template registry — the ONLY place a new template type is wired.
 *
 * To add a template type:
 *   1. Create message-templates/TplYourType.vue  (props: payload; emits: send)
 *   2. Add one line here:  yourtype: TplYourType
 *
 * Unknown types are not rendered as a template — the message falls back to
 * the normal text path (graceful degradation, forward compatible).
 */
import TplButtons from './TplButtons.vue';

export default {
  button: TplButtons,   // Kore "template_type": "button"
  buttons: TplButtons,  // tolerated alias
};
