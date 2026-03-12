<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import { onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { ElButton, ElCheckbox, ElCheckboxGroup, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { getLineDropdownList } from '#/api/system';
import { userDropdownList } from '#/api/system/user';
import { getUserLineList, updateUserLine } from '#/api/system/userLine';

const { hasAccessByCodes } = useAccess();

const userOptions = ref<{ label: string; value: string }[]>([]);
const lineOptions = ref<{ label: string; value: string }[]>([]);
const lines = ref<string[]>([]);

onMounted(async () => {
  const list = await userDropdownList();
  userOptions.value = list.map((item) => ({
    label: item.key,
    value: item.value,
  }));

  const lineList = await getLineDropdownList();
  lineOptions.value = lineList.map((item) => ({
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
      component: 'Select',
      componentProps: {
        options: userOptions,
        placeholder: '用户',
        clearable: true,
      },
      fieldName: 'userId',
      label: '用户',
    },
  ],
  submitButtonOptions: {
    content: '查询',
    show: hasAccessByCodes(['user_line_manage']),
  },
  wrapperClass: 'grid-cols-4',
});

// 表单提交处理
async function onSubmit(values: Recordable<any>) {
  if (!values.userId) {
    lines.value = [];
    return;
  }
  const list = await getUserLineList(values.userId);
  lines.value = list;
}

async function handleUpdate() {
  const params = await queryFormApi.getValues();
  const data = ref<{ lineNo: string; userId: string }[]>([]);
  lines.value.forEach((element) => {
    data.value.push({
      userId: params.userId,
      lineNo: element,
    });
  });
  const resp = await updateUserLine(data.value);
  ElMessage.success(resp);
}
</script>

<template>
  <Page description="业务线权限管理">
    <div>
      <div class="w-full">
        <QueryForm />
      </div>
      <div class="mt-4" style="margin-left: 20px">
        <ElCheckboxGroup v-model="lines" class="flex flex-col">
          <ElCheckbox
            v-for="line in lineOptions"
            :key="line.label"
            :label="line.label"
            :value="line.value"
          >
            {{ line.label }}
          </ElCheckbox>
        </ElCheckboxGroup>
      </div>
      <div
        class="mb-4 mt-4 flex justify-start pl-[15px]"
        v-if="hasAccessByCodes(['user_line_manage_update'])"
      >
        <ElButton type="primary" @click="handleUpdate" size="default">
          <i class="el-icon-plus mr-1"></i>
          保存
        </ElButton>
      </div>
    </div>
  </Page>
</template>
