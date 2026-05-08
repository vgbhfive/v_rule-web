<script setup lang="ts">
import type { DataCategoryDetail } from '#/api/data';

import { computed, onMounted, ref } from 'vue';

import {
  ElButton,
  ElCol,
  ElDialog,
  ElForm,
  ElFormItem,
  ElOption,
  ElRow,
  ElSelect,
} from 'element-plus';

import { dataCategoryLocalTableColumns } from '#/api/data';
import { getValueTypes } from '#/api/enums';

const props = defineProps<{
  canEdit: boolean;
  data: DataCategoryDetail[];
  dataSourceList: { label: string; value: string }[];
  lineTableList: { label: string; value: string }[];
  modelValue: boolean;
  nowLineNo: string;
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
      case 'index': {
        formData.value.index = item.value;
        break;
      }
      case 'indexDataSource': {
        formData.value.dataSource = item.value;
        break;
      }
      case 'tableName': {
        formData.value.tableName = item.value;
        break;
      }
    }
  });
  const fields: string[] = [];
  props.data.forEach((item) => {
    fields.push(item.key);
  });
  formData.value.fields = fields;
  lineNo.value = props.nowLineNo;
  if (lineNo.value && formData.value.tableName) {
    updateIndexFields();
  }
};

// 关闭
const handleClosed = () => {
  isTrial.value = false;
  visible.value = false;
  comment.value = '';
};

const generateLocalTableInfo = () => {
  const url: DataCategoryDetail = {
    key: 'tableName',
    valueType: 'fixed',
    value: formData.value.tableName,
    trialValue: formData.value.tableName,
  };
  const type: DataCategoryDetail = {
    key: 'index',
    valueType: 'fixed',
    value: formData.value.index,
    trialValue: formData.value.index,
  };
  const field: DataCategoryDetail = {
    key: 'indexDataSource',
    valueType: 'dataSource',
    value: formData.value.dataSource,
    trialValue: formData.value.dataSource,
  };
  const fieldList: DataCategoryDetail[] = formData.value.fields.map(
    (fieldValue) => {
      return {
        key: fieldValue,
        valueType: 'fixed',
        value: fieldValue,
        trialValue: fieldValue,
      };
    },
  );
  emit('update:other-data', [url, type, field, ...fieldList]);
};

// 提交
const handleConfirm = () => {
  // 清空其他数据
  emit('update:other-data', []);
  emit('update:data', []);
  generateLocalTableInfo();
  emit('confirm', comment.value);
  isTrial.value = false;
};

// 表单数据结构
const formData = ref({
  tableName: '',
  index: '',
  dataSource: '',
  fields: [''], // 初始默认一个空字段
});
const lineNo = ref('');
const fieldList = ref<{ label: string; value: string }[]>([]);

// 添加字段逻辑
const addField = () => {
  formData.value.fields.push('');
};

// 删除字段逻辑
const removeField = (index) => {
  formData.value.fields.splice(index, 1);
};

// 更新索引字段和查询字段
const updateIndexFields = async () => {
  const fields = await dataCategoryLocalTableColumns({
    lineNo: lineNo.value,
    tableName: formData.value.tableName,
  });
  fieldList.value = fields.map((item) => ({
    label: item.columnName,
    value: item.columnName,
  }));
};
</script>

<template>
  <ElDialog
    v-model="visible"
    v-if="visible"
    title="本地表数据源分类"
    width="80%"
    append-to-body
    @closed="handleClosed"
    @vue:mounted="handleMount"
  >
    <div>
      <ElForm :model="formData" label-width="80px" label-position="left">
        <ElFormItem label="数据表">
          <ElSelect
            v-model="formData.tableName"
            placeholder="请选择数据表"
            @change="updateIndexFields"
            :disabled="props.canEdit"
          >
            <ElOption
              v-for="source in lineTableList"
              :key="source.value"
              :label="source.label"
              :value="source.value"
            />
          </ElSelect>
        </ElFormItem>

        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="索引">
              <ElSelect
                v-model="formData.index"
                placeholder="请选择索引字段"
                :disabled="props.canEdit"
              >
                <ElOption
                  v-for="source in fieldList"
                  :key="source.value"
                  :label="source.label"
                  :value="source.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="对应数据源" label-width="100px">
              <ElSelect
                v-model="formData.dataSource"
                placeholder="请选择数据源"
                :disabled="props.canEdit"
              >
                <ElOption
                  v-for="source in dataSourceList"
                  :key="source.value"
                  :label="source.label"
                  :value="source.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <div
          v-for="(field, index) in formData.fields"
          :key="index"
          class="field-item"
        >
          <ElFormItem :label="index === 0 ? '字段' : ''">
            <div class="field-row-content">
              <ElSelect
                v-model="formData.fields[index]"
                placeholder="请选择字段"
                class="field-select"
                :disabled="props.canEdit"
              >
                <ElOption
                  v-for="source in fieldList"
                  :key="source.value"
                  :label="source.label"
                  :value="source.value"
                />
              </ElSelect>
              <ElButton
                v-if="formData.fields.length > 0"
                type="danger"
                @click="removeField(index)"
                :disabled="props.canEdit"
              >
                删除
              </ElButton>
            </div>
          </ElFormItem>
        </div>

        <ElFormItem>
          <ElButton @click="addField" type="primary" :disabled="props.canEdit">
            + 添加字段
          </ElButton>
        </ElFormItem>
      </ElForm>
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

.field-select {
  flex: 1;
  width: 40%;
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

/* 调整字段行间距，使其紧凑 */
.field-row :deep(.el-form-item) {
  margin-bottom: 12px;
}

/* 1. 基础布局：删除按钮紧跟选择框 */
.field-row-content {
  display: flex;
  gap: 12px; /* 间距 */
  align-items: center;
  width: 100%;
}
</style>
