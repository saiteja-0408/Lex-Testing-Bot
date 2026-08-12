<template>
  <component
    :is="cmp"
    v-if="cmp"
    :payload="template.payload"
    @send="$emit('send', $event)"
  />
</template>

<script>
/**
 * Dispatcher: looks up the template's component in the registry and renders
 * it dynamically. Message.vue stays untouched when new types are added.
 */
import registry from './registry';

export default {
  name: 'message-template',
  props: { template: { type: Object, required: true } },
  emits: ['send'],
  computed: {
    cmp() {
      return registry[this.template.templateType] || null;
    },
  },
};
</script>
