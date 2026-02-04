<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';

import { getUserInfoApi } from '#/api';

const profileBaseSettingRef = ref();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'name',
      component: 'Input',
      label: '姓名',
      disabled: true,
    },
    {
      fieldName: 'email',
      component: 'Input',
      label: '邮箱',
      disabled: true,
    },
    {
      fieldName: 'mobile',
      component: 'Input',
      label: '手机号',
      disabled: true,
    },
  ];
});

onMounted(async () => {
  const data = await getUserInfoApi();
  profileBaseSettingRef.value.getFormApi().setValues(data);
});
</script>
<template>
  <ProfileBaseSetting ref="profileBaseSettingRef" :form-schema="formSchema" />
</template>
