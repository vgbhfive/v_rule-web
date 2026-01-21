<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { VGBHFIVE_DOC_URL, VGBHFIVE_GITHUB_URL } from '@vben/constants';
import { useWatermark } from '@vben/hooks';
import { BookOpenText, SvgGithubIcon } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

const notifications = ref<NotificationItem[]>([
  // {
  //   id: 1,
  //   avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
  //   date: '3小时前',
  //   isRead: true,
  //   message: '描述信息描述信息描述信息',
  //   title: '收到了 14 份新周报',
  // },
]);

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

const menus = computed(() => [
  {
    handler: () => {
      router.push({ name: 'Profile' });
    },
    icon: 'lucide:user',
    text: $t('page.auth.profile'),
  },
  {
    handler: () => {
      openWindow(VGBHFIVE_DOC_URL, {
        target: '_blank',
      });
    },
    icon: BookOpenText,
    text: $t('ui.widgets.document'),
  },
  {
    handler: () => {
      openWindow(VGBHFIVE_GITHUB_URL, {
        target: '_blank',
      });
    },
    icon: SvgGithubIcon,
    text: 'GitHub',
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

function handleNoticeClear() {
  notifications.value = [];
}

function markRead(id: number | string) {
  const item = notifications.value.find((item) => item.id === id);
  if (item) {
    item.isRead = true;
  }
}

function remove(id: number | string) {
  notifications.value = notifications.value.filter((item) => item.id !== id);
}

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
}
watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
  }),
  async ({ enable, content }) => {
    if (enable) {
      await updateWatermark({
        content:
          content ||
          `${userStore.userInfo?.name} - ${userStore.userInfo?.email} - ${userStore.userInfo?.mobile}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.name"
        :description="userStore.userInfo?.email"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @read="(item) => item.id && markRead(item.id)"
        @remove="(item) => item.id && remove(item.id)"
        @make-all="handleMakeAll"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
