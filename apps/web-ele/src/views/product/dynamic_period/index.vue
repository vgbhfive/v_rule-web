<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { DynamicPeriodInfo, DynamicPeriodParams } from '#/api/product';

import { h, onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, z } from '@vben/common-ui';

import { ElButton, ElDrawer, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDataSourceDropdownList } from '#/api/data';
import { getPeriodTypes, getValueTypes } from '#/api/enums';
import {
  createDynamicPeriod,
  getDynamicPeriodList,
  updateDynamicPeriod,
  updateDynamicPeriodValid,
} from '#/api/product';
import { getLineDropdownList } from '#/api/system';

const { hasAccessByCodes } = useAccess();

const lineMap = ref<Record<string, string>>({});
const lineOptions = ref<{ label: string; value: string }[]>([]);
const dataSourceMap = ref<Record<string, string>>({});
const allValueMap = ref<Record<string, string>>({});
const allValueOptions = ref<{ label: string; value: string }[]>([]);
const periodTypeMap = ref<Record<string, string>>({});
const periodTypeOptions = ref<{ label: string; value: string }[]>([]);

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

  // 数据源
  const dataSourceList = await getDataSourceDropdownList({ lineNo: '' });
  const newDataSourceMap: Record<string, string> = {};
  for (const item of dataSourceList) {
    newDataSourceMap[item.value] = item.key;
  }
  dataSourceMap.value = newDataSourceMap;

  // 阈值类型
  const valueList = await getValueTypes();
  const newValueMap: Record<string, string> = {};
  for (const item of valueList) {
    newValueMap[item.type] = item.name;
  }
  allValueMap.value = newValueMap;
  allValueOptions.value = valueList.map((item) => ({
    label: item.name,
    value: item.type,
  }));

  // 账期类型
  const periodList = await getPeriodTypes();
  const newPeriodMap: Record<string, string> = {};
  for (const item of periodList) {
    newPeriodMap[item.type] = item.name;
  }
  periodTypeMap.value = newPeriodMap;
  periodTypeOptions.value = periodList.map((item) => ({
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
        placeholder: '产品名称',
        clearable: true,
      },
      fieldName: 'productName',
      label: '名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '产品编码',
        clearable: true,
      },
      fieldName: 'productNo',
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
    show: hasAccessByCodes(['product_dynamic_period_manage']),
  },
  wrapperClass: 'grid-cols-3 grid-cols-4',
});

// 表单提交处理
async function onSubmit(values: DynamicPeriodParams) {
  await gridApi.reload({ ...values });
}

// 表格配置
const gridOptions: VxeGridProps<DynamicPeriodInfo> = {
  columns: [
    { type: 'seq', title: '序号', width: 50 },
    {
      field: 'lineNo',
      title: '业务线',
      slots: {
        default: ({ row }: { row: DynamicPeriodInfo }) =>
          lineMap.value[row.lineNo] || row.lineNo,
      },
    },
    { field: 'productName', title: '名称' },
    { field: 'productNo', title: '编码' },
    {
      field: 'startPeriod',
      title: '起始值',
      slots: {
        default: ({ row }: { row: DynamicPeriodInfo }) =>
          dataSourceMap.value[row.startPeriod] || row.startPeriod,
      },
    },
    {
      field: 'endPeriod',
      title: '截止值',
      slots: {
        default: ({ row }: { row: DynamicPeriodInfo }) =>
          dataSourceMap.value[row.endPeriod] || row.endPeriod,
      },
    },
    {
      field: 'periodStep',
      title: '步长',
      slots: {
        default: ({ row }: { row: DynamicPeriodInfo }) =>
          dataSourceMap.value[row.periodStep] || row.periodStep,
      },
    },
    {
      field: 'periodType',
      title: '单位',
      slots: {
        default: ({ row }: { row: DynamicPeriodInfo }) =>
          periodTypeMap.value[row.periodType] || row.periodType,
      },
    },
    { field: 'remark', title: '备注', width: 130 },
    {
      field: 'isValid',
      title: '状态',
      width: 80,
      formatter: ({ cellValue }) => {
        return cellValue === 1 ? '生效' : '失效';
      },
    },
    { field: 'createAt', title: '创建时间' },
    {
      title: '操作',
      width: 200,
      slots: {
        default: ({ row: dynamicPeriodInfo }: { row: DynamicPeriodInfo }) => {
          const buttons = [];

          if (hasAccessByCodes(['product_dynamic_period_manage_update'])) {
            buttons.push(
              h(
                ElButton,
                {
                  type: 'primary',
                  size: 'small',
                  onClick: () => handleEdit(dynamicPeriodInfo),
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
                onClick: () => handleInfo(dynamicPeriodInfo),
              },
              { default: () => '详情' },
            ),
          );

          if (hasAccessByCodes(['product_dynamic_period_manage_valid'])) {
            if (dynamicPeriodInfo.isValid === 0) {
              buttons.push(
                h(
                  ElButton,
                  {
                    type: 'success',
                    size: 'small',
                    onClick: () => handleValid(dynamicPeriodInfo),
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
                    onClick: () => handleInvalid(dynamicPeriodInfo),
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
        return await getDynamicPeriodList(params);
      },
    },
  },
  sortConfig: {
    multiple: true,
  },
};

const gridEvents: VxeGridListeners<DynamicPeriodInfo> = {
  // 可以添加表格事件监听
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 编辑弹窗状态
const editDrawerVisible = ref(false);
const currentEditing = ref<DynamicPeriodInfo | null>(null);
const drawerTitle = ref('');
const preStartValueType = ref('');
const preEndValueType = ref('');
const preStepValueType = ref('');
const isAdd = ref(false);
const isEdit = ref(false);
const dataSourceOptions = ref<{ label: string; value: string }[]>([]);

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
        placeholder: '请输入动态账期产品名称',
      },
      fieldName: 'productName',
      label: '动态账期产品名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入动态账期产品编码',
        disabled: true,
      },
      fieldName: 'productNo',
      label: '动态账期产品编码',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: allValueOptions,
        placeholder: '请选择值类型',
        disabled: true,
      },
      fieldName: 'startValueType',
      label: '起始值类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入值',
        disabled: true,
      },
      fieldName: 'startValueFixed',
      label: '起始值',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: dataSourceOptions,
        placeholder: '请输入值',
        disabled: true,
      },
      fieldName: 'startValueDataSource',
      label: '起始值',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: allValueOptions,
        placeholder: '请选择值类型',
        disabled: true,
      },
      fieldName: 'endValueType',
      label: '截止值类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入值',
        disabled: true,
      },
      fieldName: 'endValueFixed',
      label: '截止值',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: dataSourceOptions,
        placeholder: '请输入值',
        disabled: true,
      },
      fieldName: 'endValueDataSource',
      label: '截止值',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: allValueOptions,
        placeholder: '请选择值类型',
        disabled: true,
      },
      fieldName: 'stepValueType',
      label: '步长值类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入值',
        disabled: true,
      },
      fieldName: 'stepValueFixed',
      label: '步长值',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: dataSourceOptions,
        placeholder: '请输入值',
        disabled: true,
      },
      fieldName: 'stepValueDataSource',
      label: '步长值',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: periodTypeOptions,
        placeholder: '请输入值单位',
        disabled: true,
      },
      fieldName: 'periodType',
      label: '账期类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        type: 'textarea',
        placeholder: '请输入备注',
        disabled: true,
        rows: 3,
      },
      fieldName: 'remark',
      label: '备注',
      rules: z
        .string()
        .trim()
        .min(0, '请输入备注')
        .max(100, '备注最多100个字符'),
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
async function handleInfo(row: DynamicPeriodInfo) {
  drawerTitle.value = '动态账期产品详情';
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  const values = {
    ...row,
    startValueType: row.startPeriodType,
    startValueFixed: row.startPeriod,
    startValueDataSource: row.startPeriod,
    endValueType: row.endPeriodType,
    endValueFixed: row.endPeriod,
    endValueDataSource: row.endPeriod,
    stepValueType: row.periodStepType,
    stepValueFixed: row.periodStep,
    stepValueDataSource: row.periodStep,
  };
  if (
    values.startPeriodType === 'dataSource' ||
    values.endPeriodType === 'dataSource' ||
    values.periodStepType === 'dataSource'
  ) {
    const data = {
      lineNo: values.lineNo,
    };
    const dataSourceList = await getDataSourceDropdownList(data);
    dataSourceOptions.value = dataSourceList.map((item) => ({
      label: item.key,
      value: item.value,
    }));
  } else {
    dataSourceOptions.value = [];
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
      fieldName: 'productName',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'productNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'startValueType',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'startValueFixed',
      componentProps: {
        disabled: true,
      },
      hide: !(row.startPeriodType === 'fixed'),
    },
    {
      fieldName: 'startValueDataSource',
      componentProps: {
        disabled: true,
      },
      hide: !(row.startPeriodType === 'dataSource'),
    },
    {
      fieldName: 'endValueType',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'endValueFixed',
      componentProps: {
        disabled: true,
      },
      hide: !(row.endPeriodType === 'fixed'),
    },
    {
      fieldName: 'endValueDataSource',
      componentProps: {
        disabled: true,
      },
      hide: !(row.endPeriodType === 'dataSource'),
    },

    {
      fieldName: 'stepValueType',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'stepValueFixed',
      componentProps: {
        disabled: true,
      },
      hide: !(row.periodStepType === 'fixed'),
    },
    {
      fieldName: 'stepValueDataSource',
      componentProps: {
        disabled: true,
      },
      hide: !(row.periodStepType === 'dataSource'),
    },
    {
      fieldName: 'periodType',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'remark',
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
  drawerTitle.value = '新增动态账期产品';
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
      fieldName: 'productName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'productNo',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'startValueType',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'startValueFixed',
      componentProps: {
        disabled: false,
      },
      hide: false,
    },
    {
      fieldName: 'startValueDataSource',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'endValueType',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'endValueFixed',
      componentProps: {
        disabled: false,
      },
      hide: false,
    },
    {
      fieldName: 'endValueDataSource',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'stepValueType',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'stepValueFixed',
      componentProps: {
        disabled: false,
      },
      hide: false,
    },
    {
      fieldName: 'stepValueDataSource',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'periodType',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'remark',
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
async function handleEdit(row: DynamicPeriodInfo) {
  drawerTitle.value = '编辑动态账期产品';
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  const values = {
    ...row,
    startValueType: row.startPeriodType,
    startValueFixed: row.startPeriod,
    startValueDataSource: row.startPeriod,
    endValueType: row.endPeriodType,
    endValueFixed: row.endPeriod,
    endValueDataSource: row.endPeriod,
    stepValueType: row.periodStepType,
    stepValueFixed: row.periodStep,
    stepValueDataSource: row.periodStep,
  };
  if (
    values.startPeriodType === 'dataSource' ||
    values.endPeriodType === 'dataSource' ||
    values.periodStepType === 'dataSource'
  ) {
    const data = {
      lineNo: values.lineNo,
    };
    const dataSourceList = await getDataSourceDropdownList(data);
    dataSourceOptions.value = dataSourceList.map((item) => ({
      label: item.key,
      value: item.value,
    }));
  } else {
    dataSourceOptions.value = [];
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
      fieldName: 'productName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'productNo',
      componentProps: {
        disabled: true,
      },
      hide: false,
    },
    {
      fieldName: 'startValueType',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'startValueFixed',
      componentProps: {
        disabled: false,
      },
      hide: !(row.startPeriodType === 'fixed'),
    },
    {
      fieldName: 'startValueDataSource',
      componentProps: {
        disabled: false,
      },
      hide: !(row.startPeriodType === 'dataSource'),
    },
    {
      fieldName: 'endValueType',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'endValueFixed',
      componentProps: {
        disabled: false,
      },
      hide: !(row.endPeriodType === 'fixed'),
    },
    {
      fieldName: 'endValueDataSource',
      componentProps: {
        disabled: false,
      },
      hide: !(row.endPeriodType === 'dataSource'),
    },

    {
      fieldName: 'stepValueType',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'stepValueFixed',
      componentProps: {
        disabled: false,
      },
      hide: !(row.periodStepType === 'fixed'),
    },
    {
      fieldName: 'stepValueDataSource',
      componentProps: {
        disabled: false,
      },
      hide: !(row.periodStepType === 'dataSource'),
    },
    {
      fieldName: 'periodType',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'remark',
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
  preStartValueType.value = row.startPeriodType;
  preEndValueType.value = row.endPeriodType;
  preStepValueType.value = row.periodStepType;
  editDrawerVisible.value = true;
}

// 生效
async function handleValid(row: DynamicPeriodInfo) {
  try {
    const data = { id: row.id, isValid: 1 };
    const resp = await updateDynamicPeriodValid(data);
    ElMessage.success(resp);

    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 失效
async function handleInvalid(row: DynamicPeriodInfo) {
  try {
    const data = { id: row.id, isValid: 0 };
    const resp = await updateDynamicPeriodValid(data);
    ElMessage.success(resp);

    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 值变化
async function handleValuesChange(values: any) {
  if (
    (isAdd.value || isEdit.value) &&
    values.startValueType &&
    values.startValueType !== preStartValueType.value
  ) {
    // 起始值
    if (
      values.startValueType === 'fixed' &&
      values.startValueType !== preStartValueType.value
    ) {
      editFormApi.updateSchema([
        {
          fieldName: 'startValueFixed',
          componentProps: {
            disabled: false,
          },
          hide: false,
        },
        {
          fieldName: 'startValueDataSource',
          componentProps: {
            disabled: false,
          },
          hide: true,
        },
      ]);
      editFormApi.setFieldValue('startValueFixed', '');
    } else if (
      values.startValueType === 'dataSource' &&
      values.startValueType !== preStartValueType.value
    ) {
      editFormApi.updateSchema([
        {
          fieldName: 'startValueFixed',
          componentProps: {
            disabled: false,
          },
          hide: true,
        },
        {
          fieldName: 'startValueDataSource',
          componentProps: {
            disabled: false,
          },
          hide: false,
        },
      ]);
      editFormApi.setFieldValue('startValueDataSource', '');
      if (values.lineNo) {
        const data = {
          lineNo: values.lineNo,
        };
        const dataSourceList = await getDataSourceDropdownList(data);
        dataSourceOptions.value = dataSourceList.map((item) => ({
          label: item.key,
          value: item.value,
        }));
      } else {
        dataSourceOptions.value = [];
      }
    }
    preStartValueType.value = values.startValueType;
  }

  // 截止值
  if (
    (isAdd.value || isEdit.value) &&
    values.endValueType &&
    values.endValueType !== preEndValueType.value
  ) {
    if (
      values.endValueType === 'fixed' &&
      values.endValueType !== preEndValueType.value
    ) {
      editFormApi.updateSchema([
        {
          fieldName: 'endValueFixed',
          componentProps: {
            disabled: false,
          },
          hide: false,
        },
        {
          fieldName: 'endValueDataSource',
          componentProps: {
            disabled: false,
          },
          hide: true,
        },
      ]);
      editFormApi.setFieldValue('endValueFixed', '');
    } else if (
      values.endValueType === 'dataSource' &&
      values.endValueType !== preEndValueType.value
    ) {
      editFormApi.updateSchema([
        {
          fieldName: 'endValueFixed',
          componentProps: {
            disabled: false,
          },
          hide: true,
        },
        {
          fieldName: 'endValueDataSource',
          componentProps: {
            disabled: false,
          },
          hide: false,
        },
      ]);
      editFormApi.setFieldValue('endValueDataSource', '');
      if (values.lineNo) {
        const data = {
          lineNo: values.lineNo,
        };
        const dataSourceList = await getDataSourceDropdownList(data);
        dataSourceOptions.value = dataSourceList.map((item) => ({
          label: item.key,
          value: item.value,
        }));
      } else {
        dataSourceOptions.value = [];
      }
    }
    preEndValueType.value = values.endValueType;
  }

  // 步进值类型
  if (
    (isAdd.value || isEdit.value) &&
    values.stepValueType &&
    values.stepValueType !== preStepValueType.value
  ) {
    if (
      values.stepValueType === 'fixed' &&
      values.stepValueType !== preStepValueType.value
    ) {
      editFormApi.updateSchema([
        {
          fieldName: 'stepValueFixed',
          componentProps: {
            disabled: false,
          },
          hide: false,
        },
        {
          fieldName: 'stepValueDataSource',
          componentProps: {
            disabled: false,
          },
          hide: true,
        },
      ]);
      editFormApi.setFieldValue('stepValueFixed', '');
    } else if (
      values.stepValueType === 'dataSource' &&
      values.stepValueType !== preStepValueType.value
    ) {
      editFormApi.updateSchema([
        {
          fieldName: 'stepValueFixed',
          componentProps: {
            disabled: false,
          },
          hide: true,
        },
        {
          fieldName: 'stepValueDataSource',
          componentProps: {
            disabled: false,
          },
          hide: false,
        },
      ]);
      editFormApi.setFieldValue('stepValueDataSource', '');
      if (values.lineNo) {
        const data = {
          lineNo: values.lineNo,
        };
        const dataSourceList = await getDataSourceDropdownList(data);
        dataSourceOptions.value = dataSourceList.map((item) => ({
          label: item.key,
          value: item.value,
        }));
      } else {
        dataSourceOptions.value = [];
      }
    }
    preStepValueType.value = values.stepValueType;
  }
}

// 保存
async function handleSaveEdit(values: any) {
  try {
    if (isAdd.value) {
      const insertData = {
        lineNo: values.lineNo,
        productName: values.productName,
        type: 'dynamic_period',
        startPeriodType: values.startValueType,
        startPeriod:
          values.startValueType === 'fixed'
            ? values.startValueFixed
            : values.startValueDataSource,
        endPeriodType: values.endValueType,
        endPeriod:
          values.endValueType === 'fixed'
            ? values.endValueFixed
            : values.endValueDataSource,
        periodStepType: values.stepValueType,
        periodStep:
          values.stepValueType === 'fixed'
            ? values.stepValueFixed
            : values.stepValueDataSource,
        periodType: values.periodType,
        remark: values.remark,
        isValid: values.isValid,
      };
      const resp = await createDynamicPeriod(insertData);
      ElMessage.success(resp);
    }

    if (isEdit.value) {
      const updateData = {
        id: currentEditing.value?.id,
        lineNo: values.lineNo,
        productName: values.productName,
        productNo: currentEditing.value?.productNo,
        type: 'dynamic_period',
        startPeriodType: values.startValueType,
        startPeriod:
          values.startValueType === 'fixed'
            ? values.startValueFixed
            : values.startValueDataSource,
        endPeriodType: values.endValueType,
        endPeriod:
          values.endValueType === 'fixed'
            ? values.endValueFixed
            : values.endValueDataSource,
        periodStepType: values.stepValueType,
        periodStep:
          values.stepValueType === 'fixed'
            ? values.stepValueFixed
            : values.stepValueDataSource,
        periodType: values.periodType,
        remark: values.remark,
        version: currentEditing.value?.version,
        isValid: values.isValid,
      };
      const resp = await updateDynamicPeriod(updateData);
      ElMessage.success(resp);
    }

    // 关闭弹窗
    editDrawerVisible.value = false;

    // 刷新表格数据
    await gridApi.reload();

    // 重置表单
    await editFormApi.resetForm();
    currentEditing.value = null;
  } catch (error) {
    ElMessage.error('动态账期操作失败');
    console.error('动态账期操作失败:', error);
  }
}

// 重置
async function handleResetEdit() {
  if (isAdd.value) {
    editFormApi.resetForm();
  }
  if (isEdit.value) {
    const data = {
      ...currentEditing.value,
      startLimitFixed: currentEditing.value?.startLimit,
      startLimitDataSource: currentEditing.value?.startLimit,
    };
    editFormApi.setValues(data || {});
  }
}

// 取消编辑
function handleCancelEdit() {
  editDrawerVisible.value = false;
  currentEditing.value = null;
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
  <Page description="产品动态账期管理">
    <div>
      <div class="w-full">
        <QueryForm />
      </div>
      <div
        class="mb-4 mt-4 flex justify-start pl-[15px]"
        v-if="hasAccessByCodes(['product_dynamic_period_manage_create'])"
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

    <!-- 新增/编辑动态账期侧边弹窗 -->
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
