<script setup lang="ts">
import type { UserInfo } from '@vben/types';

import { computed, onMounted, ref } from 'vue';

import { ProfileSecuritySetting } from '@vben/common-ui';

import { getUserInfoApi } from '#/api';

const userInfo = ref<UserInfo>();

onMounted(async () => {
  const data = await getUserInfoApi();
  userInfo.value = data;
});

const formSchema = computed(() => {
  return [
    {
      value: true,
      fieldName: 'accountPassword',
      label: '账户密码',
      description: '当前密码强度：强',
    },
    {
      value: true,
      fieldName: 'securityPhone',
      label: '密保手机',
      description: `已绑定手机：${userInfo.value?.mobile || '-'}`,
    },
    {
      value: true,
      fieldName: 'securityEmail',
      label: '备用邮箱',
      description: `已绑定邮箱：${userInfo.value?.email || '-'}`,
    },
    {
      value: false,
      fieldName: 'securityMfa',
      label: 'MFA 设备',
      description: '未绑定 MFA 设备，绑定后，可以进行二次确认',
    },
  ];
});
</script>
<template>
  <ProfileSecuritySetting :form-schema="formSchema" />
</template>
