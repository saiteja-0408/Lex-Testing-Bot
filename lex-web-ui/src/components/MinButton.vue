<!-- MinButton intentionally empty.
     The Angular <ion-fab> button is the sole launcher for the chat panel.
     showPanel() / hidePanel() on the IframeLoader API are called directly
     from the Angular FAB click handler in chatbot.service.ts.
     This component must remain registered (LexWeb.vue uses it) but renders nothing. -->
<template>
  <span style="display:none"></span>
</template>

<script>
export default {
  name: 'MinButton',
  props: {
    isUiMinimized: { type: Boolean, default: false },
  },
  emits: ['toggleMinimizeUi'],
};
</script>
