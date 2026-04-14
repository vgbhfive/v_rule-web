<script setup lang="ts">
import type { DataCategoryDetail } from '#/api/data';

import { computed, onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';

import {
  ElButton,
  ElDialog,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

import { getValueTypes } from '#/api/enums';

const props = defineProps<{
  canEdit: boolean;
  data: DataCategoryDetail[];
  dataSourceList: { label: string; value: string }[];
  modelValue: boolean;
  otherData: DataCategoryDetail[];
}>();

const emit = defineEmits([
  'update:modelValue',
  'update:data',
  'update:other-data',
  'confirm',
  'trial',
]);

const { hasAccessByCodes } = useAccess();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const comment = ref('');
const isTrial = ref(false);
const allValueOptions = ref<{ label: string; value: string }[]>([]);
const requestUrl = ref('');
const requestType = ref('');
const requestStatusField = ref('');
const requestStatusCode = ref('');

onMounted(async () => {
  // 阈值类型
  const valueList = await getValueTypes();
  allValueOptions.value = valueList.map((item) => ({
    label: item.name,
    value: item.type,
  }));
});

const handleMount = () => {};

// 关闭
const handleClosed = () => {
  isTrial.value = false;
  visible.value = false;
  comment.value = '';
};

const generateHttpInfo = () => {
  const url: DataCategoryDetail = {
    key: 'requestUrl',
    valueType: 'fixed',
    value: requestUrl.value,
    trialValue: requestUrl.value,
  };
  const type: DataCategoryDetail = {
    key: 'requestType',
    valueType: 'fixed',
    value: requestType.value,
    trialValue: requestType.value,
  };
  const field: DataCategoryDetail = {
    key: 'requestStatusField',
    valueType: 'fixed',
    value: requestStatusField.value,
    trialValue: requestStatusField.value,
  };
  const code: DataCategoryDetail = {
    key: 'requestStatusCode',
    valueType: 'fixed',
    value: requestStatusCode.value,
    trialValue: requestStatusCode.value,
  };
  emit('update:other-data', [url, type, field, code]);
};

// 试算
const handleTrial = () => {
  // 清空其他数据
  emit('update:other-data', []);
  generateHttpInfo();
  emit('trial', comment.value);
  isTrial.value = true;
};

// 提交
const handleConfirm = () => {
  if (!isTrial.value) {
    ElMessage.warning('请先完成试算后再提交');
    return;
  }
  generateHttpInfo();
  emit('confirm', comment.value);
  isTrial.value = false;
};

const addDataSource = () => {
  const newItem: DataCategoryDetail = {
    key: '',
    valueType: 'fixed',
    value: '',
    trialValue: '',
  };
  // 将新数组传回父组件（克隆一份旧数组并加上新项）
  emit('update:data', [...props.data, newItem]);
};

const removeDataSource = (index: number) => {
  emit(
    'update:data',
    props.data.filter((_, i) => i !== index),
  );
};
</script>

<template>
  <ElDialog
    v-model="visible"
    v-if="visible"
    title="评分卡数据源分类"
    width="80%"
    append-to-body
    @closed="handleClosed"
    @vue:mounted="handleMount"
  >
    <!-- 评分卡 -->
    <div>dddd</div>

    <!-- 数据源 -->
    <div class="data-source-container" style="margin-top: 20px">
      <div class="items-left text-medium mb-3 flex">
        <span style="font-size: 16px">依赖数据源</span>
      </div>

      <div
        v-for="(item, index) in props.data"
        :key="index"
        class="data-row mb-3 flex items-center gap-3"
      >
        <div class="column-key">
          <ElFormItem :prop="`data.${index}.key`" class="no-margin">
            <ElInput
              v-model="item.key"
              placeholder="字段名"
              :disabled="props.canEdit"
            />
          </ElFormItem>
        </div>

        <div class="column-type">
          <ElFormItem :prop="`data.${index}.valueType`" class="no-margin">
            <ElSelect
              v-model="item.valueType"
              @change="item.value = ''"
              placeholder="选择类型"
              :disabled="props.canEdit"
            >
              <ElOption
                v-for="type in allValueOptions"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </ElSelect>
          </ElFormItem>
        </div>

        <div class="column-value">
          <ElFormItem :prop="`data.${index}.value`" class="no-margin">
            <ElInput
              v-if="item.valueType === 'fixed'"
              v-model="item.value"
              placeholder="固定值"
              :disabled="props.canEdit"
            />
            <ElSelect
              v-else-if="item.valueType === 'dataSource'"
              v-model="item.value"
              placeholder="数据源"
              :disabled="props.canEdit"
            >
              <ElOption
                v-for="option in props.dataSourceList"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
            <ElInput v-else disabled placeholder="值内容" />
          </ElFormItem>
        </div>

        <div class="column-trial">
          <ElFormItem :prop="`data.${index}.trialValue`" class="no-margin">
            <ElInput
              v-model="item.trialValue"
              placeholder="试算值"
              :disabled="props.canEdit"
            />
          </ElFormItem>
        </div>

        <div class="column-action" v-if="!props.canEdit">
          <ElButton type="danger" link @click="removeDataSource(index)">
            删除
          </ElButton>
        </div>
      </div>

      <div class="mt-4" v-if="!props.canEdit">
        <ElButton type="primary" plain @click="addDataSource">
          + 添加
        </ElButton>
      </div>
    </div>

    <!-- 操作 -->
    <template #footer v-if="!props.canEdit">
      <div class="flex justify-end">
        <ElButton
          type="warning"
          @click="handleTrial"
          v-if="hasAccessByCodes(['data_category_manage_trial'])"
        >
          试算
        </ElButton>
        <ElButton type="primary" @click="handleConfirm"> 提交 </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
/* 核心：统一每一列的宽度，确保垂直对齐 */
.column-key {
  width: 180px;
}

.column-type {
  width: 140px;
}

.column-value {
  width: 200px;
}

.column-trial {
  width: 180px;
}

.column-action {
  width: 60px;
}

/* 移除 FormItem 默认的 margin-bottom，防止行间距过大 */
.no-margin {
  margin-bottom: 0 !important;
}

/* 保证行内元素垂直居中 */
.data-row {
  display: flex;
  align-items: center;
}
</style>
