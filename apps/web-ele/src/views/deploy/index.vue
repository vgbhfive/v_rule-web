<script lang="ts" setup>
import type { TabsPaneContext } from 'element-plus';

import type { DeployDiffInfo, DeployDoneInfo, DeployInfo } from '#/api/deploy';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElMessage, ElTabPane, ElTabs } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deployDiff,
  deployPass,
  getAlreadyDeployList,
  getDeployList,
  getNoDropdownList,
} from '#/api/deploy';
import { getSceneTypes } from '#/api/enums';
import { getLineDropdownList } from '#/api/system';

import DiffDialog from './DiffDialog.vue';

const lineMap = ref<Record<string, string>>({});
const lineOptions = ref<{ label: string; value: string }[]>([]);
const preQueryLineNo = ref('');
const preSceneType = ref('');
const sceneTypeMap = ref<Record<string, string>>({});
const sceneTypeOptions = ref<{ label: string; value: string }[]>([]);
const deployNoOptions = ref<{ label: string; value: string }[]>([]);

onMounted(async () => {
  const list = await getLineDropdownList();
  const newMap: Record<string, string> = {};
  for (const item of list) {
    newMap[item.value] = item.key;
  }
  lineMap.value = newMap;
  lineOptions.value = list.map((item) => ({
    label: item.key,
    value: item.value,
  }));

  // 场景类型
  const sceneTypeList = await getSceneTypes();
  const newSceneTypeMap: Record<string, string> = {};
  for (const item of sceneTypeList) {
    newSceneTypeMap[item.type] = item.name;
  }
  sceneTypeMap.value = newSceneTypeMap;
  sceneTypeOptions.value = sceneTypeList.map((item) => ({
    label: item.name,
    value: item.type,
  }));
});

// 查询表单配置
const [QueryForm, queryFormApi] = useVbenForm({
  collapsed: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleValuesChange: queryHandlerValueChange,
  handleSubmit: onSubmit,
  layout: 'horizontal',
  schema: [
    {
      component: 'ApiSelect',
      componentProps: {
        options: lineOptions,
        placeholder: '业务线名称',
        clearable: true,
      },
      fieldName: 'lineNo',
      label: '业务线',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: sceneTypeOptions,
        placeholder: '类型',
        clearable: true,
      },
      fieldName: 'deployType',
      label: '类型',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: deployNoOptions,
        placeholder: '编码',
        clearable: true,
      },
      fieldName: 'no',
      label: '编码',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '名称',
        clearable: true,
      },
      fieldName: 'name',
      label: '名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '字段',
        clearable: true,
      },
      fieldName: 'field',
      label: '字段',
    },
  ],
  submitButtonOptions: {
    content: '查询',
  },
  wrapperClass: 'grid-cols-3 grid-cols-4',
});

// 表单提交处理
async function onSubmit(values: any) {
  await (activeTab.value === 'deploy'
    ? loadDeployData(values)
    : loadDeployDoneData(values));
}

// 查询表单值变化
async function queryHandlerValueChange(values: any) {
  if (
    values.lineNo &&
    values.lineNo !== preQueryLineNo.value &&
    values.deployType &&
    values.deployType !== preSceneType.value
  ) {
    const noList = await getNoDropdownList({
      lineNo: values.lineNo,
      deployType: values.deployType,
    });
    deployNoOptions.value = noList.map((item) => ({
      label: item.key,
      value: item.value,
    }));

    preQueryLineNo.value = values.lineNo || '';
    preSceneType.value = values.deployType || '';
  }
}

// tabs
const activeTab = ref('deploy');

// 待上线表格配置
const [SceneTable, deployTableApi] = useVbenVxeGrid({
  gridEvents: {
    // 可以添加表格事件监听
  },
  gridOptions: {
    columns: [
      { type: 'seq', title: '序号', width: 50 },
      {
        field: 'lineNo',
        title: '业务线',
        width: 100,
        slots: {
          default: ({ row }: { row: DeployInfo }) =>
            lineMap.value[row.lineNo] || row.lineNo,
        },
      },
      {
        field: 'name',
        title: '名称',
      },
      {
        field: 'no',
        title: '编码',
      },
      {
        field: 'field',
        title: '字段',
      },
      {
        title: '操作',
        width: 250,
        slots: {
          default: ({ row: deployInfo }: { row: DeployInfo }) => {
            const buttons = [
              h(
                ElButton,
                {
                  type: 'primary',
                  size: 'small',
                  onClick: () => handleDeploy(deployInfo),
                },
                { default: () => '上线' },
              ),
              h(
                ElButton,
                {
                  type: 'info',
                  size: 'small',
                  onClick: () => handleDeployDiff(deployInfo),
                },
                { default: () => 'DIFF' },
              ),
              h(
                ElButton,
                {
                  type: 'danger',
                  size: 'small',
                  onClick: () => handleDeployRollback(deployInfo),
                },
                { default: () => '回滚' },
              ),
            ];
            return h(
              'div',
              { class: 'flex flex-wrap gap-2 justify-center' },
              buttons,
            );
          },
        },
      },
    ],
    data: [],
    pagerConfig: {
      enabled: true,
      pageSize: 10,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, form) => {
          const params = {
            ...form,
            isValid: 1,
            currPage: page.currentPage,
            limit: page.pageSize,
          };
          return await getDeployList(params);
        },
      },
    },
    sortConfig: {
      multiple: true,
    },
  },
});

// 已上线表格配置
const [DataSourceTable, deployDoneTableApi] = useVbenVxeGrid({
  gridEvents: {
    // 可以添加表格事件监听
  },
  gridOptions: {
    columns: [
      { type: 'seq', title: '序号', width: 50 },
      {
        field: 'lineNo',
        title: '业务线',
        width: 100,
        slots: {
          default: ({ row }: { row: DeployDoneInfo }) =>
            lineMap.value[row.lineNo] || row.lineNo,
        },
      },
      {
        field: 'deployType',
        title: '类型',
        width: 100,
        slots: {
          default: ({ row }: { row: DeployDoneInfo }) =>
            sceneTypeMap.value[row.deployType] || row.deployType,
        },
      },
      {
        field: 'name',
        title: '名称',
      },
      {
        field: 'no',
        title: '编码',
      },
      {
        field: 'field',
        title: '字段',
      },
      {
        field: 'deployDesc',
        title: '描述',
        width: 150,
      },
      {
        field: 'createAt',
        title: '上线时间',
      },
    ],
    data: [],
    pagerConfig: {
      enabled: true,
      pageSize: 10,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, form) => {
          const params = {
            ...form,
            isValid: 1,
            currPage: page.currentPage,
            limit: page.pageSize,
          };
          return await getAlreadyDeployList(params);
        },
      },
    },
    sortConfig: {
      multiple: true,
    },
  },
});

// 上线前展示DIFF
async function handleDeploy(deployInfo: DeployInfo) {
  try {
    const res = await deployDiff({
      type: deployInfo.type,
      no: deployInfo.no,
    });

    // 2. 核心拦截：如果接口返回的是字符串而非对象
    if (typeof res === 'string') {
      // 依然把字符串传给组件，组件会通过 ElEmpty 展示它
      diffData.value = res;
      ElMessage.warning(`${res}`);
    } else if (res?.deployStatus === 1) {
      ElMessage.info('首次上线，无 DIFF 展示');
      diffVisible.value = false;
    } else {
      currentDeployInfo.value = deployInfo;
      isDiff.value = false;
      diffVisible.value = true;
      diffData.value = res;
    }
  } catch {
    ElMessage.error('获取差异失败');
    diffVisible.value = false;
  } finally {
    // 3. 无论如何关闭加载圈
    loading.value = false;
  }
}

// 上线
async function handleDeploySubmit(text: string) {
  const data = {
    lineNo: currentDeployInfo.value?.lineNo,
    deployType: currentDeployInfo.value?.type,
    deployNo: currentDeployInfo.value?.no,
    deployDesc: text,
  };
  console.log(data);
  const resp = await deployPass(data);
  ElMessage.success(resp);
}

// 查看DIFF
async function handleDeployDiff(deployInfo: any) {
  // 1. 立即初始化弹窗状态
  loading.value = true;
  diffData.value = null;
  isDiff.value = true;

  try {
    const res = await deployDiff({
      type: deployInfo.type,
      no: deployInfo.no,
    });

    // 2. 核心拦截：如果接口返回的是字符串而非对象
    if (typeof res === 'string') {
      // 依然把字符串传给组件，组件会通过 ElEmpty 展示它
      diffData.value = res;
      ElMessage.warning(`${res}`);
    } else if (res?.deployStatus === 1) {
      ElMessage.info('首次上线，无 DIFF 展示');
      diffVisible.value = false;
    } else {
      isDiff.value = true;
      diffVisible.value = true;
      diffData.value = res;
    }
  } catch {
    ElMessage.error('获取差异失败');
    diffVisible.value = false;
  } finally {
    // 3. 无论如何关闭加载圈
    loading.value = false;
  }
}

// 回滚
async function handleDeployRollback(deployInfo: DeployInfo) {
  ElMessage.success(`回滚${JSON.stringify(deployInfo.no)}`);
}

// tab 栏切换更新数据
async function handleTabClick(tab: TabsPaneContext) {
  activeTab.value = tab.paneName as string;
  const values = await queryFormApi.getValues();
  await (activeTab.value === 'deploy'
    ? loadDeployData(values)
    : loadDeployDoneData(values));
}

// 加载待上线列表
async function loadDeployData(params?: any) {
  deployTableApi.reload({ ...params });
}

// 加载已上线列表
async function loadDeployDoneData(params?: any) {
  deployDoneTableApi.reload({ ...params });
}

// DIFF 展示框标记
const diffVisible = ref(false);
const diffData = ref<DeployDiffInfo | null>(null);
const currentDeployInfo = ref<DeployInfo | null>(null);
const loading = ref(false);
const isDiff = ref(false);
</script>

<template>
  <Page description="部署上线管理">
    <div class="flex flex-col">
      <QueryForm />
      <ElTabs v-model="activeTab" class="mt-4" @tab-click="handleTabClick">
        <ElTabPane label="待上线" name="deploy">
          <SceneTable />
        </ElTabPane>
        <ElTabPane label="已上线" name="deployDone">
          <DataSourceTable />
        </ElTabPane>
      </ElTabs>
    </div>

    <!-- DIFF展示弹窗 -->
    <DiffDialog
      v-model="diffVisible"
      :data="diffData"
      :loading="loading"
      :is-diff="isDiff"
      @confirm="handleDeploySubmit"
    />
  </Page>
</template>
