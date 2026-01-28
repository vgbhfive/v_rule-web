<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { LineInfo, LineParams } from '#/api/system';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElDrawer, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getLineDropdownList,
  getLineList,
  insertLine,
  updateLine,
} from '#/api/system';

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
      component: 'Input',
      componentProps: {
        placeholder: '业务线名称',
        clearable: true,
      },
      fieldName: 'lineName',
      label: '名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '业务线编码',
        clearable: true,
      },
      fieldName: 'lineNo',
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
async function onSubmit(values: LineParams) {
  await gridApi.reload({ ...values });
}

// 表格配置
const gridOptions: VxeGridProps<LineInfo> = {
  columns: [
    { type: 'seq', title: '序号', width: 50 },
    { field: 'lineName', title: '名称' },
    { field: 'lineNo', title: '编码' },
    { field: 'url', title: 'URL', showOverflow: true, width: 250 },
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
      slots: {
        default: ({ row: lineInfo }: { row: LineInfo }) => {
          const buttons = [
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                onClick: () => handleEdit(lineInfo),
              },
              { default: () => '编辑' },
            ),
            h(
              ElButton,
              {
                type: 'info',
                size: 'small',
                onClick: () => handleInfo(lineInfo),
              },
              { default: () => '详情' },
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
          currPage: page.currentPage,
          limit: page.pageSize,
        };
        return await getLineList(params);
      },
    },
  },
  sortConfig: {
    multiple: true,
  },
};

const gridEvents: VxeGridListeners<LineInfo> = {
  // 可以添加表格事件监听
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 编辑弹窗状态
const editDrawerVisible = ref(false);
const currentEditingId = ref<null | number>(null);
const drawerTitle = ref('');
const initialEditData = ref<LineInfo | null>(null);
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
      component: 'Input',
      componentProps: {
        placeholder: '请输入业务线名称',
        disabled: false,
      },
      fieldName: 'lineName',
      label: '业务线名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入业务线编码',
        disabled: false,
      },
      fieldName: 'lineNo',
      label: '业务线编码',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入业务线URL',
        disabled: false,
      },
      fieldName: 'url',
      label: '业务线URL',
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
function handleInfo(row: LineInfo) {
  drawerTitle.value = '业务线详情';
  currentEditingId.value = row.id;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  editFormApi.setValues(row);
  // 设置全部字段不可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'lineName',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'lineNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'url',
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

// 新增业务线
function handleAdd() {
  drawerTitle.value = '新增业务线';
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 设置部分字段可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'lineName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'lineNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'url',
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

// 编辑业务线
function handleEdit(row: LineInfo) {
  drawerTitle.value = '编辑业务线';
  currentEditingId.value = row.id;
  initialEditData.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  editFormApi.setValues(row);
  // 设置部分字段不可编辑
  editFormApi.updateSchema([
    {
      fieldName: 'lineName',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'lineNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'url',
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

// 保存
async function handleSaveEdit(values: any) {
  // if (!currentEditingId.value) return;

  try {
    if (isAdd.value) {
      const insertData = {
        lineName: values.lineName,
        lineNo: values.lineNo,
        url: values.url,
        isValid: values.isValid,
      };
      const resp = await insertLine(insertData);

      isAdd.value = false;
      ElMessage.success(resp);
    }

    if (isEdit.value) {
      const updateData = {
        id: currentEditingId.value,
        lineName: values.lineName,
        lineNo: values.lineNo,
        url: values.url,
        isValid: values.isValid,
      };
      const resp = await updateLine(updateData);

      isEdit.value = false;
      ElMessage.success(resp);
    }

    // 关闭弹窗
    editDrawerVisible.value = false;

    // 刷新表格数据
    const queryvalues = await queryFormApi.getValues();
    await gridApi.reload(queryvalues);

    // 重置表单
    await editFormApi.resetForm();
    currentEditingId.value = null;
  } catch (error) {
    ElMessage.error('业务线操作失败');
    console.error('业务线操作失败:', error);
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
  <Page description="业务线管理">
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
