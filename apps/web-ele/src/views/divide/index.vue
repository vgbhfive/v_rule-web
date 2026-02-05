<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { DivideInfo } from '#/api/divide';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElDrawer, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createDivide,
  getDivideDetail,
  getDivideList,
  updateDivide,
  updateDivideValid,
} from '#/api/divide';
import { getProductDropdownList } from '#/api/product';
import { getStrategyDropdownList } from '#/api/strategy';
import { getLineDropdownList } from '#/api/system';
import { getSceneDropdownList } from '#/api/system/scene';

const lineMap = ref<Record<string, string>>({});
const lineOptions = ref<{ label: string; value: string }[]>([]);
const sceneMap = ref<Record<string, string>>({});
const strategyMap = ref<Record<string, string>>({});

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

  // 场景
  const sceneList = await getSceneDropdownList({});
  const sceneNewMap: Record<string, string> = {};
  for (const item of sceneList) {
    sceneNewMap[item.value] = item.key;
  }
  sceneMap.value = sceneNewMap;

  // 策略集
  const strategyList = await getStrategyDropdownList({});
  const strategyNewMap: Record<string, string> = {};
  for (const item of strategyList) {
    strategyNewMap[item.value] = item.key;
  }
  strategyMap.value = strategyNewMap;
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
        placeholder: '分流器名称',
        clearable: true,
      },
      fieldName: 'divideName',
      label: '名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '分流器编码',
        clearable: true,
      },
      fieldName: 'divideNo',
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
async function onSubmit(values: any) {
  await gridApi.reload({ ...values });
}

// 表格配置
const gridOptions: VxeGridProps<DivideInfo> = {
  columns: [
    { type: 'seq', title: '序号', width: 50 },
    {
      field: 'lineNo',
      title: '业务线',
      slots: {
        default: ({ row }: { row: DivideInfo }) =>
          lineMap.value[row.lineNo] || row.lineNo,
      },
    },
    {
      field: 'sceneNo',
      title: '所属场景',
      slots: {
        default: ({ row }: { row: DivideInfo }) =>
          sceneMap.value[row.sceneNo] || row.sceneNo,
      },
    },
    { field: 'divideName', title: '名称' },
    { field: 'divideNo', title: '编码' },
    {
      field: 'accessStrategyNo',
      title: '准入策略集',
      slots: {
        default: ({ row }: { row: DivideInfo }) =>
          strategyMap.value[row.accessStrategyNo] || row.accessStrategyNo,
      },
    },
    {
      field: 'riskStrategyNo',
      title: '风控策略集',
      slots: {
        default: ({ row }: { row: DivideInfo }) =>
          strategyMap.value[row.riskStrategyNo] || row.riskStrategyNo,
      },
    },
    { field: 'priority', title: '优先级', width: 60 },
    {
      field: 'isValid',
      title: '状态',
      width: 50,
      formatter: ({ cellValue }) => {
        return cellValue === 1 ? '生效' : '失效';
      },
    },
    { field: 'createAt', title: '创建时间' },
    { field: 'deployAt', title: '部署时间' },
    {
      title: '操作',
      width: 200,
      slots: {
        default: ({ row: divideInfo }: { row: DivideInfo }) => {
          const buttons = [
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                onClick: () => handleEdit(divideInfo),
              },
              { default: () => '编辑' },
            ),
            h(
              ElButton,
              {
                type: 'info',
                size: 'small',
                onClick: () => handleInfo(divideInfo),
              },
              { default: () => '详情' },
            ),
          ];

          if (divideInfo.isValid === 0) {
            buttons.push(
              h(
                ElButton,
                {
                  type: 'success',
                  size: 'small',
                  onClick: () => handleValid(divideInfo),
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
                  onClick: () => handleInvalid(divideInfo),
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
        return await getDivideList(params);
      },
    },
  },
  sortConfig: {
    multiple: true,
  },
};

const gridEvents: VxeGridListeners<DivideInfo> = {
  // 可以添加表格事件监听
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 编辑弹窗状态
const editDrawerVisible = ref(false);
const currentEditing = ref<DivideInfo | null>(null);
const drawerTitle = ref('');
const preLineNo = ref('');
const isAdd = ref(false);
const isEdit = ref(false);
const isInfo = ref(false);
const sceneDropdownListOptions = ref<{ label: string; value: string }[]>([]);
const strategyDropdownListOptions = ref<{ label: string; value: string }[]>([]);
const limitProductOptions = ref<{ label: string; value: string }[]>([]);
const periodProductOptions = ref<{ label: string; value: string }[]>([]);
const interestProductOptions = ref<{ label: string; value: string }[]>([]);

// 新增/编辑/详情表单配置
const [EditForm, editFormApi] = useVbenForm({
  collapsed: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleValuesChange,
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
      component: 'ApiSelect',
      componentProps: {
        options: sceneDropdownListOptions,
        placeholder: '请选择所属场景',
        disabled: true,
      },
      fieldName: 'sceneNo',
      label: '所属场景',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入分流器名称',
      },
      fieldName: 'divideName',
      label: '分流器名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入分流器编码',
        disabled: true,
      },
      fieldName: 'divideNo',
      label: '分流器编码',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: strategyDropdownListOptions,
        placeholder: '请选择准入策略集',
        disabled: true,
      },
      fieldName: 'accessStrategyNo',
      label: '准入策略集',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: strategyDropdownListOptions,
        placeholder: '请选择风控策略集',
        disabled: true,
      },
      fieldName: 'riskStrategyNo',
      label: '风控策略集',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入优先级',
        disabled: true,
      },
      fieldName: 'priority',
      label: '优先级',
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: limitProductOptions,
        placeholder: '请选择额度产品',
        disabled: true,
        clearable: true,
      },
      fieldName: 'limitProductNo',
      label: '额度产品',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: periodProductOptions,
        placeholder: '请选择账期产品',
        disabled: true,
        clearable: true,
      },
      fieldName: 'periodProductNo',
      label: '账期产品',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: interestProductOptions,
        placeholder: '请选择利率产品',
        disabled: true,
        clearable: true,
      },
      fieldName: 'interestProductNo',
      label: '利率产品',
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
async function handleInfo(row: DivideInfo) {
  drawerTitle.value = '场景详情';
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  preLineNo.value = row.lineNo;
  const detail = await getDivideDetail(row.id);
  const values = {
    ...detail,
    limitProductNo: '',
    periodProductNo: '',
    interestProductNo: '',
  };
  if (detail.productEntityList) {
    detail.productEntityList.forEach((item) => {
      switch (item.type) {
        case 'interest': {
          values.interestProductNo = item.productNo;
          break;
        }
        case 'limit': {
          values.limitProductNo = item.productNo;
          break;
        }
        case 'period': {
          values.periodProductNo = item.productNo;
          break;
        }
        // No default
      }
    });
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
      fieldName: 'sceneNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'divideName',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'divideNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'accessStrategyNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'riskStrategyNo',
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
      fieldName: 'limitProductNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'periodProductNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'interestProductNo',
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
  isAdd.value = false;
  isEdit.value = false;
  isInfo.value = true;
  editDrawerVisible.value = true;
}

// 新增
function handleAdd() {
  drawerTitle.value = '新增分流器';
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
      fieldName: 'sceneNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'divideName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'divideNo',
      componentProps: {
        disabled: false,
      },
      hide: true,
    },
    {
      fieldName: 'accessStrategyNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'riskStrategyNo',
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
      fieldName: 'limitProductNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'periodProductNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'interestProductNo',
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
  isInfo.value = false;
  editDrawerVisible.value = true;
}

// 编辑
async function handleEdit(row: DivideInfo) {
  drawerTitle.value = '编辑场景';
  currentEditing.value = row;
  // 重置表单以清除之前的校验状态
  editFormApi.resetForm();
  // 填充表单数据
  const detail = await getDivideDetail(row.id);
  const values = {
    ...detail,
    limitProductNo: '',
    periodProductNo: '',
    interestProductNo: '',
  };
  if (detail.productEntityList) {
    detail.productEntityList.forEach((item) => {
      switch (item.type) {
        case 'interest': {
          values.interestProductNo = item.productNo;
          break;
        }
        case 'limit': {
          values.limitProductNo = item.productNo;
          break;
        }
        case 'period': {
          values.periodProductNo = item.productNo;
          break;
        }
        // No default
      }
    });
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
      fieldName: 'sceneNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'divideName',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'divideNo',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'accessStrategyNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'riskStrategyNo',
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
      fieldName: 'limitProductNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'periodProductNo',
      componentProps: {
        disabled: false,
      },
    },
    {
      fieldName: 'interestProductNo',
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
  isInfo.value = false;
  editDrawerVisible.value = true;
}

// 生效
async function handleValid(row: DivideInfo) {
  try {
    const data = { id: row.id, isValid: 1 };
    const resp = await updateDivideValid(data);
    ElMessage.success(resp);

    const values = await queryFormApi.getValues();
    gridApi.reload(values);
  } catch (error) {
    console.error(error);
  }
}

// 失效
async function handleInvalid(row: DivideInfo) {
  try {
    const data = { id: row.id, isValid: 0 };
    const resp = await updateDivideValid(data);
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
      const productEntityList = [];
      if (values.limitProductNo) {
        productEntityList.push({
          productNo: values.limitProductNo,
          type: 'limit',
        });
      }
      if (values.periodProductNo) {
        productEntityList.push({
          productNo: values.periodProductNo,
          type: 'period',
        });
      }
      if (values.interestProductNo) {
        productEntityList.push({
          productNo: values.interestProductNo,
          type: 'interest',
        });
      }
      const insertData = {
        lineNo: values.lineNo,
        sceneNo: values.sceneNo,
        divideName: values.divideName,
        accessStrategyNo: values.accessStrategyNo,
        riskStrategyNo: values.riskStrategyNo,
        priority: values.priority,
        productEntityList,
        isValid: values.isValid,
      };
      const resp = await createDivide(insertData);
      ElMessage.success(resp);
    }

    if (isEdit.value) {
      const productEntityList = [];
      if (values.limitProductNo) {
        productEntityList.push({
          productNo: values.limitProductNo,
          type: 'limit',
        });
      }
      if (values.periodProductNo) {
        productEntityList.push({
          productNo: values.periodProductNo,
          type: 'period',
        });
      }
      if (values.interestProductNo) {
        productEntityList.push({
          productNo: values.interestProductNo,
          type: 'interest',
        });
      }
      const updateData = {
        id: currentEditing.value?.id,
        lineNo: values.lineNo,
        sceneNo: currentEditing.value?.sceneNo,
        divideName: values.divideName,
        divideNo: currentEditing.value?.divideNo,
        accessStrategyNo: values.accessStrategyNo,
        riskStrategyNo: values.riskStrategyNo,
        priority: values.priority,
        productEntityList,
        version: currentEditing.value?.version,
        isValid: values.isValid,
        createAt: currentEditing.value?.createAt,
      };
      const resp = await updateDivide(updateData);
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
    ElMessage.error('分流器操作失败');
    console.error('分流器操作失败:', error);
  }
}

// 值变化
async function handleValuesChange(values: any) {
  if (isAdd.value || isEdit.value) {
    if (values.lineNo && values.lineNo !== preLineNo.value) {
      const data = {
        lineNo: values.lineNo,
      };
      const strategyDropdownList = await getStrategyDropdownList(data);
      strategyDropdownListOptions.value = strategyDropdownList.map((item) => ({
        label: item.key,
        value: item.value,
      }));

      // 场景
      const sceneData = {
        lineNo: values.lineNo,
      };
      const sceneDropdownList = await getSceneDropdownList(sceneData);
      sceneDropdownListOptions.value = sceneDropdownList.map((item) => ({
        label: item.key,
        value: item.value,
      }));

      // 额度
      const limitData = {
        lineNo: values.lineNo,
        type: 'limit',
      };
      const limitDropdownList = await getProductDropdownList(limitData);
      limitProductOptions.value = limitDropdownList.map((item) => ({
        label: item.key,
        value: item.value,
      }));

      // 账期
      const periodData = {
        lineNo: values.lineNo,
        type: 'period',
      };
      const periodDropdownList = await getProductDropdownList(periodData);
      periodProductOptions.value = periodDropdownList.map((item) => ({
        label: item.key,
        value: item.value,
      }));

      // 利率
      const interestData = {
        lineNo: values.lineNo,
        type: 'interest',
      };
      const interestDropdownList = await getProductDropdownList(interestData);
      interestProductOptions.value = interestDropdownList.map((item) => ({
        label: item.key,
        value: item.value,
      }));

      preLineNo.value = values.lineNo;
    } else if (
      values.riskStrategyNo &&
      values.riskStrategyNo === values.accessStrategyNo
    ) {
      ElMessage.warning('准入策略集和风控策略集不能配置相同');
      editFormApi.setFieldValue('riskStrategyNo', '');
    }
  }
  if (isInfo.value) {
    const data = {
      lineNo: currentEditing.value?.lineNo,
    };
    const strategyDropdownList = await getStrategyDropdownList(data);
    strategyDropdownListOptions.value = strategyDropdownList.map((item) => ({
      label: item.key,
      value: item.value,
    }));

    // 场景
    const sceneData = {
      lineNo: currentEditing.value?.lineNo,
    };
    const sceneDropdownList = await getSceneDropdownList(sceneData);
    sceneDropdownListOptions.value = sceneDropdownList.map((item) => ({
      label: item.key,
      value: item.value,
    }));

    // 额度
    const limitData = {
      lineNo: currentEditing.value?.lineNo,
      type: 'limit',
    };
    const limitDropdownList = await getProductDropdownList(limitData);
    limitProductOptions.value = limitDropdownList.map((item) => ({
      label: item.key,
      value: item.value,
    }));

    // 账期
    const periodData = {
      lineNo: currentEditing.value?.lineNo,
      type: 'period',
    };
    const periodDropdownList = await getProductDropdownList(periodData);
    periodProductOptions.value = periodDropdownList.map((item) => ({
      label: item.key,
      value: item.value,
    }));

    // 利率
    const interestData = {
      lineNo: currentEditing.value?.lineNo,
      type: 'interest',
    };
    const interestDropdownList = await getProductDropdownList(interestData);
    interestProductOptions.value = interestDropdownList.map((item) => ({
      label: item.key,
      value: item.value,
    }));
  }
}

// 取消编辑
function handleCancelEdit() {
  editDrawerVisible.value = false;
  currentEditing.value = null;
  isAdd.value = false;
  isEdit.value = false;
  isInfo.value = false;
  editFormApi.resetForm();
}

// 处理弹窗关闭
function handleDrawerClose(done: () => void) {
  handleCancelEdit();
  done();
}
</script>

<template>
  <Page description="分流器管理">
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
