<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { SceneInfo, SceneParams } from '#/api/system';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElDrawer, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getSceneList } from '#/api/system';

// 查询表单配置
const [QueryForm] = useVbenForm({
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
      component: 'Input',
      componentProps: {
        placeholder: '请输入业务线名称',
      },
      fieldName: 'lineNo',
      label: '业务线名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入场景名称',
      },
      fieldName: 'sceneName',
      label: '场景名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入场景字段',
      },
      fieldName: 'filed',
      label: '场景字段',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入场景编码',
      },
      fieldName: 'sceneNo',
      label: '场景编码',
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
const gridOptions: VxeGridProps<SceneInfo> = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'lineNo', title: '业务线名称' },
    { field: 'sceneName', title: '场景名称' },
    { field: 'sceneNo', title: '场景编码' },
    { field: 'field', title: '场景字段', showOverflow: true, width: 250 },
    {
      field: 'isValid',
      title: '状态',
      formatter: ({ cellValue }) => {
        return cellValue === 1 ? '生效' : '失效';
      },
    },
    { field: 'createAt', title: '创建时间' },
    {
      title: '操作',
      width: 150,
      cellRender: {
        name: 'CellOperation',
        props: {
          onEdit: ({ row: sceneInfo }) => {
            handleEdit(sceneInfo);
          },
          onInfo: ({ row: sceneInfo }) => {
            handleInfo(sceneInfo);
          },
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
        return await getSceneList(params);
      },
    },
  },
  sortConfig: {
    multiple: true,
  },
};

const gridEvents: VxeGridListeners<SceneInfo> = {
  // 可以添加表格事件监听
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 场景详情
function handleInfo(row: SceneInfo) {
  // 这里可以打开编辑弹窗，目前先提示
  ElMessage.info(`场景详情: ${row.sceneName}`);
}

// 编辑弹窗状态
const editDrawerVisible = ref(false);
const currentEditingId = ref<null | number>(null);

// 编辑表单配置
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
      component: 'Input',
      componentProps: {
        placeholder: '请输入业务线名称',
        disabled: true,
      },
      fieldName: 'lineNo',
      label: '业务线名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入场景名称',
      },
      fieldName: 'sceneName',
      label: '场景名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入场景字段',
      },
      fieldName: 'field',
      label: '场景字段',
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

// 添加场景
function handleAdd() {
  // 这里可以打开新增弹窗，目前先提示
  ElMessage.info(`新增场景`);
  editDrawerVisible.value = true;
}

// 编辑场景
function handleEdit(row: SceneInfo) {
  // 这里可以打开编辑弹窗，目前先提示
  ElMessage.info(`编辑场景: ${row}`);
  editDrawerVisible.value = true;
}

// 保存编辑
async function handleSaveEdit(values: any) {
  // if (!currentEditingId.value) return;

  try {
    // 构建更新数据
    const updateData = {
      sceneName: values.sceneName,
      sceneNo: values.sceneNo,
      field: values.field,
      isValid: values.isValid,
      description: values.description || '',
    };

    // 调用更新API
    // await updateScene(currentEditingId.value, updateData);

    ElMessage.success(`场景更新成功${updateData}`);

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
  ElMessage.success('取消');
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
  <Page description="场景管理">
    <div>
      <div class="flex">
        <QueryForm />
      </div>
      <div class="mb-4 mt-4 flex justify-end">
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
      title="编辑场景"
      direction="rtl"
      size="500px"
      :before-close="handleDrawerClose"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">编辑场景</span>
        </div>
      </template>

      <EditForm @submit="handleSaveEdit" @reset="handleCancelEdit">
        <template #footer-prepend>
          <div class="mt-4 flex justify-end space-x-2">
            <ElButton @click="handleCancelEdit">取消</ElButton>
            <ElButton type="primary" @click="handleSaveEdit">保存</ElButton>
          </div>
        </template>
      </EditForm>
    </ElDrawer>
  </Page>
</template>
