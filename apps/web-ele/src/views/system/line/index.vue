<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

const [QueryForm] = useVbenForm({
  // 默认展开
  collapsed: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入业务线名称',
      },
      // 字段名
      fieldName: 'line',
      // 界面显示的label
      label: '业务线',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: '生效',
            value: '1',
          },
          {
            label: '失效',
            value: '0',
          },
        ],
        placeholder: '请选择',
        showSearch: true,
      },
      fieldName: 'isValid',
      label: '是否生效',
    },
  ],
  submitButtonOptions: {
    content: '查询',
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

function onSubmit(values: Record<string, any>) {
  console.log('form values:', JSON.stringify(values));
}

// 数据实例
const MOCK_TREE_TABLE_DATA = [
  {
    address: '北京市海淀区',
    age: 20,
    id: 1,
    name: '张三',
    nickname: 'zhangsan',
    role: 'admin',
  },
  {
    address: '北京市海淀区',
    age: 21,
    id: 2,
    name: '李四',
    nickname: 'lisi',
    role: 'user',
  },
  {
    address: '北京市海淀区',
    age: 22,
    id: 3,
    name: '王五',
    nickname: 'wangwu',
    role: 'user',
  },
];

const sleep = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

/**
 * 获取示例表格数据
 */
async function getExampleTableApi(params: DemoTableApi.PageFetchParams) {
  return new Promise<{ items: any; total: number }>((resolve) => {
    const { page, pageSize } = params;
    const items = MOCK_TREE_TABLE_DATA.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );

    sleep(1000).then(() => {
      resolve({
        total: items.length,
        items,
      });
    });
  });
}

interface RowType {
  address: string;
  age: number;
  id: number;
  name: string;
  nickname: string;
  role: string;
}

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'name', title: 'Name' },
    { field: 'age', sortable: true, title: 'Age' },
    { field: 'nickname', title: 'Nickname' },
    { field: 'role', title: 'Role' },
    { field: 'address', showOverflow: true, title: 'Address' },
  ],
  data: MOCK_TREE_TABLE_DATA,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await getExampleTableApi({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  sortConfig: {
    multiple: true,
  },
};

const gridEvents: VxeGridListeners<RowType> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

gridApi.setGridOptions({
  border: true,
  stripe: true,
});
</script>

<template>
  <Page title="业务线管理">
    <div>
      <div class="flex w-full">
        <QueryForm />
      </div>
      <div>
        <Grid>
          <template #toolbar-tools></template>
        </Grid>
      </div>
    </div>
  </Page>
</template>
