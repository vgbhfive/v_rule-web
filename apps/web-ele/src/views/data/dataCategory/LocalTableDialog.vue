<script setup lang="ts">
import type { DataCategoryDetail } from '#/api/data';

import { computed, onMounted, ref } from 'vue';

import {
  ElButton,
  ElDialog,
  ElFormItem,
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

const generateLocalTableInfo = () => {
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

// 提交
const handleConfirm = () => {
  generateLocalTableInfo();
  emit('confirm', comment.value);
  isTrial.value = false;
};

// 表单数据结构
const formData = reactive({
  tableName: '',
  indexName: '',
  fields: [''], // 初始默认一个空字段
});

// 添加字段逻辑
const addField = () => {
  formData.fields.push('');
};

// 删除字段逻辑
const removeField = (index) => {
  formData.fields.splice(index, 1);
};
</script>

<template>
  <ElDialog
    v-model="visible"
    v-if="visible"
    title="本地表"
    width="80%"
    append-to-body
    @closed="handleClosed"
    @vue:mounted="handleMount"
  >
    <div>
      <el-form :model="formData" label-width="80px" label-position="left">
        <ElFormItem label="数据表">
          <ElSelect
            v-model="formData.tableName"
            placeholder="请选择数据表"
            class="w-full"
          >
            <ElOption label="用户表 (users)" value="users" />
            <ElOption label="订单表 (orders)" value="orders" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="索引">
          <ElSelect
            v-model="formData.indexName"
            placeholder="请选择索引字段"
            class="w-full"
          >
            <ElOption label="主键索引" value="primary" />
            <ElOption label="唯一索引" value="unique" />
          </ElSelect>
        </ElFormItem>

        <div
          v-for="(field, index) in formData.fields"
          :key="index"
          class="field-row"
        >
          <ElFormItem :label="index === 0 ? '字段' : ''">
            <div class="flex w-full gap-2">
              <ElSelect
                v-model="formData.fields[index]"
                placeholder="请选择查询字段"
                class="flex-1"
              >
                <ElOption label="ID" value="id" />
                <ElOption label="创建时间" value="created_at" />
                <ElOption label="用户名" value="username" />
              </ElSelect>
              <ElButton
                v-if="formData.fields.length > 1"
                type="danger"
                link
                @click="removeField(index)"
              >
                删除
              </ElButton>
            </div>
          </ElFormItem>
        </div>

        <ElFormItem>
          <ElButton @click="addField" class="add-btn">
            <el-icon class="mr-1"><Plus /></el-icon>
            添加字段
          </ElButton>
        </ElFormItem>
      </el-form>
    </div>

    <template #footer v-if="!props.canEdit">
      <div class="flex justify-end">
        <ElButton type="primary" @click="handleConfirm"> 提交 </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.w-full {
  width: 100%;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.gap-2 {
  gap: 0.5rem;
}

.mr-1 {
  margin-right: 4px;
}

/* 匹配图片中的按钮样式 */
.add-btn {
  padding: 8px 16px;
  color: #303133;
  border: 1px solid #303133;
  border-radius: 4px;
}

/* 调整字段行间距，使其紧凑 */
.field-row :deep(.el-form-item) {
  margin-bottom: 12px;
}
</style>
