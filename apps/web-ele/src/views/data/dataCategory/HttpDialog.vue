<script setup lang="ts">
import type { DataCategoryDetail } from '#/api/data';

import { computed, onMounted, ref } from 'vue';

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

const handleMount = () => {
  props.otherData.forEach((item) => {
    switch (item.key) {
      case 'requestStatusCode': {
        requestStatusCode.value = item.value;
        break;
      }
      case 'requestStatusField': {
        requestStatusField.value = item.value;
        break;
      }
      case 'requestType': {
        requestType.value = item.value;
        break;
      }
      case 'requestUrl': {
        requestUrl.value = item.value;
        break;
      }
      // No default
    }
  });
};

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
    title="HTTP 数据源分类"
    width="80%"
    append-to-body
    @closed="handleClosed"
    @vue:mounted="handleMount"
  >
    <div class="data-source-container rounded-lg bg-white p-4">
      <div class="data-row mb-3 flex items-center gap-3">
        <span class="font-medium" style="font-size: 16px">URL</span>
      </div>
      <div style="width: 500px; margin-bottom: 20px">
        <ElInput
          v-model="requestUrl"
          placeholder="请输入接口地址"
          :disabled="props.canEdit"
        />
      </div>

      <div class="data-row mb-3 flex items-center gap-3">
        <span class="font-medium" style="font-size: 16px">请求方式</span>
      </div>
      <div class="column-type" style="width: 220px; margin-bottom: 20px">
        <ElSelect
          v-model="requestType"
          placeholder="选择类型"
          :disabled="props.canEdit"
        >
          <ElOption label="GET" value="GET" />
          <ElOption label="POST" value="POST" />
        </ElSelect>
      </div>

      <div class="items-left text-medium mb-3 flex">
        <span class="font-medium" style="font-size: 16px">请求参数</span>
      </div>

      <div
        v-for="(item, index) in props.data"
        :key="index"
        class="data-row mb-3 flex items-center gap-3"
      >
        <div class="column-key" style="width: 180px">
          <ElFormItem :prop="`data.${index}.key`" class="no-margin">
            <ElInput
              v-model="item.key"
              placeholder="字段名"
              :disabled="props.canEdit"
            />
          </ElFormItem>
        </div>

        <div class="column-type" style="width: 150px">
          <ElFormItem :prop="`data.${index}.valueType`" class="no-margin">
            <ElSelect
              v-model="item.valueType"
              @change="item.value = ''"
              placeholder="参数类型"
              :disabled="props.canEdit"
            >
              <ElOption label="固定值" value="fixed" />
              <ElOption label="数据源" value="dataSource" />
            </ElSelect>
          </ElFormItem>
        </div>

        <div class="column-value" style="width: 180px">
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
              placeholder="选择数据源"
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

        <div class="column-trial" style="width: 150px">
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

      <div class="mt-2" v-if="!props.canEdit" style="margin-bottom: 30px">
        <ElButton type="primary" plain @click="addDataSource">
          + 添加
        </ElButton>
      </div>

      <div class="data-row mb-3 flex items-center gap-3">
        <span class="font-medium" style="font-size: 16px">响应检查</span>
      </div>

      <div
        class="flex items-center gap-6 rounded border border-dashed border-gray-200 bg-gray-50 p-4"
        style="width: fit-content"
      >
        <div class="flex items-center gap-3">
          <span style="width: 40px; font-size: 14px; color: #666">字段</span>
          <div style="width: 200px">
            <ElInput
              v-model="requestStatusField"
              placeholder="例如: code"
              :disabled="props.canEdit"
            />
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span style="width: 20px; font-size: 14px; color: #666">值</span>
          <div style="width: 120px">
            <ElInput
              v-model="requestStatusCode"
              placeholder="200"
              :disabled="props.canEdit"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer v-if="!props.canEdit">
      <div class="flex justify-end">
        <ElButton type="warning" @click="handleTrial"> 试算 </ElButton>
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

.data-source-container :deep(.el-form-item__content) {
  margin-left: 0 !important;
}
</style>
