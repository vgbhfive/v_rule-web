<script setup lang="ts">
import type { DataSourceFunction } from '#/api/data';

import { ref, watch, onMounted } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

import { getFieldTypes } from '#/api/enums';
import { dataSourceTrial } from '#/api/data/dataSource';

const fieldTypeOptions = ref<{ label: string; value: string }[]>([]);

onMounted(async () => {
  // 数据源类型
  const fieldTypes = await getFieldTypes();
  fieldTypeOptions.value = fieldTypes.map((item) => ({
    label: item.name,
    value: item.type,
  }));
});

const props = defineProps<{
  canEdit: boolean;
  data: DataSourceFunction | null;
  visible: boolean;
  fieldFuncTypes: { label: string; value: string }[];
}>();

const emit = defineEmits(['update:visible', 'submit']);

// 1. 创建一个本地响应式副本，避免直接修改 prop
const formModel = ref<DataSourceFunction>({
  type: props.data?.type || '',
  func: '',
  params: '',
  trial: '',
});

// 2. 当弹窗打开时，深拷贝数据到本地
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.data) {
        formModel.value = JSON.parse(JSON.stringify(props.data));
      } else {
        // 如果是新增，重置表单
        formModel.value = {
          type: props.data?.type || '',
          func: '',
          params: '',
          trial: '',
        };
      }
    }
  },
);

// 提交
const handleConfirm = () => {
  emit('submit', formModel.value);
  emit('update:visible', false);
};

// 试算
const handleTrial = async () => {
  const res = await dataSourceTrial(formModel.value);
  ElMessage.success(res);
};
</script>

<template>
  <ElDialog
    :model-value="visible"
    @update:model-value="(val) => emit('update:visible', val)"
    title="数据源函数"
    width="50%"
    append-to-body
  >
    <ElForm :model="formModel" label-width="100px" :disabled="props.canEdit">
      <ElFormItem label="数据源类型">
        <ElSelect
          v-model="formModel.type"
          placeholder="请选择类型"
          class="w-full"
          disabled
        >
          <ElOption v-for="item in fieldTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="函数名称">
        <ElSelect
          v-model="formModel.func"
          placeholder="请选择函数名称"
          class="w-full"
        >
          <ElOption v-for="item in props.fieldFuncTypes" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="函数参数">
        <ElInput v-model="formModel.params" placeholder="请输入参数" />
      </ElFormItem>

      <ElFormItem label="试算值">
        <ElInput v-model="formModel.trial" placeholder="请输入试算值" />
      </ElFormItem>
    </ElForm>

    <template #footer v-if="!props.canEdit">
      <div class="flex justify-end gap-2">
        <ElButton @click="emit('update:visible', false)">取消</ElButton>
        <ElButton type="primary" @click="handleTrial">试算</ElButton>
        <ElButton type="primary" @click="handleConfirm">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.w-full {
  width: 100%;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>
