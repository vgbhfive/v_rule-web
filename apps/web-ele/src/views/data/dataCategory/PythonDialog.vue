<script setup lang="ts">
import type { DataCategoryDetail } from '#/api/data';

import { computed, onMounted, ref, shallowRef } from 'vue';

import { useAccess } from '@vben/access';

import { VueMonacoEditor } from '@guolao/vue-monaco-editor';
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

// 1. 定义代码内容（支持双向绑定）
const defaultCode = `    # Python 示例代码
    tmp = res['a']
    res['b'] = 1`;
const pythonCode = ref(defaultCode);

// 2. 编辑器配置项
const editorOptions = ref({
  automaticLayout: true, // 自动适应父容器大小
  minimap: { enabled: false }, // 关闭右侧代码小地图（如果代码量不大建议关闭，看起来更清爽）
  fontSize: 14, // 字体大小
  tabSize: 4, // Python 推荐 4 个空格缩进
  insertSpaces: true, // 按 Tab 键插入空格
  wordWrap: 'on', // 自动换行
  lineNumbers: 'on', // 显示行号
  scrollBeyondLastLine: false, // 取消滚动超过最后一行
  readOnly: props.canEdit,
});

// 3. 保存编辑器实例的引用 (推荐使用 shallowRef 避免 Vue 深度代理带来的性能问题)
const editorRef = shallowRef(null);

onMounted(async () => {
  // 阈值类型
  const valueList = await getValueTypes();
  allValueOptions.value = valueList.map((item) => ({
    label: item.name,
    value: item.type,
  }));
});

// 4. 编辑器加载完成后的回调
const handleEditorMount = (editor: any) => {
  editorRef.value = editor;
  editor.focus();

  props.otherData.forEach((item) => {
    if (item.key === 'code') {
      pythonCode.value = item.value;
    }
  });
};

// 5. 获取代码供外部或提交使用
const getEditorCode = () => {
  const currentCode = pythonCode.value;
  const newItem: DataCategoryDetail = {
    key: 'code',
    valueType: 'fixed',
    value: currentCode,
    trialValue: currentCode,
  };

  // 将新数组传回父组件
  emit('update:other-data', [newItem]);
};

// 编辑器内容改变时触发
const handleEditorCodeChange = () => {
  isTrial.value = false;
};

// 关闭
const handleClosed = () => {
  isTrial.value = false;
  visible.value = false;
  comment.value = '';
  pythonCode.value = defaultCode;
};

// 试算
const handleTrial = () => {
  // 清空其他数据
  emit('update:other-data', []);
  getEditorCode();
  emit('trial', comment.value);
  isTrial.value = true;
};

// 提交
const handleConfirm = () => {
  if (!isTrial.value) {
    ElMessage.warning('请先完成试算后再提交');
    return;
  }
  getEditorCode();
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
    title="Python 数据源分类"
    width="80%"
    append-to-body
    @closed="handleClosed"
  >
    <div class="editor-container">
      <div class="editor-wrapper">
        <VueMonacoEditor
          v-model:value="pythonCode"
          theme="vs-dark"
          language="python"
          :options="editorOptions"
          @mount="handleEditorMount"
          @change="handleEditorCodeChange"
        />
      </div>
    </div>

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
.editor-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: bold;
  color: #606266;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.editor-wrapper {
  width: 100%;
  height: 400px; /* 必须给编辑器容器指定高度 */
}

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
