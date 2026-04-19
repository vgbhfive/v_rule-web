<script lang="ts" setup>
import type { RuleTreeDetailNode } from '#/api/rule/ruleTree';

import { computed } from 'vue';

import { ElButton, ElOption, ElSelect, ElTag } from 'element-plus';

const props = defineProps<{
  allNodes: RuleTreeDetailNode[];
  combineTypeOptions: { label: string; value: string }[];
  isRoot?: boolean;
  node: RuleTreeDetailNode;
  readonly?: boolean;
  ruleOptions: { label: string; value: string }[];
  ruleSetOptions: { label: string; value: string }[];
  ruleTreeOptions: { label: string; value: string }[];
  ruleTypeOptions: { label: string; value: string }[];
}>();

const emit = defineEmits<{
  add: [preIndex: number, type: number];
  remove: [index: number];
}>();

const children = computed(() =>
  props.allNodes.filter((n) => n.preIndex === props.node.index),
);

const isOperator = computed(() => props.node.nodeType === 0);

const currentRuleOptions = computed(() => {
  if (props.node.ruleType === 'rule') return props.ruleOptions;
  if (props.node.ruleType === 'rule_set') return props.ruleSetOptions;
  if (props.node.ruleType === 'rule_tree') return props.ruleTreeOptions;
  return [];
});
</script>

<template>
  <div class="rule-node-wrapper">
    <!-- 节点卡片 -->
    <div class="rule-node" :class="isOperator ? 'node-operator' : 'node-rule'">
      <div class="node-header">
        <ElTag :type="isOperator ? 'primary' : 'success'" size="small">
          {{ isOperator ? '逻辑节点' : '规则节点' }}
        </ElTag>
        <div v-if="!readonly && !isRoot" class="node-actions">
          <ElButton
            type="danger"
            size="small"
            link
            @click="emit('remove', node.index)"
          >
            删除
          </ElButton>
        </div>
      </div>

      <div class="node-body">
        <!-- 逻辑节点：只有 combine -->
        <template v-if="isOperator">
          <div class="node-field">
            <span class="field-label">联合条件</span>
            <ElSelect
              v-model="node.combine"
              size="small"
              :disabled="readonly"
              placeholder="请选择"
              style="width: 120px"
            >
              <ElOption
                v-for="opt in combineTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>
        </template>

        <!-- 规则节点：ruleType + ruleNo -->
        <template v-else>
          <div class="node-field">
            <span class="field-label">类型</span>
            <ElSelect
              v-model="node.ruleType"
              size="small"
              :disabled="readonly"
              placeholder="请选择"
              style="width: 110px"
              @change="node.ruleNo = ''"
            >
              <ElOption
                v-for="opt in ruleTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>
          <div class="node-field">
            <span class="field-label">规则</span>
            <ElSelect
              v-model="node.ruleNo"
              size="small"
              :disabled="readonly || !node.ruleType"
              placeholder="请选择"
              style="width: 160px"
              filterable
            >
              <ElOption
                v-for="opt in currentRuleOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>
        </template>
      </div>

      <!-- 新增子节点按钮（仅逻辑节点显示） -->
      <div v-if="isOperator && !readonly" class="node-add-actions">
        <ElButton
          size="small"
          type="primary"
          plain
          @click="emit('add', node.index, 0)"
        >
          + 逻辑节点
        </ElButton>
        <ElButton
          size="small"
          type="success"
          plain
          @click="emit('add', node.index, 1)"
        >
          + 规则节点
        </ElButton>
      </div>
    </div>

    <!-- 子节点区域 -->
    <div v-if="children.length > 0" class="children-wrapper">
      <div class="connector-line"></div>
      <div class="children-list">
        <div v-for="child in children" :key="child.index" class="child-item">
          <RuleNode
            :node="child"
            :all-nodes="allNodes"
            :readonly="readonly"
            :rule-type-options="ruleTypeOptions"
            :combine-type-options="combineTypeOptions"
            :rule-options="ruleOptions"
            :rule-set-options="ruleSetOptions"
            :rule-tree-options="ruleTreeOptions"
            @add="(pIdx, t) => emit('add', pIdx, t)"
            @remove="(idx) => emit('remove', idx)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rule-node-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.rule-node {
  min-width: 220px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 6%);
}

.node-operator {
  background: #f0f7ff;
  border-color: #409eff;
}

.node-rule {
  background: #f0fff4;
  border-color: #67c23a;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.node-actions {
  display: flex;
  gap: 4px;
}

.node-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.node-field {
  display: flex;
  gap: 8px;
  align-items: center;
}

.field-label {
  flex-shrink: 0;
  width: 56px;
  font-size: 12px;
  color: #606266;
}

.node-add-actions {
  display: flex;
  gap: 6px;
  padding-top: 8px;
  margin-top: 10px;
  border-top: 1px dashed #dcdfe6;
}

.connector-line {
  width: 2px;
  height: 16px;
  margin-left: 24px;
  background: #c0c4cc;
}

.children-wrapper {
  display: flex;
  flex-direction: column;
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 40px;
  margin-left: 24px;
  border-left: 2px solid #c0c4cc;
}

.child-item {
  position: relative;
}

.child-item::before {
  position: absolute;
  top: 22px;
  left: -40px;
  width: 38px;
  height: 2px;
  content: '';
  background: #c0c4cc;
}
</style>
