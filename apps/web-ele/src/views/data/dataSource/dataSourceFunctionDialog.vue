<script setup lang="ts">
import { ref, watch } from 'vue';
import type { DataSourceFunction } from '#/api/data';
import { 
  ElDialog, ElButton, ElForm, ElFormItem, 
  ElSelect, ElOption, ElInput, ElSpace, ElDivider 
} from 'element-plus';

const props = defineProps<{
  visible: boolean;
  data: DataSourceFunction | null;
  canEdit: boolean; // 假设 true 为只能看，false 为可以编辑（与你 template 逻辑一致）
}>();

const emit = defineEmits(['update:visible', 'submit']);

// 1. 创建一个本地响应式副本，避免直接修改 prop
const formModel = ref<DataSourceFunction>({
  functionType: '',
  functionName: '',
  functionParams: '',
});

// 2. 当弹窗打开时，深拷贝数据到本地
watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.data) {
      formModel.value = JSON.parse(JSON.stringify(props.data));
    } else {
      // 如果是新增，重置表单
      formModel.value = { functionType: '', functionName: '', functionParams: '' };
    }
  }
});

const handleConfirm = () => {
  // 提交本地副本数据
  emit('submit', formModel.value);
  emit('update:visible', false);
};
</script>

<template>
  <ElDialog 
    :model-value="visible" 
    @update:model-value="val => emit('update:visible', val)"
    title="数据源函数"
    width="50%"
    append-to-body
  >
    <ElForm :model="formModel" label-width="100px" :disabled="props.canEdit">
      <ElFormItem label="数据源类型">
        <ElSelect v-model="formModel.type" placeholder="请选择类型" class="w-full">
          <ElOption label="数据转换" value="transform" />
          <ElOption label="逻辑计算" value="logic" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="函数名称">
        <ElSelect v-model="formModel.name" placeholder="请选择函数名称" class="w-full">
          <ElOption label="数据转换" value="transform" />
          <ElOption label="逻辑计算" value="logic" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="函数参数">
        <ElInput v-model="formModel.params" placeholder="请输入参数" />
      </ElFormItem>

      <ElFormItem label="函数试算值">
        <ElInput v-model="formModel.trial" placeholder="请输入试算值" />
      </ElFormItem>
    </ElForm>

    <template #footer v-if="!props.canEdit">
      <div class="flex justify-end gap-2">
        <ElButton @click="emit('update:visible', false)">取消</ElButton>
        <ElButton type="primary" @click="handleConfirm"> 提交 </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.w-full { width: 100%; }
.mb-4 { margin-bottom: 1rem; }
</style>
