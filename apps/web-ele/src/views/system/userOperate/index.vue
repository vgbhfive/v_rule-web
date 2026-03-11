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
    item.children?.forEach((child) => syncDown(child, status));
  };
  syncDown(node, isChecked);

  // 2. 向上追溯：逐级更新父级状态
  parents.forEach((p) => updateParentStatus(p));
};

const updateParentStatus = (parent: operatePermission) => {
  const children = parent.children || [];
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

  /**
   * 递归地检查并收集节点。
   * @param node - 当前要处理的节点。
   * @returns boolean - 如果当前节点或其任何子孙节点被选中，则返回 true。
   */
  const collect = (node: operatePermission): boolean => {
    // 1. 首先，递归地检查所有子节点。
    // hasCheckedChild 会在任何一个子递归返回 true 时变为 true。
    const hasCheckedChild =
      node.children?.map((child) => collect(child)).some(Boolean) || false;

    // 2. 如果当前节点本身被选中，或者它有被选中的子孙节点，则认为该节点“激活”。
    const isActive = node.checked || hasCheckedChild;

    // 3. 如果节点是“激活”状态，则将其信息添加到结果数组中。
    if (isActive) {
      ids.push({ uniqueSign: node.uniqueSign, type: node.type });
    }

    // 4. 将当前节点的“激活”状态返回给其父节点。
    return isActive;
  };

  // 遍历所有顶级节点，启动递归收集过程。
  operateOptions.value.forEach((node) => collect(node));

  // 注意：这样收集到的 ids 列表，子节点会排在父节点前面。
  // 对于权限集合，顺序通常不重要。如果需要，可以在此对 ids 进行反转。
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
      if (node.children) traverse(node.children);
    });
  };
  traverse(tree);

  // 2. 向上刷新半选状态（三层递进刷新）
  tree.forEach((l1) => {
    l1.children?.forEach((l2) => {
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
              v-for="level2 in level1.children"
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
                  v-for="level3 in level2.children"
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
