<script lang="ts" setup>
import type { RuleTreeDetailNode, RuleTreeInfo } from '#/api/rule/ruleTree';

import { computed, ref, watch } from 'vue';

import { ElButton, ElDialog, ElEmpty, ElMessage } from 'element-plus';

import {
  createRuleTree,
  getRuleTreeDetail,
  updateRuleTree,
} from '#/api/rule/ruleTree';

import RuleNode from './RuleNode.vue';

const props = defineProps<{
  combineTypeOptions: { label: string; value: string }[];
  conditionTypeOptions: { label: string; value: string }[];
  lineOptions: { label: string; value: string }[];
  mode: 'add' | 'edit';
  modelValue: boolean;
  resultTypeOptions: { label: string; value: string }[];
  row?: null | RuleTreeInfo;
  ruleOptions: { label: string; value: string }[];
  ruleSetOptions: { label: string; value: string }[];
  ruleTypeOptions: { label: string; value: string }[];
}>();

const emit = defineEmits<{
  saved: [];
  'update:modelValue': [val: boolean];
}>();

const loading = ref(false);
const detailLoading = ref(false);

const formData = ref({
  lineNo: '',
  ruleTreeName: '',
  cond: '',
  threshold: '',
  result: '',
  isValid: 1 as number,
});

const localNodes = ref<RuleTreeDetailNode[]>([]);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const title = computed(() =>
  props.mode === 'add' ? '新增规则树' : '编辑规则树',
);

const rootNode = computed(() => localNodes.value.find((n) => n.preIndex === 0));

watch(
  () => props.modelValue,
  async (opened) => {
    if (!opened) return;
    if (props.mode === 'add') {
      formData.value = {
        lineNo: '',
        ruleTreeName: '',
        cond: '',
        threshold: '',
        result: '',
        isValid: 1,
      };
      localNodes.value = [];
    } else if (props.row) {
      formData.value = {
        lineNo: props.row.lineNo,
        ruleTreeName: props.row.ruleTreeName,
        cond: props.row.cond,
        threshold: props.row.threshold,
        result: props.row.result,
        isValid: props.row.isValid,
      };
      // 通过详情接口加载完整树节点数据
      detailLoading.value = true;
      try {
        const detail = await getRuleTreeDetail(props.row.id);
        localNodes.value = detail.detailEntityList
          ? JSON.parse(JSON.stringify(detail.detailEntityList))
          : [];
      } catch {
        localNodes.value = [];
      } finally {
        detailLoading.value = false;
      }
    }
  },
);

function initRoot() {
  localNodes.value = [
    {
      index: 1,
      preIndex: 0,
      nodeType: 'operator',
      combine: 'AND',
      ruleType: '',
      ruleNo: '',
    },
  ];
}

function handleAddNode(preIndex: number, type: string) {
  const newIndex =
    localNodes.value.length > 0
      ? Math.max(...localNodes.value.map((n) => n.index)) + 1
      : 1;
  localNodes.value.push({
    index: newIndex,
    preIndex,
    nodeType: type === 'operator' ? 'operator' : 'rule',
    combine: type === 'operator' ? 'AND' : '',
    ruleType: type === 'operator' ? '' : 'rule',
    ruleNo: '',
  });
}

function handleRemoveNode(index: number) {
  const idsToRemove = new Set<number>([index]);
  const findChildren = (pId: number) => {
    for (const n of localNodes.value) {
      if (n.preIndex === pId) {
        idsToRemove.add(n.index);
        findChildren(n.index);
      }
    }
  };
  findChildren(index);
  localNodes.value = localNodes.value.filter((n) => !idsToRemove.has(n.index));
}

async function handleSave() {
  if (!formData.value.lineNo) {
    ElMessage.warning('请选择业务线');
    return;
  }
  if (!formData.value.ruleTreeName) {
    ElMessage.warning('请输入规则树名称');
    return;
  }
  if (!formData.value.cond) {
    ElMessage.warning('请选择条件');
    return;
  }
  if (!formData.value.threshold) {
    ElMessage.warning('请选择阈值');
    return;
  }
  if (!formData.value.result) {
    ElMessage.warning('请选择结果');
    return;
  }

  loading.value = true;
  try {
    if (props.mode === 'add') {
      const resp = await createRuleTree({
        ...formData.value,
        detailEntityList: localNodes.value,
      });
      ElMessage.success(resp);
    } else {
      const resp = await updateRuleTree({
        id: props.row?.id,
        ruleTreeNo: props.row?.ruleTreeNo,
        version: props.row?.version,
        createAt: props.row?.createAt,
        ...formData.value,
        detailEntityList: localNodes.value,
      });
      ElMessage.success(resp);
    }
    visible.value = false;
    emit('saved');
  } catch (error) {
    console.error('规则树操作失败:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="90vw"
    :style="{ maxWidth: '1400px' }"
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
  >
    <div class="dialog-body">
      <!-- 左侧：规则树逻辑配置 -->
      <div class="tree-panel">
        <div class="panel-title">
          规则树逻辑配置
          <ElButton
            v-if="localNodes.length === 0 && !detailLoading"
            type="primary"
            size="small"
            style="margin-left: 12px"
            @click="initRoot"
          >
            初始化根节点
          </ElButton>
        </div>
        <div class="tree-container" v-loading="detailLoading">
          <RuleNode
            v-if="rootNode"
            :node="rootNode"
            :all-nodes="localNodes"
            :is-root="true"
            :readonly="false"
            :rule-type-options="ruleTypeOptions"
            :combine-type-options="combineTypeOptions"
            :rule-options="ruleOptions"
            :rule-set-options="ruleSetOptions"
            @add="handleAddNode"
            @remove="handleRemoveNode"
          />
          <ElEmpty
            v-else-if="!detailLoading"
            description="暂无规则配置，请先初始化根节点"
            :image-size="100"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSave">
        保存
      </ElButton>
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
