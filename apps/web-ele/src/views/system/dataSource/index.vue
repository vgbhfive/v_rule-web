<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { DataSourceInfo, DataSourceParams } from '#/api/system';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElDrawer, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getFieldTypes } from '#/api';
import {
  createDataSource,
  getDataCategoryDropdownList,
  getDataSourceList,
  getLineDropdownList,
  updateDataSource,
  updateDataSourceValid,
} from '#/api/system';

const lineMap = ref<Record<string, string>>({});
const fieldTypeMap = ref<Record<string, string>>({});
const allDataCategoryMap = ref<Record<string, string>>({});
const lineOptions = ref<{ label: string; value: string }[]>([]);
const fieldTypeOptions = ref<{ label: string; value: string }[]>([]);
const queryDataCategoryOptions = ref<{ label: string; value: string }[]>([]);
const allDataCategoryOptions = ref<{ label: string; value: string }[]>([]);
const preQueryLineNo = ref('');

onMounted(async () => {
  // 业务线
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

  // 数据源类型
  const fieldTypes = await getFieldTypes();
  const newFieldTypeMap: Record<string, string> = {};
  for (const item of fieldTypes) {
    newFieldTypeMap[item.type] = item.name;
  }
  fieldTypeMap.value = newFieldTypeMap;
  fieldTypeOptions.value = fieldTypes.map((item) => ({
    label: item.name,
    value: item.type,
  }));

  // 数据源分类
  const dataCategoryList = await getDataCategoryDropdownList({
    lineNo: null,
  });
  const newAllDataCategoryMap: Record<string, string> = {};
  for (const item of dataCategoryList) {
    newAllDataCategoryMap[item.value] = item.key;
  }
  allDataCategoryMap.value = newAllDataCategoryMap;
  allDataCategoryOptions.value = dataCategoryList.map((item) => ({
    label: item.key,
    value: item.value,
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
        placeholder: '数据源名称',
        clearable: true,
      },
      fieldName: 'dataSourceName',
      label: '名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '数据源编码',
        clearable: true,
      },
      fieldName: 'dataSourceNo',
      label: '编码',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '数据源字段',
        clearable: true,
      },
      fieldName: 'field',
      label: '字段',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: queryDataCategoryOptions,
        placeholder: '数据源分类',
        clearable: true,
      },
      fieldName: 'dataCategoryNo',
      label: '分类',
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
  handleValuesChange: onQueryChange,
  wrapperClass: 'grid-cols-3 grid-cols-4',
});

// 表单提交处理
async function onSubmit(values: DataSourceParams) {
  await gridApi.reload({ ...values });
}

async function onQueryChange(values: DataSourceParams) {
  if (values.lineNo && values.lineNo !== preQueryLineNo.value) {
    const list = await getDataCategoryDropdownList({
      lineNo: values.lineNo,
    });
    queryDataCategoryOptions.value = list.map((item) => ({
      label: item.key,
      value: item.value,
    }));
    preQueryLineNo.value = values.lineNo;
  }
}

// 表格配置
const gridOptions: VxeGridProps<DataSourceInfo> = {
  columns: [
    { type: 'seq', title: '序号', width: 50 },
    {
      field: 'lineNo',
      title: '业务线',
      slots: {
        default: ({ row }: { row: DataSourceInfo }) =>
          lineMap.value[row.lineNo] || row.lineNo,
      },
    },
    { field: 'dataSourceName', title: '名称' },
    { field: 'dataSourceNo', title: '编码' },
    { field: 'field', title: '字段' },
    {
      field: 'dataCategoryNo',
      title: '分类',
      slots: {
        default: ({ row }: { row: DataSourceInfo }) =>
          allDataCategoryMap.value[row.dataCategoryNo] || row.dataCategoryNo,
      },
    },
    {
      field: 'type',
      title: '类型',
      slots: {
        default: ({ row }: { row: DataSourceInfo }) =>
          fieldTypeMap.value[row.type] || row.type,
      },
    },
    {
      field: 'isValid',
      title: '状态',
      width: 80,
      formatter: ({ cellValue }) => {
        return cellValue === 1 ? '生效' : '失效';
      },
    },
    {
      title: '操作',
      width: 250,
      slots: {
        default: ({ row: dataSourceInfo }: { row: DataSourceInfo }) => {
          const buttons = [
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                onClick: () => handleEdit(dataSourceInfo),
              },
              { default: () => '编辑' },
            ),
            h(
              ElButton,
              {
                type: 'info',
                size: 'small',
                onClick: () => handleInfo(dataSourceInfo),
              },
              { default: () => '详情' },
            ),
          ];

          if (dataSourceInfo.isValid === 0) {
            buttons.push(
              h(
                ElButton,
                {
                  type: 'success',
                  size: 'small',
                  onClick: () => handleValid(dataSourceInfo),
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
                  onClick: () => handleInvalid(dataSourceInfo),
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
        return await getDataSourceList(params);
      },
    },
  },
  sortConfig: {
    multiple: true,
  },
};

const gridEvents: VxeGridListeners<DataSourceInfo> = {
  // 可以添加表格事件监听
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 编辑弹窗状态
const editDrawerVisible = ref(false);
const currentEditingId = ref<null | number>(null);
const drawerTitle = ref('');
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
  handleSubmit: handleSaveEdit,
  layout: 'vertical',
  schema: [
    {
      component: 'ApiSelect',
      componentProps: {
        options: lineOptions,
        placeholder: '请输入业务线名称',
      },
      fieldName: 'lineNo',
      label: '业务线名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入数据源名称',
      },
      fieldName: 'dataSourceName',
      label: '数据源名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入数据源编码',
        disabled: true,
      },
      fieldName: 'dataSourceNo',
      label: '数据源编码',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: allDataCategoryOptions,
        placeholder: '请输入数据分类',
      },
      fieldName: 'dataCategoryNo',
      label: '数据源分类',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: fieldTypeOptions,
        placeholder: '请输入数据源类型',
      },
      fieldName: 'type',
      label: '数据源类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入数据源字段',
        disabled: true,
      },
      fieldName: 'field',
      label: '字段',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '',
        disabled: true,
      },
      fieldName: 'format',
      label: '字段格式',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入版本',
        disabled: true,
      },
      fieldName: 'version',
      label: '版本',
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

// 场景详情
function handleInfo(row: DataSourceInfo) {
  drawerTitle.value = '数据源详情';
  currentEditingId.value = row.id;
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
      fieldName: 'dataSourceName',
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
      fieldName: 'dataCategoryNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'type',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'field',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'format',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'version',
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

// 新增场景
function handleAdd() {
  drawerTitle.value = '新增数据源';
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
      fieldName: 'dataSourceName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'dataSourceNo',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'dataCategoryNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'type',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'field',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'format',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'version',
      componentProps: {
        disabled: false,
      },
      hide: true,
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

// 编辑场景
function handleEdit(row: DataSourceInfo) {
  drawerTitle.value = '编辑数据源';
  currentEditingId.value = row.id;
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
      fieldName: 'dataSourceName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'dataSourceNo',
      componentProps: {
        disabled: true,
      },
      hide: false,
    },
    {
      fieldName: 'dataCategoryNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'type',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'field',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'format',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'version',
      componentProps: {
        disabled: true,
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

// 生效场景
async function handleValid(row: DataSourceInfo) {
  try {
    const data = { id: row.id, isValid: 1 };
    const resp = await updateDataSourceValid(data);
    ElMessage.success(resp);

    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 失效场景
async function handleInvalid(row: DataSourceInfo) {
  try {
    const data = { id: row.id, isValid: 0 };
    const resp = await updateDataSourceValid(data);
    ElMessage.success(resp);

    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 保存
async function handleSaveEdit(values: any) {
  try {
    if (isAdd.value) {
      const insertData = {
        lineNo: values.lineNo,
        dataSourceName: values.dataSourceName,
        dataCategoryNo: values.dataCategoryNo,
        type: values.type,
        field: values.field,
        format: values.format || '',
        isValid: values.isValid,
      };

      const resp = await createDataSource(insertData);
      ElMessage.success(resp);
    }

    if (isEdit.value) {
      const updateData = {
        id: currentEditingId.value,
        lineNo: values.lineNo,
        dataSourceName: values.dataSourceName,
        dataSourceNo: values.dataSourceNo,
        dataCategoryNo: values.dataCategoryNo,
        type: values.type,
        field: values.field,
        format: values.format || '',
        version: values.version,
        isValid: values.isValid,
      };

      const resp = await updateDataSource(updateData);
      ElMessage.success(resp);
    }

    // 关闭弹窗
    editDrawerVisible.value = false;

    // 刷新表格数据
    await gridApi.reload();

    // 重置表单
    await editFormApi.resetForm();
    currentEditingId.value = null;
  } catch (error) {
    ElMessage.error('场景更新失败');
    console.error('场景更新失败:', error);
  }
}

// 取消编辑
function handleCancelEdit() {
  editDrawerVisible.value = false;
  currentEditingId.value = null;
  editFormApi.resetForm();
}

// 处理弹窗关闭
function handleDrawerClose(done: () => void) {
  handleCancelEdit();
  done();
}
</script>

<template>
  <Page description="数据源管理">
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
