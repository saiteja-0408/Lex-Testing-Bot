<!-- MinButton intentionally empty.
     The Angular <ion-fab> button is the sole launcher for the chat panel.
     showPanel() / hidePanel() on the IframeLoader API are called directly
     from the Angular FAB click handler in chatbot.service.ts.
     This component must remain registered (LexWeb.vue uses it) but renders nothing. -->
<template>
  <span style="display:none"></span>
</template>

<script>
/*
Copyright 2017-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/
export default {
  name: 'MinButton',
  props: {
    isUiMinimized: { type: Boolean, default: false },
  },
  emits: ['toggleMinimizeUi'],
  computed: {
    minButtonContent() {
      const n = this.$store.state.config.ui.minButtonContent.length;
      return (n > 1) ? this.$store.state.config.ui.minButtonContent : false;
    },
    // MDES gold launcher colour. Priority: config ui.minButtonColor →
    // theme token --ms-launcher-gold → literal fallback (#FDC245).
    minButtonColor() {
      return this.$store.state.config.ui.minButtonColor
        || 'var(--ms-launcher-gold, #FDC245)';
    },
  },
  methods: {
    toggleMinimize() {
      if (this.$store.state.isRunningEmbedded) {
        this.$emit('toggleMinimizeUi');
      }
    },
  },
};
</script>
<style>
  .min-button-content {
    border-radius: 60px;
  }
  .min-button-container,
  .min-button-container .v-row,
  .min-button-container .v-col {
    background: transparent !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  /* MDES gold FAB launcher: 56px circle, MD elevation, white outline icon.
     Double class (.min-button.min-button-fab) so the box-shadow beats
     Vuetify's .elevation-0 (same 1-class specificity, also !important). */
  .min-button.min-button-fab {
    width: 56px !important;
    height: 56px !important;
    min-width: 56px !important;
    padding: 0 !important;
    border-radius: 50% !important;
    color: #fff !important;
    box-shadow:
      0 3px 5px -1px rgba(0, 0, 0, 0.2),
      0 6px 10px 0 rgba(0, 0, 0, 0.14),
      0 1px 18px 0 rgba(0, 0, 0, 0.12) !important;
  }
  .min-button.min-button-content {
    color: #fff !important;
    box-shadow:
      0 3px 5px -1px rgba(0, 0, 0, 0.2),
      0 6px 10px 0 rgba(0, 0, 0, 0.14),
      0 1px 18px 0 rgba(0, 0, 0, 0.12) !important;
  }
  .min-button-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .min-button-icon svg {
    width: 26px;
    height: 26px;
    display: block;
  }
  /* Ionicons outline style: no fill, white stroke */
  .min-button-icon svg path {
    fill: none;
    stroke: #fff;
    stroke-width: 32px;
  }
  .min-button-content .min-button-icon {
    margin-right: 8px;
  }
  .min-button-content .min-button-icon svg {
    width: 22px;
    height: 22px;
  }
</style>
