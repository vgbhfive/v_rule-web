<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { CustomParams, CustomInfo } from '#/api/product';

import { h, onMounted, ref } from 'vue';

import { Page, z } from '@vben/common-ui';

import { ElButton, ElDrawer, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDataSourceDropdownList } from '#/api/data';
import { getValueTypes } from '#/api/enums';
import {
  getCustomList,
  updateProductValid,
} from '#/api/product';
import { getLineDropdownList } from '#/api/system';

const lineMap = ref<Record<string, string>>({});
const lineOptions = ref<{ label: string; value: string }[]>([]);
const allValueMap = ref<Record<string, string>>({});
const allValueOptions = ref<{ label: string; value: string }[]>([]);

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
  allValueOptions.value = valueList.map((item) => ({
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
  },
  wrapperClass: 'grid-cols-3 grid-cols-4',
});

// 表单提交处理
async function onSubmit(values: CustomParams) {
  await gridApi.reload({ ...values });
}

// 表格配置
const gridOptions: VxeGridProps<CustomInfo> = {
  columns: [
    { type: 'seq', title: '序号', width: 50 },
    {
      field: 'lineNo',
      title: '业务线',
      slots: {
        default: ({ row }: { row: CustomInfo }) =>
          lineMap.value[row.lineNo] || row.lineNo,
      },
    },
    { field: 'productName', title: '名称' },
    { field: 'productNo', title: '编码' },
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
        default: ({ row: customInfo }: { row: CustomInfo }) => {
          const buttons = [
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                onClick: () => handleEdit(customInfo),
              },
              { default: () => '编辑' },
            ),
            h(
              ElButton,
              {
                type: 'info',
                size: 'small',
                onClick: () => handleInfo(customInfo),
              },
              { default: () => '详情' },
            ),
          ];

          if (customInfo.isValid === 0) {
            buttons.push(
              h(
                ElButton,
                {
                  type: 'success',
                  size: 'small',
                  onClick: () => handleValid(customInfo),
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
                  onClick: () => handleInvalid(customInfo),
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
        return await getCustomList(params);
      },
    },
  },
  sortConfig: {
    multiple: true,
  },
};

const gridEvents: VxeGridListeners<CustomInfo> = {
  // 可以添加表格事件监听
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 编辑弹窗状态
const editDrawerVisible = ref(false);
const currentEditing = ref<CustomInfo | null>(null);
const drawerTitle = ref('');
const preValueType = ref('');
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
        placeholder: '请输入利率产品名称',
      },
      fieldName: 'productName',
      label: '利率产品名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入利率产品编码',
        disabled: true,
      },
      fieldName: 'productNo',
      label: '利率产品编码',
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
async function handleInfo(row: CustomInfo) {
  drawerTitle.value = '自定义产品详情';
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  const values = {
    ...row,
    valueFixed: row.value,
    valueDataSource: row.value,
  };
  if (values.valueType === 'dataSource') {
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
      fieldName: 'valueType',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'valueFixed',
      componentProps: {
        disabled: true,
      },
      hide: !(row.valueType === 'fixed'),
    },
    {
      fieldName: 'valueDataSource',
      componentProps: {
        disabled: true,
      },
      hide: !(row.valueType === 'dataSource'),
    },
    {
      fieldName: 'unit',
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
  drawerTitle.value = '新增自定义产品';
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
      fieldName: 'valueType',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'valueFixed',
      componentProps: {
        disabled: false,
      },
      hide: false,
    },
    {
      fieldName: 'valueDataSource',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'unit',
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
async function handleEdit(row: CustomInfo) {
  drawerTitle.value = '编辑自定义产品';
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  const values = {
    ...row,
    valueFixed: row.value,
    valueDataSource: row.value,
  };
  if (values.valueType === 'dataSource') {
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
      hide: true,
    },
    {
      fieldName: 'valueType',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'valueFixed',
      componentProps: {
        disabled: false,
      },
      hide: !(row.valueType === 'fixed'),
    },
    {
      fieldName: 'valueDataSource',
      componentProps: {
        disabled: false,
      },
      hide: !(row.valueType === 'dataSource'),
    },
    {
      fieldName: 'unit',
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
  preValueType.value = row.valueType;
  editDrawerVisible.value = true;
}

// 生效
async function handleValid(row: CustomInfo) {
  try {
    const data = { id: row.id, isValid: 1 };
    const resp = await updateProductValid(data);
    ElMessage.success(resp);

    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 失效
async function handleInvalid(row: CustomInfo) {
  try {
    const data = { id: row.id, isValid: 0 };
    const resp = await updateProductValid(data);
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
    values.valueType &&
    values.valueType !== preValueType.value
  ) {
    if (
      values.valueType === 'fixed' &&
      values.valueType !== preValueType.value
    ) {
      editFormApi.updateSchema([
        {
          fieldName: 'valueFixed',
          componentProps: {
            disabled: false,
          },
          hide: false,
        },
        {
          fieldName: 'valueDataSource',
          componentProps: {
            disabled: false,
          },
          hide: true,
        },
      ]);
      editFormApi.setFieldValue('valueFixed', '');
    } else if (
      values.valueType === 'dataSource' &&
      values.valueType !== preValueType.value
    ) {
      editFormApi.updateSchema([
        {
          fieldName: 'valueFixed',
          componentProps: {
            disabled: false,
          },
          hide: true,
        },
        {
          fieldName: 'valueDataSource',
          componentProps: {
            disabled: false,
          },
          hide: false,
        },
      ]);
      editFormApi.setFieldValue('valueDataSource', '');
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
    preValueType.value = values.valueType;
  }
}

// 保存
async function handleSaveEdit(values: any) {
  try {
    if (isAdd.value) {
      const insertData = {
        lineNo: values.lineNo,
        productName: values.productName,
        valueType: values.valueType,
        value:
          values.valueType === 'fixed'
            ? values.valueFixed
            : values.valueDataSource,
        unit: values.unit,
        remark: values.remark,
        isValid: values.isValid,
      };
      console.log(insertData);
    }

    if (isEdit.value) {
      const updateData = {
        id: currentEditing.value?.id,
        lineNo: values.lineNo,
        productName: values.productName,
        productNo: currentEditing.value?.productNo,
        valueType: values.valueType,
        value:
          values.valueType === 'fixed'
            ? values.valueFixed
            : values.valueDataSource,
        unit: values.unit,
        remark: values.remark,
        version: currentEditing.value?.version,
        isValid: values.isValid,
      };
      console.log(updateData);
    }

    // 关闭弹窗
    editDrawerVisible.value = false;

    // 刷新表格数据
    await gridApi.reload();

    // 重置表单
    await editFormApi.resetForm();
    currentEditing.value = null;
  } catch (error) {
    ElMessage.error('自定义产品操作失败');
    console.error('自定义产品操作失败:', error);
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
      valueFixed: currentEditing.value?.value,
      valueDataSource: currentEditing.value?.value,
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
  <Page description="自定义产品管理">
    <div>
      <div class="w-full">
        <QueryForm />
      </div>
      <div class="mb-4 mt-4 flex justify-start pl-[15px]">
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
