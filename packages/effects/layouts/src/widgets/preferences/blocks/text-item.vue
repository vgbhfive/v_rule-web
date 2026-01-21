<script setup lang="ts">
import { useSlots } from 'vue';

import { CircleHelp } from '@vben/icons';

import { VbenTooltip } from '@vben-core/shadcn-ui';

defineOptions({
  name: 'PreferenceTextItem',
});

withDefaults(
  defineProps<{
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const textValue = defineModel<string>();

const slots = useSlots();
</script>

<template>
  <div
    :class="{
      'pointer-events-none opacity-50': disabled,
    }"
    class="my-1 flex w-full items-center justify-between rounded-md px-2 py-1"
  >
    <span class="flex items-center text-sm">
      <slot></slot>

      <VbenTooltip v-if="slots.tip" side="bottom">
        <template #trigger>
          <CircleHelp class="ml-1 size-3 cursor-help" />
        </template>
        <slot name="tip"></slot>
      </VbenTooltip>
    </span>
    <div class="relative">
      <span class="text-foreground/80 text-sm">{{ textValue }}</span>
    </div>
  </div>
</template>
