<script lang="ts" setup>
import type { RuleTreeDetailNode } from '#/api/rule/ruleTree';

import { computed } from 'vue';

import { ElButton, ElDialog, ElMessage } from 'element-plus';

import RuleNode from './RuleNode.vue';

const props = defineProps<{
  canEdit: boolean;
  combineTypeOptions: { label: string; value: string }[];
  conditionTypeOptions: { label: string; value: string }[];
  localNodes: RuleTreeDetailNode[];
  modelValue: boolean;
  ruleOptions: { label: string; value: string }[];
  ruleSetOptions: { label: string; value: string }[];
  ruleTreeOptions: { label: string; value: string }[];
  ruleTypeOptions: { label: string; value: string }[];
}>();

const emit = defineEmits<{
  'update:localNodes': [val: RuleTreeDetailNode[]];
  'update:modelValue': [val: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const rootNode = computed(() => props.localNodes.find((n) => n.preIndex === 0));

// 添加节点
function handleAddNode(preIndex: number, type: number) {
  const newIndex =
    props.localNodes.length > 0
      ? Math.max(...props.localNodes.map((n) => n.index)) + 1
      : 1;
  props.localNodes.push({
    index: newIndex,
    preIndex,
    nodeType: type === 0 ? 0 : 1,
    combine: type === 0 ? 'AND' : '',
    ruleType: type === 0 ? '' : 'rule',
    ruleNo: '',
  });
}

// 删除节点
function handleRemoveNode(index: number) {
  const idsToRemove = new Set<number>([index]);
  const findChildren = (pId: number) => {
    for (const n of props.localNodes) {
      if (n.preIndex === pId) {
        idsToRemove.add(n.index);
        findChildren(n.index);
      }
    }
  };
  findChildren(index);
  emit(
    'update:localNodes',
    props.localNodes.filter((n) => !idsToRemove.has(n.index)),
  );
}

/**
 * 校验数据结构有效性
 * @param {Array} data - 包含该数据结构的数组
 * @returns {object} - { isValid: boolean, errors: Array }
 */
function validateNodeStructure(data: RuleTreeDetailNode[]) {
  const errors: { error: string; index: number; row: number }[] = [];
  const childCountMap: Record<number, number> = {};

  // 1. 统计每个节点的子节点数量
  // 这里的 preIndex 指向父节点的 index
  data.forEach((item) => {
    const parentId = item.preIndex;
    if (parentId !== undefined && parentId !== null) {
      childCountMap[parentId] = (childCountMap[parentId] || 0) + 1;
    }
  });

  // 2. 校验 nodeType 为 0 的节点
  data.forEach((item, i) => {
    if (item.nodeType === 0) {
      const childrenCount = childCountMap[item.index] || 0;
      if (childrenCount < 2) {
        errors.push({
          index: item.index,
          error: `节点(index:${item.index}) 所属子节点仅有 ${childrenCount} 条（需 ≥ 2条）`,
          row: i,
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 关闭
const handleClose = () => {
  emit('update:localNodes', props.localNodes);
  visible.value = false;
};

// 提交
async function handleSave() {
  const result = validateNodeStructure(props.localNodes);
  if (!result.isValid) {
    ElMessage.error(
      `规则树结构不符合要求！${result.errors.map((e) => e.error).join('；')}`,
    );
    return;
  }
  emit('update:localNodes', props.localNodes);
  visible.value = false;
}
</script>

<template>
  <ElDialog
    v-model="visible"
    v-if="visible"
    title="规则树逻辑配置"
    width="90%"
    append-to-body
    @close="handleClose"
  >
    <div class="dialog-body">
      <div class="tree-panel">
        <div class="tree-container">
          <RuleNode
            v-if="rootNode"
            :node="rootNode"
            :all-nodes="props.localNodes"
            :is-root="true"
            :readonly="false"
            :rule-type-options="props.ruleTypeOptions"
            :combine-type-options="props.combineTypeOptions"
            :rule-options="props.ruleOptions"
            :rule-set-options="props.ruleSetOptions"
            :rule-tree-options="props.ruleTreeOptions"
            @add="handleAddNode"
            @remove="handleRemoveNode"
          />
        </div>
      </div>
    </div>

    <template #footer v-if="!props.canEdit">
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSave"> 提交 </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.dialog-body {
  display: flex;
  flex-direction: row;
  gap: 0;
  height: 65vh;
}

.tree-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding-right: 20px;
}

.panel-divider {
  flex-shrink: 0;
  width: 1px;
  background-color: #e4e7ed;
}

.form-panel {
  flex-shrink: 0;
  width: 360px;
  padding-left: 24px;
  overflow-y: auto;
}

.panel-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.tree-container {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow: auto;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}
</style>
