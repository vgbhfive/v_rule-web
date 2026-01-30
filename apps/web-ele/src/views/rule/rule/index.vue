<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { RuleInfo } from '#/api/rule';
import type { SceneParams } from '#/api/system';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElDrawer, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDataSourceDropdownList } from '#/api/data';
import { getConditionTypes, getResultTypes, getValueTypes } from '#/api/enums';
import {
  createRule,
  getRuleList,
  updateRule,
  updateRuleValid,
} from '#/api/rule';
import { getLineDropdownList } from '#/api/system';

const lineMap = ref<Record<string, string>>({});
const allValueMap = ref<Record<string, string>>({});
const lineOptions = ref<{ label: string; value: string }[]>([]);
const conditionTypeOptions = ref<{ label: string; value: string }[]>([]);
const resultOptions = ref<{ label: string; value: string }[]>([]);

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

  // 阈值类型
  const valueList = await getValueTypes();
  const newValueMap: Record<string, string> = {};
  for (const item of valueList) {
    newValueMap[item.type] = item.name;
  }
  allValueMap.value = newValueMap;

  // 条件类型
  const conditionList = await getConditionTypes();
  conditionTypeOptions.value = conditionList.map((item) => ({
    label: item.name,
    value: item.value,
  }));

  // 结果类型
  const resultList = await getResultTypes();
  resultOptions.value = resultList.map((item) => ({
    label: item.name,
    value: item.result,
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
      component: 'Input',
      componentProps: {
        placeholder: '规则名称',
        clearable: true,
      },
      fieldName: 'ruleName',
      label: '名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '规则编码',
        clearable: true,
      },
      fieldName: 'ruleNo',
      label: '编码',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '数据源编码',
        clearable: true,
      },
      fieldName: 'dataSourceNo',
      label: '数据源编码',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        clearable: true,
        options: [
          {
            label: '生效',
            value: 1,
          },
          {
            label: '失效',
            value: 0,
          },
        ],
        placeholder: '状态',
        showSearch: true,
      },
      fieldName: 'isValid',
      label: '状态',
    },
  ],
  submitButtonOptions: {
    content: '查询',
  },
  wrapperClass: 'grid-cols-3 grid-cols-4',
});

// 表单提交处理
async function onSubmit(values: SceneParams) {
  await gridApi.reload({ ...values });
}

// 表格配置
const gridOptions: VxeGridProps<RuleInfo> = {
  columns: [
    { type: 'seq', title: '序号', width: 50 },
    {
      field: 'lineNo',
      title: '业务线',
      slots: {
        default: ({ row }: { row: RuleInfo }) =>
          lineMap.value[row.lineNo] || row.lineNo,
      },
    },
    { field: 'ruleName', title: '名称' },
    { field: 'ruleNo', title: '编码' },
    { field: 'dataSourceNo', title: '数据源' },
    { field: 'cond', title: '条件', width: 50 },
    { field: 'threshold', title: '阈值' },
    {
      field: 'thresholdType',
      title: '阈值类型',
      width: 80,
      slots: {
        default: ({ row }: { row: RuleInfo }) =>
          allValueMap.value[row.thresholdType] || row.thresholdType,
      },
    },
    { field: 'result', title: '结果', width: 80 },
    {
      field: 'isValid',
      title: '状态',
      width: 80,
      formatter: ({ cellValue }) => {
        return cellValue === 1 ? '生效' : '失效';
      },
    },
    { field: 'deployAt', title: '上线时间' },
    {
      title: '操作',
      width: 250,
      slots: {
        default: ({ row: ruleInfo }: { row: RuleInfo }) => {
          const buttons = [
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                onClick: () => handleEdit(ruleInfo),
              },
              { default: () => '编辑' },
            ),
            h(
              ElButton,
              {
                type: 'info',
                size: 'small',
                onClick: () => handleInfo(ruleInfo),
              },
              { default: () => '详情' },
            ),
          ];

          if (ruleInfo.isValid === 0) {
            buttons.push(
              h(
                ElButton,
                {
                  type: 'success',
                  size: 'small',
                  onClick: () => handleValid(ruleInfo),
                },
                { default: () => '生效' },
              ),
            );
          } else {
            buttons.push(
              h(
                ElButton,
                {
                  type: 'warning',
                  size: 'small',
                  onClick: () => handleInvalid(ruleInfo),
                },
                { default: () => '失效' },
              ),
            );
          }

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
          currPage: page.currentPage,
          limit: page.pageSize,
        };
        return await getRuleList(params);
      },
    },
  },
  sortConfig: {
    multiple: true,
  },
};

const gridEvents: VxeGridListeners<RuleInfo> = {
  // 可以添加表格事件监听
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 编辑弹窗状态
const editDrawerVisible = ref(false);
const currentEditing = ref<null | RuleInfo>(null);
const insertDataSourceListOptions = ref<{ label: string; value: string }[]>([]);
const drawerTitle = ref('');
const isAddFixed = ref(false);
const isAddDataSource = ref(false);
const isEditFixed = ref(false);
const isEditDataSource = ref(false);
const preLineNo = ref('');

// 新增/编辑/详情表单配置
const [EditForm, editFormApi] = useVbenForm({
  collapsed: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleValuesChange: handleValueChange,
  handleReset: handleResetEdit,
  handleSubmit: handleSaveEdit,
  layout: 'vertical',
  schema: [
    {
      component: 'ApiSelect',
      componentProps: {
        options: lineOptions,
        placeholder: '业务线名称',
      },
      fieldName: 'lineNo',
      label: '业务线名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入规则名称',
      },
      fieldName: 'ruleName',
      label: '规则名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入场景编码',
        disabled: true,
      },
      fieldName: 'ruleNo',
      label: '规则编码',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: insertDataSourceListOptions,
        placeholder: '请输入数据源',
        disabled: true,
      },
      fieldName: 'dataSourceNo',
      label: '数据源',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: conditionTypeOptions,
        placeholder: '请选择条件',
        disabled: true,
      },
      fieldName: 'cond',
      label: '条件',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入阈值',
        disabled: true,
      },
      fieldName: 'thresholdFixed',
      label: '阈值',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: insertDataSourceListOptions,
        placeholder: '请输入阈值',
        disabled: true,
      },
      fieldName: 'thresholdDataSource',
      label: '阈值',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: resultOptions,
        placeholder: '请选择结果',
        disabled: true,
      },
      fieldName: 'result',
      label: '结果',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: '生效',
            value: 1,
          },
          {
            label: '失效',
            value: 0,
          },
        ],
        placeholder: '请选择状态',
        showSearch: true,
      },
      fieldName: 'isValid',
      label: '状态',
      rules: 'required',
    },
  ],
  showDefaultActions: true,
  wrapperClass: 'grid-cols-1',
});

// 详情
function handleInfo(row: RuleInfo) {
  drawerTitle.value = '规则详情';
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  const values = {
    ...row,
    thresholdFixed: '',
    thresholdDataSource: '',
  };
  if (row.thresholdType === 'fixed') {
    values.thresholdFixed = row.threshold;
  } else if (row.thresholdType === 'dataSource') {
    values.thresholdDataSource = row.threshold;
  }
  editFormApi.setValues(values);
  // 设置全部字段不可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'lineNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'ruleName',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'ruleNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'dataSourceNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'cond',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'thresholdFixed',
      componentProps: {
        disabled: true,
      },
      hide: !(row.thresholdType === 'fixed'),
    },
    {
      fieldName: 'thresholdDataSource',
      componentProps: {
        disabled: true,
      },
      hide: !(row.thresholdType === 'dataSource'),
    },
    {
      fieldName: 'result',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'isValid',
      componentProps: {
        disabled: true,
      },
    },
  ]);
  // 设置操作按钮不可见
  editFormApi.setState({ showDefaultActions: false });
  editDrawerVisible.value = true;
}

// 新增值规则
function handleAddFixed() {
  drawerTitle.value = '新增值规则';
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 设置部分字段可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'lineNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'ruleName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'ruleNo',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'dataSourceNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'cond',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'thresholdFixed',
      componentProps: {
        disabled: false,
      },
      hide: false,
    },
    {
      fieldName: 'thresholdDataSource',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'result',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'isValid',
      componentProps: {
        disabled: false,
      },
    },
  ]);
  // 设置操作按钮可见
  editFormApi.setState({ showDefaultActions: true });
  isAddFixed.value = true;
  isAddDataSource.value = false;
  isEditFixed.value = false;
  isEditDataSource.value = false;
  editDrawerVisible.value = true;
}

// 新增源规则
function handleAddSource() {
  drawerTitle.value = '新增源规则';
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 设置部分字段可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'lineNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'ruleName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'ruleNo',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'dataSourceNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'cond',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'thresholdFixed',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'thresholdDataSource',
      componentProps: {
        disabled: false,
      },
      hide: false,
    },
    {
      fieldName: 'result',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'isValid',
      componentProps: {
        disabled: false,
      },
    },
  ]);
  // 设置操作按钮可见
  editFormApi.setState({ showDefaultActions: true });
  isAddFixed.value = false;
  isAddDataSource.value = true;
  isEditFixed.value = false;
  isEditDataSource.value = false;
  editDrawerVisible.value = true;
}

// 编辑
function handleEdit(row: RuleInfo) {
  drawerTitle.value = '编辑场景';
  ElMessage.info(`编辑场景: ${row.id}`);
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  const values = {
    ...row,
    thresholdFixed: '',
    thresholdDataSource: '',
  };
  if (row.thresholdType === 'fixed') {
    values.thresholdFixed = row.threshold;
  } else if (row.thresholdType === 'dataSource') {
    values.thresholdDataSource = row.threshold;
  }
  editFormApi.setValues(values);
  // 设置部分字段不可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'lineNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'ruleName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'ruleNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'dataSourceNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'cond',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'thresholdFixed',
      componentProps: {
        disabled: false,
      },
      hide: !(row.thresholdType === 'fixed'),
    },
    {
      fieldName: 'thresholdDataSource',
      componentProps: {
        disabled: false,
      },
      hide: !(row.thresholdType === 'dataSource'),
    },
    {
      fieldName: 'result',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'isValid',
      componentProps: {
        disabled: false,
      },
    },
  ]);
  // 设置操作按钮可见
  editFormApi.setState({ showDefaultActions: true });
  isAddFixed.value = false;
  isAddDataSource.value = false;
  if (row.thresholdType === 'fixed') {
    isEditFixed.value = true;
    isEditDataSource.value = false;
  } else if (row.thresholdType === 'dataSource') {
    isEditFixed.value = false;
    isEditDataSource.value = true;
  }
  handleValueChange(row);
  editDrawerVisible.value = true;
}

// 生效
async function handleValid(row: RuleInfo) {
  try {
    const data = { id: row.id, isValid: 1 };
    const resp = await updateRuleValid(data);
    ElMessage.success(resp);

    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 失效
async function handleInvalid(row: RuleInfo) {
  try {
    const data = { id: row.id, isValid: 0 };
    const resp = await updateRuleValid(data);
    ElMessage.success(resp);

    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 值变化
async function handleValueChange(values: any) {
  if (values.lineNo && values.lineNo !== preLineNo.value) {
    preLineNo.value = values.lineNo;
    const queryParams = { lineNo: values.lineNo };

    const insertDataSourceList = await getDataSourceDropdownList(queryParams);
    insertDataSourceListOptions.value = insertDataSourceList.map((item) => ({
      label: item.key,
      value: item.value,
    }));
  }
}

// 保存
async function handleSaveEdit(values: any) {
  try {
    if (isAddFixed.value) {
      const insertData = {
        lineNo: values.lineNo,
        ruleName: values.ruleName,
        dataSourceNo: values.dataSourceNo,
        cond: values.cond,
        threshold: values.thresholdFixed,
        thresholdType: 'fixed',
        result: values.result,
        isValid: values.isValid,
      };

      const resp = await createRule(insertData);
      ElMessage.success(resp);
    }
    if (isAddDataSource.value) {
      const insertData = {
        lineNo: values.lineNo,
        ruleName: values.ruleName,
        dataSourceNo: values.dataSourceNo,
        cond: values.cond,
        threshold: values.thresholdDataSource,
        thresholdType: 'dataSource',
        result: values.result,
        isValid: values.isValid,
      };

      const resp = await createRule(insertData);
      ElMessage.success(resp);
    }

    if (isEditFixed.value) {
      const updateData = {
        id: currentEditing.value?.id,
        lineNo: values.lineNo,
        ruleName: values.ruleName,
        ruleNo: currentEditing.value?.ruleNo,
        dataSourceNo: values.dataSourceNo,
        cond: values.cond,
        threshold: values.thresholdFixed,
        thresholdType: 'fixed',
        result: values.result,
        isValid: values.isValid,
        version: currentEditing.value?.version,
        createAt: currentEditing.value?.createAt,
      };

      const resp = await updateRule(updateData);
      ElMessage.success(resp);
    }
    if (isEditDataSource.value) {
      const updateData = {
        id: currentEditing.value?.id,
        lineNo: values.lineNo,
        ruleName: values.ruleName,
        ruleNo: currentEditing.value?.ruleNo,
        dataSourceNo: values.dataSourceNo,
        cond: values.cond,
        threshold: values.thresholdDataSource,
        thresholdType: 'dataSource',
        result: values.result,
        isValid: values.isValid,
        version: currentEditing.value?.version,
        createAt: currentEditing.value?.createAt,
      };

      const resp = await updateRule(updateData);
      ElMessage.success(resp);
    }
    insertDataSourceListOptions.value = [];
    preLineNo.value = '';

    // 关闭弹窗
    editDrawerVisible.value = false;

    // 刷新表格数据
    await gridApi.reload();

    // 重置表单
    await editFormApi.resetForm();
    currentEditing.value = null;
  } catch (error) {
    ElMessage.error('规则操作失败');
    console.error('规则操作失败:', error);
  }
}

// 重置
function handleResetEdit() {
  if (isAddFixed.value || isAddDataSource.value) {
    editFormApi.resetForm();
  }
  if (isEditFixed.value || isEditDataSource.value) {
    const data = {
      ...currentEditing.value,
      thresholdFixed: currentEditing.value?.threshold,
      thresholdDataSource: currentEditing.value?.threshold,
    };
    editFormApi.setValues(data || {});
  }
}

// 取消编辑
function handleCancelEdit() {
  editDrawerVisible.value = false;
  currentEditing.value = null;
  editFormApi.resetForm();
}

// 处理弹窗关闭
function handleDrawerClose(done: () => void) {
  handleCancelEdit();
  done();
}
</script>

<template>
  <Page description="规则管理">
    <div>
      <div class="w-full">
        <QueryForm />
      </div>
      <div class="mb-4 mt-4 flex justify-start pl-[15px]">
        <ElButton type="primary" @click="handleAddFixed" size="default">
          <i class="el-icon-plus mr-1"></i>
          新增值规则
        </ElButton>
        <ElButton type="primary" @click="handleAddSource" size="default">
          <i class="el-icon-plus mr-1"></i>
          新增源规则
        </ElButton>
      </div>
      <div class="mt-4">
        <Grid>
          <template #toolbar-tools></template>
        </Grid>
      </div>
    </div>

    <!-- 新增/编辑场景侧边弹窗 -->
    <ElDrawer
      v-model="editDrawerVisible"
      direction="rtl"
      size="500px"
      :before-close="handleDrawerClose"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">{{ drawerTitle }}</span>
        </div>
      </template>

      <EditForm @submit="handleSaveEdit" @reset="handleCancelEdit" />
    </ElDrawer>
  </Page>
</template>
