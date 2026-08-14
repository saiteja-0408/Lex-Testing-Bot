<template>
  <v-container
    fluid
    class="pa-0 min-button-container"
  >
    <v-row justify="end">
      <v-col cols="auto">
        <v-fab-transition>
          <v-btn
            v-if="minButtonContent"
            v-show="isUiMinimized"
            rounded="xl"
            size="x-large"
            elevation="0"
            aria-label="show chat window"
            class="min-button min-button-content"
            :style="{ background: minButtonColor }"
            @click.stop="toggleMinimize"
          >
            <span class="min-button-icon">
              <svg
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M431 320.6c-1-3.6 1.2-8.6 3.3-12.2a33.68 33.68 0 012.1-3.1A162 162 0 00464 215c.3-92.2-77.5-167-173.7-167-83.9 0-153.9 57.1-170.3 132.9a160.7 160.7 0 00-3.7 34.2c0 92.3 74.8 169.1 171 169.1 15.3 0 35.9-4.6 47.2-7.7s22.5-7.2 25.4-8.3a26.44 26.44 0 019.3-1.7 26 26 0 0110.1 2l56.7 20.1a13.52 13.52 0 003.9 1 8 8 0 008-8 12.85 12.85 0 00-.5-2.7z"
                  stroke-linecap="round"
                  stroke-miterlimit="10"
                />
                <path
                  d="M66.46 232a146.23 146.23 0 006.39 152.67c2.31 3.49 3.61 6.19 3.21 8s-11.93 61.87-11.93 61.87a8 8 0 002.71 7.68A8.17 8.17 0 0072 464a7.26 7.26 0 002.91-.6l56.21-22a15.7 15.7 0 0112 .2c18.94 7.38 39.88 12 60.83 12A159.21 159.21 0 00284 432.11"
                  stroke-linecap="round"
                  stroke-miterlimit="10"
                />
              </svg>
            </span>
            <span class="min-button-label">{{ minButtonContent }}</span>
          </v-btn>
          <!-- icon-only launcher: matches the MDES gold FAB w/ chatbubbles-outline -->
          <v-btn
            v-else
            v-show="isUiMinimized"
            size="x-large"
            elevation="0"
            aria-label="show chat window"
            class="min-button min-button-fab"
            :style="{ background: minButtonColor }"
            @click.stop="toggleMinimize"
          >
            <span class="min-button-icon">
              <svg
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M431 320.6c-1-3.6 1.2-8.6 3.3-12.2a33.68 33.68 0 012.1-3.1A162 162 0 00464 215c.3-92.2-77.5-167-173.7-167-83.9 0-153.9 57.1-170.3 132.9a160.7 160.7 0 00-3.7 34.2c0 92.3 74.8 169.1 171 169.1 15.3 0 35.9-4.6 47.2-7.7s22.5-7.2 25.4-8.3a26.44 26.44 0 019.3-1.7 26 26 0 0110.1 2l56.7 20.1a13.52 13.52 0 003.9 1 8 8 0 008-8 12.85 12.85 0 00-.5-2.7z"
                  stroke-linecap="round"
                  stroke-miterlimit="10"
                />
                <path
                  d="M66.46 232a146.23 146.23 0 006.39 152.67c2.31 3.49 3.61 6.19 3.21 8s-11.93 61.87-11.93 61.87a8 8 0 002.71 7.68A8.17 8.17 0 0072 464a7.26 7.26 0 002.91-.6l56.21-22a15.7 15.7 0 0112 .2c18.94 7.38 39.88 12 60.83 12A159.21 159.21 0 00284 432.11"
                  stroke-linecap="round"
                  stroke-miterlimit="10"
                />
              </svg>
            </span>
          </v-btn>
        </v-fab-transition>
      </v-col>
    </v-row>
  </v-container>
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
