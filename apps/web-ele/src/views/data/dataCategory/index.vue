<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { DataCategoryInfo, DataCategoryParams } from '#/api/system';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElDrawer, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCategoryTypes } from '#/api';
import {
  createDataCategory,
  getDataCategoryList,
  getLineDropdownList,
  updateDataCategory,
  updateDataCategoryValid,
} from '#/api/system';

const lineMap = ref<Record<string, string>>({});
const allCategoryMap = ref<Record<string, string>>({});
const lineOptions = ref<{ label: string; value: string }[]>([]);
const allCategoryOptions = ref<{ label: string; value: string }[]>([]);

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

  // 数据源分类类型
  const categoryList = await getCategoryTypes();
  const newCategoryMap: Record<string, string> = {};
  for (const item of categoryList) {
    newCategoryMap[item.type] = item.name;
  }
  allCategoryMap.value = newCategoryMap;
  allCategoryOptions.value = categoryList.map((item) => ({
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
        placeholder: '数据源分类名称',
        clearable: true,
      },
      fieldName: 'dataCategoryName',
      label: '名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '数据源分类编码',
        clearable: true,
      },
      fieldName: 'dataCategoryNo',
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
async function onSubmit(values: DataCategoryParams) {
  await gridApi.reload({ ...values });
}

// 表格配置
const gridOptions: VxeGridProps<DataCategoryInfo> = {
  columns: [
    { type: 'seq', title: '序号', width: 50 },
    {
      field: 'lineNo',
      title: '业务线名称',
      slots: {
        default: ({ row }: { row: DataCategoryInfo }) =>
          lineMap.value[row.lineNo] || row.lineNo,
      },
    },
    { field: 'dataCategoryName', title: '名称' },
    { field: 'dataCategoryNo', title: '编码' },
    { field: 'sourceFrom', title: '一级来源' },
    { field: 'sourceType', title: '二级来源' },
    {
      field: 'categoryType',
      title: '所属类型',
      slots: {
        default: ({ row }: { row: DataCategoryInfo }) =>
          allCategoryMap.value[row.categoryType] || row.categoryType,
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
        default: ({ row: dataCategoryInfo }: { row: DataCategoryInfo }) => {
          const buttons = [
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                onClick: () => handleEdit(dataCategoryInfo),
              },
              { default: () => '编辑' },
            ),
            h(
              ElButton,
              {
                type: 'info',
                size: 'small',
                onClick: () => handleInfo(dataCategoryInfo),
              },
              { default: () => '详情' },
            ),
          ];

          if (dataCategoryInfo.isValid === 0) {
            buttons.push(
              h(
                ElButton,
                {
                  type: 'success',
                  size: 'small',
                  onClick: () => handleValid(dataCategoryInfo),
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
                  onClick: () => handleInvalid(dataCategoryInfo),
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
        return await getDataCategoryList(params);
      },
    },
  },
  sortConfig: {
    multiple: true,
  },
  border: true,
  stripe: true,
};

const gridEvents: VxeGridListeners<DataCategoryInfo> = {
  // 可以添加表格事件监听
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 编辑弹窗状态
const editDrawerVisible = ref(false);
const currentEditing = ref<DataCategoryInfo | null>(null);
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
        placeholder: '请输入数据源分类名称',
      },
      fieldName: 'dataCategoryName',
      label: '数据源分类名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入数据源分类编码',
        disabled: true,
      },
      fieldName: 'dataCategoryNo',
      label: '数据源分类编码',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入一级来源',
        disabled: true,
      },
      fieldName: 'sourceFrom',
      label: '一级来源',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入二级来源',
        disabled: true,
      },
      fieldName: 'sourceType',
      label: '二级来源',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入优先级',
        disabled: true,
      },
      fieldName: 'priority',
      label: '优先级',
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
    {
      component: 'ApiSelect',
      componentProps: {
        options: allCategoryOptions,
        placeholder: '请输入所属类型',
        disabled: true,
      },
      fieldName: 'categoryType',
      label: '所属类型',
      rules: 'required',
    },
  ],
  showDefaultActions: true,
  wrapperClass: 'grid-cols-1',
});

// 详情
function handleInfo(row: DataCategoryInfo) {
  drawerTitle.value = '数据源分类详情';
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
      fieldName: 'dataCategoryName',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'dataCategoryNo',
      componentProps: {
        disabled: true,
      },
      hide: false,
    },
    {
      fieldName: 'sourceFrom',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'sourceType',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'priority',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'categoryType',
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
  drawerTitle.value = '新增数据源分类';
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
      fieldName: 'dataCategoryName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'dataCategoryNo',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'sourceFrom',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'sourceType',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'priority',
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
    {
      fieldName: 'categoryType',
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
function handleEdit(row: DataCategoryInfo) {
  drawerTitle.value = '编辑数据源分类';
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
      fieldName: 'dataCategoryName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'dataCategoryNo',
      componentProps: {
        disabled: true,
      },
      hide: false,
    },
    {
      fieldName: 'sourceFrom',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'sourceType',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'priority',
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
    {
      fieldName: 'categoryType',
      componentProps: {
        disabled: true,
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
async function handleValid(row: DataCategoryInfo) {
  try {
    const data = { id: row.id, isValid: 1 };
    const resp = await updateDataCategoryValid(data);
    ElMessage.success(resp);

    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 失效
async function handleInvalid(row: DataCategoryInfo) {
  try {
    const data = { id: row.id, isValid: 0 };
    const resp = await updateDataCategoryValid(data);
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
        dataCategoryName: values.dataCategoryName,
        dataCategoryNo: values.dataCategoryNo,
        sourceFrom: values.sourceFrom,
        sourceType: values.sourceType,
        priority: values.priority,
        categoryType: values.categoryType,
        isValid: values.isValid,
      };

      const resp = await createDataCategory(insertData);
      isAdd.value = false;
      ElMessage.success(resp);
    }
    if (isEdit.value) {
      const updateData = {
        id: currentEditing.value?.id,
        lineNo: values.lineNo,
        dataCategoryName: values.dataCategoryName,
        dataCategoryNo: values.dataCategoryNo,
        sourceFrom: values.sourceFrom,
        sourceType: values.sourceType,
        priority: values.priority,
        categoryType: values.categoryType,
        isValid: values.isValid,
        version: currentEditing.value?.version,
        createAt: currentEditing.value?.createAt,
      };

      const resp = await updateDataCategory(updateData);
      isEdit.value = false;
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
    ElMessage.error('数据源分类操作失败');
    console.error('数据源分类操作失败:', error);
  }
}

// 重置
function handleResetEdit() {
  if (isAdd.value) {
    editFormApi.resetForm();
  }
  if (isEdit.value) {
    editFormApi.setValues(currentEditing.value || {});
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
  <Page description="数据源分类管理">
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
