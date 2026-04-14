<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { RuleTreeInfo, RuleTreeParams } from '#/api/rule/ruleTree';

import { h, onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { ElButton, ElDrawer, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getCombineTypes,
  getResultTypes,
  getRuleSetConditionTypes,
  getRuleTypes,
} from '#/api/enums';
import { getRuleDropdownList } from '#/api/rule';
import { getRuleSetDropdownList } from '#/api/rule/ruleSet';
import {
  getRuleTreeList,
  updateRuleTreeValid,
  createRuleTree,
  updateRuleTree,
} from '#/api/rule/ruleTree';
import { getLineDropdownList } from '#/api/system';

const { hasAccessByCodes } = useAccess();

const lineMap = ref<Record<string, string>>({});
const lineOptions = ref<{ label: string; value: string }[]>([]);
const ruleTypeOptions = ref<{ label: string; value: string }[]>([]);
const combineTypeOptions = ref<{ label: string; value: string }[]>([]);
const conditionTypeOptions = ref<{ label: string; value: string }[]>([]);
const resultTypeOptions = ref<{ label: string; value: string }[]>([]);
const insertRuleOptions = ref<{ label: string; value: string }[]>([]);
const insertRuleSetOptions = ref<{ label: string; value: string }[]>([]);

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

  // 规则类型
  const ruleTypeList = await getRuleTypes();
  ruleTypeOptions.value = ruleTypeList.map((item) => ({
    label: item.name,
    value: item.key,
  }));

  // 联合条件
  const combineTypeList = await getCombineTypes();
  combineTypeOptions.value = combineTypeList.map((item) => ({
    label: item.name,
    value: item.value,
  }));

  // 条件
  const conditionList = await getRuleSetConditionTypes();
  conditionTypeOptions.value = conditionList.map((item) => ({
    label: item.name,
    value: item.value,
  }));

  // 结果类型
  const resultTypeList = await getResultTypes();
  resultTypeOptions.value = resultTypeList.map((item) => ({
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
        placeholder: '规则树名称',
        clearable: true,
      },
      fieldName: 'ruleTreeName',
      label: '名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '规则树编码',
        clearable: true,
      },
      fieldName: 'ruleTreeNo',
      label: '编码',
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
    show: hasAccessByCodes(['rule_tree_manage']),
  },
  wrapperClass: 'grid-cols-3 grid-cols-4',
});

// 表单提交处理
async function onSubmit(values: RuleTreeParams) {
  await gridApi.reload({ ...values });
}

// 表格配置
const gridOptions: VxeGridProps<RuleTreeInfo> = {
  columns: [
    { type: 'seq', title: '序号', width: 50 },
    {
      field: 'lineNo',
      title: '业务线',
      slots: {
        default: ({ row }: { row: RuleTreeInfo }) =>
          lineMap.value[row.lineNo] || row.lineNo,
      },
    },
    { field: 'ruleTreeName', title: '名称' },
    { field: 'ruleTreeNo', title: '编码' },
    { field: 'cond', title: '条件', width: 50 },
    { field: 'threshold', title: '阈值', width: 80 },
    { field: 'result', title: '结果', width: 80 },
    {
      field: 'isValid',
      title: '状态',
      width: 50,
      formatter: ({ cellValue }) => {
        return cellValue === 1 ? '生效' : '失效';
      },
    },
    { field: 'deployAt', title: '上线时间' },
    {
      title: '操作',
      width: 200,
      slots: {
        default: ({ row: ruleTreeInfo }: { row: RuleTreeInfo }) => {
          const buttons = [];

          if (hasAccessByCodes(['rule_tree_manage_update'])) {
            buttons.push(
              h(
                ElButton,
                {
                  type: 'primary',
                  size: 'small',
                  onClick: () => handleEdit(ruleTreeInfo),
                },
                { default: () => '编辑' },
              ),
            );
          }

          buttons.push(
            h(
              ElButton,
              {
                type: 'info',
                size: 'small',
                onClick: () => handleInfo(ruleTreeInfo),
              },
              { default: () => '详情' },
            ),
          );

          if (hasAccessByCodes(['rule_tree_manage_valid'])) {
            if (ruleTreeInfo.isValid === 0) {
              buttons.push(
                h(
                  ElButton,
                  {
                    type: 'success',
                    size: 'small',
                    onClick: () => handleValid(ruleTreeInfo),
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
                    onClick: () => handleInvalid(ruleTreeInfo),
                  },
                  { default: () => '失效' },
                ),
              );
            }
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
        return await getRuleTreeList(params);
      },
    },
  },
  sortConfig: {
    multiple: true,
  },
};

const gridEvents: VxeGridListeners<RuleTreeInfo> = {
  // 可以添加表格事件监听
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 编辑弹窗状态
const editDrawerVisible = ref(false);
const currentEditing = ref<null | RuleTreeInfo>(null);
const drawerTitle = ref('');
const firstNoOptions = ref<{ label: string; value: string }[]>([]);
const secondNoOptions = ref<{ label: string; value: string }[]>([]);
const preLineNo = ref('');
const isAdd = ref(false);
const isEdit = ref(false);

// 新增/编辑/详情表单配置
const [EditForm, editFormApi] = useVbenForm({
  collapsed: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleValuesChange,
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
        placeholder: '请输入规则树名称',
      },
      fieldName: 'ruleTreeName',
      label: '规则树名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入规则树编码',
        disabled: true,
      },
      fieldName: 'ruleTreeNo',
      label: '规则树编码',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: conditionTypeOptions,
        placeholder: '请输入条件',
        disabled: true,
      },
      fieldName: 'cond',
      label: '条件',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: resultTypeOptions,
        placeholder: '请输入阈值',
        disabled: true,
      },
      fieldName: 'threshold',
      label: '阈值',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: resultTypeOptions,
        placeholder: '请输入结果',
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
function handleInfo(row: RuleTreeInfo) {
  drawerTitle.value = '规则树详情';
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  editFormApi.setValues(row);
  // 设置全部字段不可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'lineNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'ruleSetName',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'ruleSetNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'firstType',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'firstNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'combine',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'secondType',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'secondNo',
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
      fieldName: 'threshold',
      componentProps: {
        disabled: true,
      },
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

// 新增
function handleAdd() {
  drawerTitle.value = '新增规则树';
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
      fieldName: 'ruleTreeName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'ruleTreeNo',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'cond',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'threshold',
      componentProps: {
        disabled: false,
      },
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
  isAdd.value = true;
  isEdit.value = false;
  editDrawerVisible.value = true;
}

// 编辑
function handleEdit(row: RuleTreeInfo) {
  drawerTitle.value = '编辑规则树';
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  editFormApi.setValues(row);
  // 设置部分字段不可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'lineNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'ruleTreeName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'ruleTreeNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'cond',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'threshold',
      componentProps: {
        disabled: false,
      },
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
  isAdd.value = false;
  isEdit.value = true;
  editDrawerVisible.value = true;
}

// 生效
async function handleValid(row: RuleTreeInfo) {
  try {
    const data = { id: row.id, isValid: 1 };
    const resp = await updateRuleTreeValid(data);
    ElMessage.success(resp);

    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 失效
async function handleInvalid(row: RuleTreeInfo) {
  try {
    const data = { id: row.id, isValid: 0 };
    const resp = await updateRuleTreeValid(data);
    ElMessage.success(resp);

    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 值变化
async function handleValuesChange(values: any) {
  console.log(values);
}

// 保存
async function handleSaveEdit(values: any) {
  try {
    if (isAdd.value) {
      const insertData = {
        lineNo: values.lineNo,
        ruleTreeName: values.ruleTreeName,
        cond: values.cond,
        threshold: values.threshold,
        result: values.result,
        isValid: values.isValid,
        detailEntityList: []
      };

      const resp = await createRuleTree(insertData);
      ElMessage.success(resp);
    }

    if (isEdit.value) {
      const updateData = {
        id: currentEditing.value?.id,
        lineNo: values.lineNo,
        ruleTreeName: values.ruleTreeName,
        ruleTreeNo: currentEditing.value?.ruleTreeNo,
        cond: values.cond,
        threshold: values.threshold,
        result: values.result,
        isValid: values.isValid,
        version: currentEditing.value?.version,
        createAt: currentEditing.value?.createAt,
        detailEntityList: []
      };

      const resp = await updateRuleTree(updateData);
      ElMessage.success(resp);
    }

    // 关闭弹窗
    editDrawerVisible.value = false;

    // 刷新表格数据
    await gridApi.reload();

    // 重置表单
    await editFormApi.resetForm();
    currentEditing.value = null;
    isAdd.value = false;
    isEdit.value = false;
  } catch (error) {
    ElMessage.error('规则集操作失败');
    console.error('规则集操作失败:', error);
  }
}

// 重置
function handleResetEdit() {
  if (isAdd.value) {
    editFormApi.resetForm();
  }
  if (isEdit.value) {
    editFormApi.setValues(currentEditing.value || {});
    handleValuesChange(currentEditing.value);
  }
}

// 取消编辑
function handleCancelEdit() {
  editDrawerVisible.value = false;
  currentEditing.value = null;
  preLineNo.value = '';
  isAdd.value = false;
  isEdit.value = false;
  editFormApi.resetForm();
}

// 处理弹窗关闭
function handleDrawerClose(done: () => void) {
  handleCancelEdit();
  done();
}
</script>

<template>
  <Page description="规则集管理">
    <div>
      <div class="w-full">
        <QueryForm />
      </div>
      <div
        class="mb-4 mt-4 flex justify-start pl-[15px]"
        v-if="hasAccessByCodes(['rule_tree_manage_create'])"
      >
        <ElButton type="primary" @click="handleAdd" size="default">
          <i class="el-icon-plus mr-1"></i>
          新增
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
