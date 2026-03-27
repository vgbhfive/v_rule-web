<script setup lang="ts">
import type { rollbackVersion } from '#/api/deploy';

import { computed, ref } from 'vue';

import { ElButton, ElDialog, ElOption, ElSelect } from 'element-plus';

const props = defineProps<{
  data: rollbackVersion[];
  loading: boolean;
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'confirm', 'update:version']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const comment = ref('');
const activeNames = ref<string[]>([]);
const version = ref('');

const handleConfirm = () => {
  emit('update:version', version.value);
  emit('confirm', comment.value);
};

const handleClosed = () => {
  comment.value = '';
  activeNames.value = [];
  version.value = '';
};
</script>

<template>
  <ElDialog
    v-model="visible"
    title="回滚版本列表"
    width="30%"
    append-to-body
    @closed="handleClosed"
  >
    <div v-if="loading" class="flex items-center justify-center">
      <ElSelect v-model="version" placeholder="选择版本">
        <ElOption
          v-for="option in props.data"
          :key="option.version"
          :label="`${option.version} - ${option.deployDesc}`"
          :value="option.version"
        />
      </ElSelect>
    </div>

    <template #footer>
      <div class="flex flex-col gap-4">
        <div class="flex justify-end">
          <ElButton @click="visible = false">关闭</ElButton>
          <ElButton type="primary" @click="handleConfirm"> 提交 </ElButton>
        </div>
      </div>
    </template>
  </ElDialog>
</template>
