<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { SceneInfo, SceneParams } from '#/api/system';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElDrawer, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLineDropdownList, getSceneList } from '#/api/system';

const lineMap = ref<Record<string, string>>({});
const lineOptions = ref<{ label: string; value: string }[]>([]);

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
      },
      fieldName: 'lineNo',
      label: '业务线',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '场景名称',
      },
      fieldName: 'sceneName',
      label: '名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '场景字段',
      },
      fieldName: 'field',
      label: '字段',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '场景编码',
      },
      fieldName: 'sceneNo',
      label: '编码',
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
const gridOptions: VxeGridProps<SceneInfo> = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    {
      field: 'lineNo',
      title: '业务线名称',
      slots: {
        default: ({ row }: { row: SceneInfo }) =>
          lineMap.value[row.lineNo] || row.lineNo,
      },
    },
    { field: 'sceneName', title: '场景名称' },
    { field: 'sceneNo', title: '场景编码' },
    { field: 'field', title: '字段', showOverflow: true, width: 250 },
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
      width: 200,
      // cellRender: {
      //   name: 'CellOperation',
      //   props: {
      //     onEdit: (row: SceneInfo) => {
      //       handleEdit(row);
      //     },
      //     onInfo: (row: SceneInfo) => {
      //       handleInfo(row);
      //     },
      //   },
      // },
      slots: {
        default: ({ row: sceneInfo }: { row: SceneInfo }) => {
          const buttons = [
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                onClick: () => handleEdit(sceneInfo),
              },
              { default: () => '编辑' },
            ),
            h(
              ElButton,
              {
                type: 'info',
                size: 'small',
                onClick: () => handleInfo(sceneInfo),
              },
              { default: () => '详情' },
            ),
          ];

          if (sceneInfo.isValid === 0) {
            buttons.push(
              h(
                ElButton,
                {
                  type: 'success',
                  size: 'small',
                  onClick: () => handleValid(sceneInfo),
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
                  onClick: () => handleInvalid(sceneInfo),
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

// 编辑弹窗状态
const editDrawerVisible = ref(false);
const currentEditingId = ref<null | number>(null);
const drawerTitle = ref('');

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
        placeholder: '业务线名称',
      },
      fieldName: 'lineNo',
      label: '业务线名称',
      rules: 'required',
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
        placeholder: '请输入场景编码',
        disabled: true,
      },
      fieldName: 'sceneNo',
      label: '场景编码',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入场景字段',
        disabled: true,
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

// 场景详情
function handleInfo(row: SceneInfo) {
  // 这里可以打开编辑弹窗，目前先提示
  ElMessage.info(`场景详情: ${row.sceneName}`);
  drawerTitle.value = '场景详情';
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
      fieldName: 'sceneNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'sceneName',
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
  drawerTitle.value = '新增场景';
  ElMessage.info(`新增场景`);
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
      fieldName: 'sceneName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'sceneNo',
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
      fieldName: 'isValid',
      componentProps: {
        disabled: false,
      },
    },
  ]);
  // 设置操作按钮可见
  editFormApi.setState({ showDefaultActions: true });
  editDrawerVisible.value = true;
}

// 编辑场景
function handleEdit(row: SceneInfo) {
  drawerTitle.value = '编辑场景';
  ElMessage.info(`编辑场景: ${row.id}`);
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
      fieldName: 'sceneName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'sceneNo',
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
      fieldName: 'isValid',
      componentProps: {
        disabled: false,
      },
    },
  ]);
  // 设置操作按钮可见
  editFormApi.setState({ showDefaultActions: true });
  editDrawerVisible.value = true;
}

// 生效场景
async function handleValid(row: SceneInfo) {
  try {
    // await updateScene({ ...row, isValid: 1 });
    ElMessage.success(`操作成功 生效${row.id}`);
    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 失效场景
async function handleInvalid(row: SceneInfo) {
  try {
    // await updateScene({ ...row, isValid: 0 });
    ElMessage.success(`操作成功 失效${row.id}`);
    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 保存
async function handleSaveEdit(values: any) {
  // if (!currentEditingId.value) return;

  try {
    // 构建更新数据
    const updateData = {
      id: currentEditingId.value,
      lineNo: values.lineNo,
      sceneName: values.sceneName,
      sceneNo: values.sceneNo,
      field: values.field,
      isValid: values.isValid,
    };

    // 调用更新API
    // await updateScene(currentEditingId.value, updateData);

    ElMessage.success(`场景更新成功${updateData.sceneName}`);

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
  <Page description="ReqId用户">
    <div>
      <div class="flex">
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
