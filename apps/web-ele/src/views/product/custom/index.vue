<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { CustomInfo, CustomParams, DetailList } from '#/api/product';

import { h, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  ElButton,
  ElDrawer,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDataSourceDropdownList } from '#/api/data';
import { getValueTypes } from '#/api/enums';
import {
  createCustom,
  customDetail,
  getCustomList,
  updateCustom,
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
const isAdd = ref(false);
const isEdit = ref(false);
const isInfo = ref(false);
const dataSourceOptions = ref<{ label: string; value: string }[]>([]);
const ruleFormRef = ref();

const form = reactive({
  lineNo: '',
  productName: '',
  productNo: '',
  products: [] as DetailList[],
  remark: '',
  isValid: '',
});

const rules = {
  // 其他字段校验...
  products: {
    keyName: [{ required: true, message: '请输入键名', trigger: 'blur' }],
    valueType: [{ required: true, message: '请选择类型', trigger: 'change' }],
    value: [
      { required: true, message: '内容不能为空', trigger: ['blur', 'change'] },
    ],
  },
};

// 详情
async function handleInfo(row: CustomInfo) {
  drawerTitle.value = '自定义产品详情';
  const detail = await customDetail(row.id);
  currentEditing.value = detail;
  form.lineNo = detail.lineNo || '';
  form.productName = detail.productName || '';
  form.productNo = detail.productNo || '';
  form.products = detail.productCustomEntityList || [];
  form.remark = detail.remark || '';
  form.isValid = detail.isValid;
  handleLineChange();
  isAdd.value = false;
  isEdit.value = false;
  isInfo.value = true;
  editDrawerVisible.value = true;
}

// 新增
function handleAdd() {
  drawerTitle.value = '新增自定义产品';
  isAdd.value = true;
  isEdit.value = false;
  isInfo.value = false;
  form.lineNo = ' ';
  form.productName = ' ';
  form.productNo = ' ';
  form.products = [] as DetailList[];
  form.remark = ' ';
  form.isValid = ' ';
  editDrawerVisible.value = true;
}

// 编辑
async function handleEdit(row: CustomInfo) {
  drawerTitle.value = '编辑自定义产品';
  const detail = await customDetail(row.id);
  currentEditing.value = detail;
  form.lineNo = detail.lineNo || '';
  form.productName = detail.productName || '';
  form.productNo = detail.productNo || '';
  form.products = detail.productCustomEntityList || [];
  form.remark = detail.remark || '';
  form.isValid = detail.isValid;
  handleLineChange();
  isAdd.value = false;
  isEdit.value = true;
  isInfo.value = false;
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

// 保存
async function handleSaveEdit() {
  try {
    if (isAdd.value) {
      const valid = await ruleFormRef.value.validate();

      if (valid) {
        const insertData = {
          lineNo: form.lineNo,
          productName: form.productName,
          type: 'custom',
          productCustomEntityList: form.products,
          remark: form.remark,
          isValid: form.isValid,
        };
        const resp = await createCustom(insertData);
        ElMessage.success(resp);
      }
    }

    if (isEdit.value) {
      const valid = await ruleFormRef.value.validate();
      if (valid) {
        const updateData = {
          id: currentEditing.value?.id,
          lineNo: form.lineNo,
          productName: form.productName,
          productNo: currentEditing.value?.productNo,
          productCustomEntityList: form.products,
          type: 'custom',
          version: currentEditing.value?.version,
          remark: form.remark,
          isValid: form.isValid,
          createAt: currentEditing.value?.createAt,
        };
        const resp = await updateCustom(updateData);
        ElMessage.success(resp);
      }
    }

    // 关闭弹窗
    editDrawerVisible.value = false;

    // 刷新表格数据
    await gridApi.reload();
    isAdd.value = false;
    isEdit.value = false;
    isInfo.value = false;
    form.lineNo = ' ';
    form.productName = ' ';
    form.productNo = ' ';
    form.products = [] as DetailList[];
    form.remark = ' ';
    form.isValid = ' ';
    currentEditing.value = null;
  } catch (error) {
    ElMessage.error('自定义产品操作失败');
    console.error('自定义产品操作失败:', error);
  }
}

// 重置
async function handleResetEdit() {
  if (isAdd.value) {
    form.lineNo = ' ';
    form.productName = ' ';
    form.productNo = ' ';
    form.products = [] as DetailList[];
    form.remark = ' ';
    form.isValid = ' ';
  }
  if (isEdit.value) {
    handleLineChange();
    form.lineNo = currentEditing.value?.lineNo || '';
    form.productName = currentEditing.value?.productName || '';
    form.productNo = currentEditing.value?.productNo || '';
    form.products = currentEditing.value?.productCustomEntityList || [];
    form.remark = currentEditing.value?.remark || '';
    form.isValid = currentEditing.value?.isValid || ' ';
  }
}

// 处理弹窗关闭
function handleDrawerClose(done: () => void) {
  editDrawerVisible.value = false;
  isAdd.value = false;
  isEdit.value = false;
  isInfo.value = false;
  form.lineNo = ' ';
  form.productName = ' ';
  form.productNo = ' ';
  form.products = [] as DetailList[];
  form.remark = ' ';
  form.isValid = ' ';
  done();
}

// 业务线编码出现变化
async function handleLineChange() {
  const dataSourceList = await getDataSourceDropdownList({
    lineNo: form.lineNo,
  });
  dataSourceOptions.value = dataSourceList.map((item) => ({
    label: item.key || '',
    value: item.value || '',
  }));
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

      <div class="mt-4">
        <ElForm
          ref="ruleFormRef"
          :model="form"
          label-width="100px"
          label-position="top"
          class="w-full"
        >
          <ElFormItem label="业务线名称" prop="lineNo" required>
            <ElSelect
              v-model="form.lineNo"
              placeholder="业务线名称"
              clearable
              @change="handleLineChange"
              :disabled="isInfo"
            >
              <ElOption
                v-for="item in lineOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="自定义产品名称" prop="productName" required>
            <ElInput
              v-model="form.productName"
              placeholder="自定义产品名称"
              :disabled="isInfo"
            />
          </ElFormItem>
          <ElFormItem
            v-if="!isAdd"
            label="自定义产品编号"
            prop="productNo"
            required
          >
            <ElInput
              v-model="form.productNo"
              placeholder="自定义产品编号"
              :disabled="isInfo || isEdit"
            />
          </ElFormItem>
          <ElFormItem label="KV 列表" prop="products" required>
            <div class="w-full">
              <div class="mb-2">
                <ElButton
                  type="primary"
                  size="small"
                  @click="
                    form.products.push({
                      keyName: '',
                      value: '',
                      valueType: '',
                    })
                  "
                  :disabled="isInfo"
                >
                  添加
                </ElButton>
              </div>

              <div
                v-for="(item, index) in form.products"
                :key="index"
                class="mb-2 flex items-start gap-2"
              >
                <div style="width: 200px">
                  <ElFormItem
                    :prop="`products.${index}.keyName`"
                    :rules="rules.products.keyName"
                  >
                    <ElInput
                      v-model="item.keyName"
                      placeholder="Key"
                      :disabled="isInfo"
                    />
                  </ElFormItem>
                </div>

                <div style="width: 150px">
                  <ElFormItem
                    :prop="`products.${index}.valueType`"
                    :rules="rules.products.valueType"
                  >
                    <ElSelect
                      v-model="item.valueType"
                      @change="item.value = ''"
                      :disabled="isInfo"
                    >
                      <ElOption
                        v-for="type in allValueOptions"
                        :key="type.value"
                        :label="type.label"
                        :value="type.value"
                      />
                    </ElSelect>
                  </ElFormItem>
                </div>

                <div style="width: 200px">
                  <ElFormItem
                    :prop="`products.${index}.value`"
                    :rules="rules.products.value"
                  >
                    <ElInput
                      v-if="item.valueType === 'fixed'"
                      v-model="item.value"
                      placeholder="固定值"
                      :disabled="isInfo"
                    />
                    <ElSelect
                      v-else-if="item.valueType === 'dataSource'"
                      v-model="item.value"
                      placeholder="数据源"
                      :disabled="isInfo"
                    >
                      <ElOption
                        v-for="option in dataSourceOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </ElSelect>
                    <ElInput v-else disabled placeholder="请先选择类型" />
                  </ElFormItem>
                </div>

                <ElButton
                  type="danger"
                  size="small"
                  @click="form.products.splice(index, 1)"
                  :disabled="isInfo"
                >
                  X
                </ElButton>
              </div>
            </div>
          </ElFormItem>
          <ElFormItem label="备注" prop="remark">
            <ElInput
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注"
              :disabled="isInfo"
            />
          </ElFormItem>
          <ElFormItem label="状态" prop="isValid" required>
            <ElSelect
              v-model="form.isValid"
              placeholder="请选择状态"
              class="w-full"
              :disabled="isInfo"
            >
              <ElOption label="生效" :value="1" />
              <ElOption label="失效" :value="0" />
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>

      <div class="flex justify-end" v-if="!isInfo">
        <ElButton type="info" @click="handleResetEdit" size="default">
          重置
        </ElButton>
        <ElButton type="primary" @click="handleSaveEdit" size="default">
          提交
        </ElButton>
      </div>
    </ElDrawer>
  </Page>
</template>
