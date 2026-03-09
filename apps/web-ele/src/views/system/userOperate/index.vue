<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { operatePermission } from '#/api/system/userOperate';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElCheckbox, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { userDropdownList } from '#/api/system/user';
import {
  getOperatePermissionList,
  getUserOperateList,
  updateUserOperate,
} from '#/api/system/userOperate';

const userOptions = ref<{ label: string; value: string }[]>([]);
const operateOptions = ref<operatePermission[]>([]);
const operates = ref<number[]>([]);
const loading = ref(false);

onMounted(async () => {
  const list = await userDropdownList();
  userOptions.value = list.map((item) => ({
    label: item.key,
    value: item.value,
  }));

  const operatePermissionList = await getOperatePermissionList();
  operateOptions.value = operatePermissionList;

  loading.value = true;
  initData(operateOptions.value, operates.value);
  loading.value = false;
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
  },
  wrapperClass: 'grid-cols-4',
});

// 表单提交处理
async function onSubmit(values: Recordable<any>) {
  if (!values.userId) {
    operates.value = [];
    return;
  }
  loading.value = true;
  const list = await getUserOperateList(values.userId);
  operates.value = list;
  initData(operateOptions.value, operates.value);
  loading.value = false;
}

const handleToggle = (
  node: operatePermission,
  isChecked: boolean,
  ...parents: operatePermission[]
) => {
  // 1. 向下同步：当前节点的所有子孙节点状态一致
  const syncDown = (item: operatePermission, status: boolean) => {
    item.checked = status;
    item.indeterminate = false;
    item.nextLevelOperatePermission?.forEach((child) =>
      syncDown(child, status),
    );
  };
  syncDown(node, isChecked);

  // 2. 向上追溯：逐级更新父级状态
  parents.forEach((p) => updateParentStatus(p));
};

const updateParentStatus = (parent: operatePermission) => {
  const children = parent.nextLevelOperatePermission || [];
  if (children.length === 0) return;

  const checkedCount = children.filter((c) => c.checked).length;
  const hasIndeterminate = children.some((c) => c.indeterminate);

  // 全选：所有子节点 checked 为 true
  parent.checked = checkedCount === children.length;
  // 半选：未全选，但(有子节点被选中) 或 (子节点本身处于半选)
  parent.indeterminate =
    !parent.checked && (checkedCount > 0 || hasIndeterminate);
};

const getSelected = () => {
  const ids: Recordable<any>[] = [];
  const collect = (list: operatePermission[]) => {
    list.forEach((node) => {
      if (node.checked)
        ids.push({ uniqueSign: node.uniqueSign, type: node.type });
      if (node.nextLevelOperatePermission)
        collect(node.nextLevelOperatePermission);
    });
  };
  collect(operateOptions.value);
  return ids;
};

async function handleUpdate() {
  const params = await queryFormApi.getValues();
  if (!params.userId) return;

  const result = getSelected();
  for (const item of result) {
    item.userId = params.userId;
  }
  const resp = await updateUserOperate(result);
  ElMessage.success(resp);
}

// 初始化
const initData = (tree: operatePermission[], ownIds: number[]) => {
  // 1. 递归设置初始勾选
  const traverse = (list: operatePermission[]) => {
    list.forEach((node) => {
      node.checked = ownIds.includes(node.id);
      node.indeterminate = false;
      if (node.nextLevelOperatePermission)
        traverse(node.nextLevelOperatePermission);
    });
  };
  traverse(tree);

  // 2. 向上刷新半选状态（三层递进刷新）
  tree.forEach((l1) => {
    l1.nextLevelOperatePermission?.forEach((l2) => {
      updateParentStatus(l2);
    });
    updateParentStatus(l1);
  });
};
</script>

<template>
  <Page description="业务线权限管理">
    <div>
      <div class="w-full">
        <QueryForm />
      </div>
      <div v-loading="loading" class="permission-wrapper">
        <div
          v-for="level1 in operateOptions"
          :key="level1.id"
          class="level-1-box"
        >
          <div class="level-1-header">
            <ElCheckbox
              v-model="level1.checked"
              :indeterminate="level1.indeterminate"
              @change="(val) => handleToggle(level1, !!val)"
            >
              <span class="font-bold">{{ level1.name }}</span>
            </ElCheckbox>
          </div>

          <div class="level-2-container">
            <div
              v-for="level2 in level1.nextLevelOperatePermission"
              :key="level2.id"
              class="level-2-item"
            >
              <div class="level-2-header">
                <ElCheckbox
                  v-model="level2.checked"
                  :indeterminate="level2.indeterminate"
                  @change="(val) => handleToggle(level2, !!val, level1)"
                >
                  <span class="font-bold">{{ level2.name }}</span>
                </ElCheckbox>
              </div>

              <div class="level-3-group">
                <ElCheckbox
                  v-for="level3 in level2.nextLevelOperatePermission"
                  :key="level3.id"
                  v-model="level3.checked"
                  @change="(val) => handleToggle(level3, !!val, level2, level1)"
                >
                  <span class="font-bold">{{ level3.name }}</span>
                </ElCheckbox>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mb-4 mt-4 flex justify-start pl-[15px]">
        <ElButton type="primary" @click="handleUpdate" size="default">
          <i class="el-icon-plus mr-1"></i>
          保存
        </ElButton>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.permission-wrapper {
  padding: 20px;
  border: 1px solid #ebeef5;
}

.level-1-box {
  margin-bottom: 24px;
  border: 1px solid #f0f2f5;
  border-radius: 4px;
}

.level-1-header {
  padding: 10px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #f0f2f5;
}

.level-2-container {
  padding: 15px 30px;
}

.level-2-item {
  margin-bottom: 15px;
}

.level-2-header {
  padding-left: 10px;
  margin-bottom: 10px;
  border-left: 3px solid #409eff;
}

.level-3-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-left: 25px;
  color: #606266;
}

.font-bold {
  font-weight: bold;
}
</style>
