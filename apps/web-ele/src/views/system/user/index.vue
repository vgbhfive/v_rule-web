<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { UserInfo, UserParams } from '#/api/system/user';

import { h, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElDrawer, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createUser,
  getUserList,
  updateUser,
  updateUserValid,
} from '#/api/system/user';

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
      component: 'Input',
      componentProps: {
        placeholder: '用户名',
        clearable: true,
      },
      fieldName: 'name',
      label: '名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '手机号',
        clearable: true,
      },
      fieldName: 'mobile',
      label: '手机号',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '邮箱',
        clearable: true,
      },
      fieldName: 'email',
      label: '邮箱',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        clearable: true,
        options: [
          {
            label: '正常',
            value: 0,
          },
          {
            label: '冻结',
            value: 1,
          },
          {
            label: '初始化',
            value: 2,
          },
        ],
        placeholder: '状态',
        showSearch: true,
      },
      fieldName: 'status',
      label: '状态',
    },
  ],
  submitButtonOptions: {
    content: '查询',
  },
  wrapperClass: 'grid-cols-3 grid-cols-4',
});

// 表单提交处理
async function onSubmit(values: UserParams) {
  await gridApi.reload({ ...values });
}

// 表格配置
const gridOptions: VxeGridProps<UserInfo> = {
  columns: [
    { type: 'seq', title: '序号', width: 50 },
    { field: 'name', title: '用户名' },
    { field: 'mobile', title: '手机号' },
    { field: 'email', title: '邮箱' },
    {
      field: 'status',
      title: '状态',
      width: 80,
      formatter: ({ cellValue }) => {
        return cellValue === 1
          ? '冻结'
          : (cellValue === 0
            ? '正常'
            : '初始化');
      },
    },
    { field: 'createAt', title: '创建时间' },
    { field: 'updateAt', title: '更新时间' },
    {
      title: '操作',
      width: 250,
      slots: {
        default: ({ row: userInfo }: { row: UserInfo }) => {
          const buttons = [
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                onClick: () => handleEdit(userInfo),
              },
              { default: () => '编辑' },
            ),
            h(
              ElButton,
              {
                type: 'info',
                size: 'small',
                onClick: () => handleInfo(userInfo),
              },
              { default: () => '详情' },
            ),
          ];

          if (userInfo.status === 0 || userInfo.status === 2) {
            buttons.push(
              h(
                ElButton,
                {
                  type: 'warning',
                  size: 'small',
                  onClick: () => handleInvalid(userInfo),
                },
                { default: () => '冻结' },
              ),
            );
          } else {
            buttons.push(
              h(
                ElButton,
                {
                  type: 'warning',
                  size: 'small',
                  onClick: () => handleInvalid(userInfo),
                },
                { default: () => '正常' },
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
        return await getUserList(params);
      },
    },
  },
  sortConfig: {
    multiple: true,
  },
  border: true,
  stripe: true,
};

const gridEvents: VxeGridListeners<UserInfo> = {
  // 可以添加表格事件监听
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 编辑弹窗状态
const editDrawerVisible = ref(false);
const currentEditing = ref<null | UserInfo>(null);
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
      component: 'Input',
      componentProps: {
        placeholder: '请输入用户名',
      },
      fieldName: 'name',
      label: '用户名',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入手机号',
        disabled: true,
      },
      fieldName: 'mobile',
      label: '手机号',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
        disabled: true,
      },
      fieldName: 'email',
      label: '邮箱',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: '正常',
            value: 0,
          },
          {
            label: '冻结',
            value: 1,
          },
          {
            label: '初始化',
            value: 2,
          },
        ],
        placeholder: '请选择状态',
        showSearch: true,
      },
      fieldName: 'status',
      label: '状态',
      rules: 'required',
    },
  ],
  showDefaultActions: true,
  wrapperClass: 'grid-cols-1',
});

// 场景详情
function handleInfo(row: UserInfo) {
  drawerTitle.value = '用户详情';
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  editFormApi.setValues(row);
  // 设置全部字段不可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'name',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'mobile',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'email',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'status',
      componentProps: {
        disabled: true,
      },
      hide: false,
    },
  ]);
  // 设置操作按钮不可见
  editFormApi.setState({ showDefaultActions: false });
  editDrawerVisible.value = true;
}

// 新增场景
function handleAdd() {
  drawerTitle.value = '新增用户';
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 设置部分字段可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'name',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'mobile',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'email',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'status',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
  ]);
  // 设置操作按钮可见
  editFormApi.setState({ showDefaultActions: true });
  isAdd.value = true;
  isEdit.value = false;
  editDrawerVisible.value = true;
}

// 编辑场景
function handleEdit(row: UserInfo) {
  drawerTitle.value = '编辑用户';
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  editFormApi.setValues(row);
  // 设置部分字段不可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'name',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'mobile',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'email',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'isValid',
      componentProps: {
        disabled: false,
      },
      hide: false,
    },
  ]);
  // 设置操作按钮可见
  editFormApi.setState({ showDefaultActions: true });
  isAdd.value = false;
  isEdit.value = true;
  editDrawerVisible.value = true;
}

// 冻结
async function handleInvalid(row: UserInfo) {
  try {
    const data = { id: row.id, status: 1 };
    const resp = await updateUserValid(data);
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
        sceneName: values.sceneName,
        sceneNo: values.sceneNo,
        field: values.field,
        isValid: values.isValid,
      };
      const resp = await createUser(insertData);

      isAdd.value = false;
      ElMessage.success(resp);
    }
    if (isEdit.value) {
      const updateData = {
        id: currentEditing.value?.id,
        lineNo: values.lineNo,
        sceneName: values.sceneName,
        sceneNo: values.sceneNo,
        field: values.field,
        isValid: values.isValid,
        createAt: currentEditing.value?.createAt,
      };
      const resp = await updateUser(updateData);

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
    ElMessage.error('用户操作失败');
    console.error('用户操作失败:', error);
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
  <Page description="用户管理">
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

    <!-- 新增/编辑/详情场景侧边弹窗 -->
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
