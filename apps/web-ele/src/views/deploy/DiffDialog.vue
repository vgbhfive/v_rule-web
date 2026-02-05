<script setup lang="ts">
import type { DeployDiffInfo } from '#/api/deploy';

import { computed, ref } from 'vue';

import {
  ElButton,
  ElCollapse,
  ElCollapseItem,
  ElDialog,
  ElEmpty,
  ElInput,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

const props = defineProps<{
  data: DeployDiffInfo | null | string | undefined;
  isDiff: boolean; // 外部传入，控制是否展示输入框
  loading: boolean;
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const comment = ref('');
const activeNames = ref<string[]>([]);

// 核心逻辑：确保所有标题均展示，并防御 data 非对象的情况
const diffGroups = computed(() => {
  const keys = [
    'scene',
    'divide',
    'strategy',
    'limit',
    'period',
    'interest',
    'custom',
    'rule',
    'ruleSet',
    'dataCategory',
    'dataSource',
  ];
  const result: any = {};
  const safeData =
    props.data && typeof props.data === 'object' ? props.data : {};

  keys.forEach((key) => {
    result[key] = (safeData as any)[key] || [];
  });
  return result;
});

const handleConfirm = () => {
  emit('confirm', comment.value);
};

const handleClosed = () => {
  comment.value = '';
  activeNames.value = [];
};

const getCategoryLabel = (key: string) => {
  const labels: Record<string, string> = {
    scene: '场景',
    divide: '分流器',
    strategy: '策略集',
    limit: '额度产品',
    period: '账期产品',
    interest: '利率产品',
    custom: '自定义产品',
    rule: '规则',
    ruleSet: '规则集',
    dataCategory: '数据源分类',
    dataSource: '数据源',
  };
  return labels[key] || key;
};
</script>

<template>
  <ElDialog
    v-model="visible"
    title="DIFF 差异对比"
    width="60%"
    append-to-body
    @closed="handleClosed"
  >
    <div
      v-if="loading"
      v-loading="true"
      class="flex h-64 items-center justify-center"
    >
      <span>正在获取 DIFF 数据...</span>
    </div>

    <div
      v-else-if="data && typeof data === 'object'"
      class="max-h-[60vh] overflow-y-auto pr-2"
    >
      <ElCollapse v-model="activeNames">
        <template v-for="(list, key) in diffGroups" :key="key">
          <ElCollapseItem :name="key">
            <template #title>
              <div class="flex w-full items-center justify-between pr-4">
                <div class="flex items-center gap-2">
                  <span
                    class="text-sm font-bold"
                    :class="[
                      list.length > 0 ? 'text-blue-600' : 'text-gray-400',
                    ]"
                  >
                    {{ getCategoryLabel(key) }}
                  </span>
                </div>
                <div>
                  <ElTag
                    v-if="list.length > 0"
                    size="small"
                    type="danger"
                    effect="dark"
                    round
                  >
                    {{ list.length }}
                  </ElTag>
                  <span v-else class="text-xs text-gray-300">无变更</span>
                </div>
              </div>
            </template>

            <template v-if="list.length > 0">
              <div
                v-for="item in list"
                :key="item.no"
                class="mb-4 rounded border border-gray-200"
              >
                <div
                  class="flex justify-between border-b bg-gray-50 px-3 py-1.5 text-xs italic"
                >
                  <span>名称：{{ item.name }}</span>
                  <span class="text-gray-400">#{{ item.no }}</span>
                </div>
                <ElTable :data="item.results" size="small" stripe border>
                  <ElTableColumn prop="name" label="变更字段" width="140" />
                  <ElTableColumn label="旧值">
                    <template #default="{ row }">
                      <div class="diff-old">{{ row.oldValue || '-' }}</div>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="新值">
                    <template #default="{ row }">
                      <div class="diff-new">{{ row.newValue || '-' }}</div>
                    </template>
                  </ElTableColumn>
                </ElTable>
              </div>
            </template>
            <template v-else>
              <div
                class="border border-dashed border-gray-100 py-4 text-center text-xs italic text-gray-300"
              >
                该场景下无数据变更
              </div>
            </template>
          </ElCollapseItem>
        </template>
      </ElCollapse>
    </div>

    <div v-else class="py-10">
      <ElEmpty
        :description="typeof data === 'string' ? data : '暂无有效的差异数据'"
      />
    </div>

    <template #footer>
      <div class="flex flex-col gap-4">
        <div
          v-if="!isDiff"
          class="flex items-center gap-3 border-t border-gray-100 pt-4"
        >
          <span class="w-20 text-sm font-medium text-gray-600">说明</span>
          <ElInput
            v-model="comment"
            type="textarea"
            :rows="3"
            placeholder="请输入上线说明（200字以内）..."
            clearable
            maxlength="200"
          />
        </div>
        <div class="flex justify-end">
          <ElButton @click="visible = false">关闭</ElButton>
          <ElButton
            v-if="!isDiff"
            type="primary"
            :disabled="!comment.trim()"
            @click="handleConfirm"
          >
            提交
          </ElButton>
        </div>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.diff-old {
  padding: 2px 6px;
  color: #f56c6c;
  word-break: break-all;
  text-decoration: line-through;
  background: #fef2f2;
  border-radius: 4px;
}

.diff-new {
  padding: 2px 6px;
  font-weight: bold;
  color: #16a34a;
  word-break: break-all;
  background: #f0fdf4;
  border-radius: 4px;
}
</style>
