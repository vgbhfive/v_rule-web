<script setup lang="ts">
import type { DataCategoryCalcDetail, DataCategoryDetail } from '#/api/data';

import { computed, onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';

import {
  ElButton,
  ElCol,
  ElDialog,
  ElInput,
  ElMessage,
  ElOption,
  ElRow,
  ElSelect,
} from 'element-plus';

import { getValueTypes } from '#/api/enums';

const props = defineProps<{
  calcOtherData: DataCategoryCalcDetail[];
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
  'update:calc-other-data',
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

const generateScoreCardInfo = () => {
  const baseScoreItem = {
    key: 'baseScore',
    valueType: 'fixed',
    value: baseScore.value,
    trialValue: baseScore.value,
  };
  const scoringMethodItem = {
    key: 'scoringMethod',
    valueType: 'fixed',
    value: scoringMethod.value,
    trialValue: scoringMethod.value,
  };
  const configItems: DataCategoryDetail[] = [];
  configList.value.forEach((item) => {
    configItems.push({
      key: item.value,
      valueType: item.valueType,
      value: item.value,
      trialValue: item.trialValue,
    });
  });
  emit('update:other-data', [baseScoreItem, scoringMethodItem, ...configItems]);
  console.log(configList.value);

  const calcItems: DataCategoryCalcDetail[] = [];
  configList.value.forEach((item) => {
    item.rules.forEach((rule) => {
      calcItems.push({
        valueType: item.valueType,
        value: item.value,
        cond: rule.cond,
        threshold: rule.threshold,
        res: rule.res,
      });
    });
  });
  console.log(calcItems);
  emit('update:calc-other-data', calcItems);
};

// 试算
const handleTrial = () => {
  // 清空其他数据
  emit('update:other-data', []);
  generateScoreCardInfo();
  emit('trial', comment.value);
  isTrial.value = true;
};

// 提交
const handleConfirm = () => {
  if (!isTrial.value) {
    ElMessage.warning('请先完成试算后再提交');
    return;
  }
  generateScoreCardInfo();
  emit('confirm', comment.value);
  isTrial.value = false;
};

/**
 * 核心响应式数据结构
 * configList: 对应 UI 中多个“选择数据源”区块
 */
const configList = ref([
  {
    valueType: 'dataSource',
    value: '', // 选中的数据源
    trialValue: '', // 试算值
    rules: [
      // 该数据源下的评分规则列表
      { cond: '', threshold: '', res: '' },
    ],
  },
]);

// 计分方式
const scoringMethod = ref('');
const baseScore = ref(0);

/**
 * 为指定组添加规则行
 */
const handleAddRule = (gIdx: number) => {
  configList.value[gIdx].rules.push({
    cond: '',
    threshold: '',
    res: '',
  });
};

/**
 * 删除指定组的规则行
 */
const handleDeleteRule = (gIdx: number, rIdx: number) => {
  configList.value[gIdx].rules.splice(rIdx, 1);
};

/**
 * 逻辑：添加一条全新的记录（整块配置）
 */
const handleAddRecord = () => {
  configList.value.push({
    valueType: 'dataSource',
    value: '',
    trialValue: '',
    rules: [{ cond: '', threshold: '', res: '' }],
  });
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
    <div class="score-config-container">
      <div v-for="(item, gIdx) in configList" :key="gIdx" class="group-wrapper">
        <ElRow :gutter="20" type="flex">
          <ElCol :span="6" class="left-action-zone">
            <ElSelect
              v-model="item.value"
              placeholder="选择数据源"
              class="w-full"
            >
              <ElOption
                v-for="source in dataSourceList"
                :key="source.value"
                :label="source.label"
                :value="source.value"
              />
            </ElSelect>

            <div class="trial-row">
              <ElButton type="primary" @click="handleAddRule(gIdx)">
                新增
              </ElButton>
              <ElInput
                v-model="item.trialValue"
                placeholder="试算值"
                class="trial-input"
              />
            </div>
          </ElCol>

          <ElCol :span="18">
            <div
              v-for="(rule, rIdx) in item.rules"
              :key="rIdx"
              class="rule-line"
            >
              <ElSelect
                v-model="rule.cond"
                placeholder="运算符"
                style="width: 150px"
              >
                <ElOption label=">" value=">" />
                <ElOption label="<" value="<" />
                <ElOption label="=" value="=" />
              </ElSelect>

              <ElInput
                v-model="rule.threshold"
                placeholder="阈值"
                style="width: 120px"
              />

              <ElInput
                v-model="rule.res"
                placeholder="分值"
                style="width: 120px"
              />

              <ElButton type="danger" @click="handleDeleteRule(gIdx, rIdx)">
                删除
              </ElButton>
            </div>
          </ElCol>
        </ElRow>
      </div>

      <div>
        <ElButton type="info" @click="handleAddRecord"> 添加数据源 </ElButton>
      </div>

      <div class="scoring-method-section">
        <span>计分方式</span>
        <ElSelect
          v-model="scoringMethod"
          placeholder="计分方式"
          style="width: 160px"
        >
          <ElOption label="累加" value="sum" />
          <ElOption label="平均" value="avg" />
        </ElSelect>
        <span>基础评分</span>
        <ElInput
          v-model="baseScore"
          placeholder="基础评分"
          style="width: 160px"
        />
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

.score-config-container {
  padding: 10px;
}

/* 区块间距 */
.group-wrapper {
  padding-bottom: 20px;
  margin-bottom: 30px;
  border-bottom: 1px dashed #ebeef5;
}

/* 左侧垂直布局 */
.left-action-zone {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trial-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.trial-input {
  flex: 1;
}

/* 右侧规则行样式 */
.rule-line {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

/* 还原图中深色按钮风格 */
.dark-btn {
  color: white !important;
  background-color: #4b4e57 !important;
  border-color: #4b4e57 !important;
}

.dark-btn:hover {
  background-color: #333 !important;
  opacity: 0.9;
}

/* 底部计分方式 */
.scoring-method-section {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 20px;
}

.method-label {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.w-full {
  width: 100%;
}
</style>
