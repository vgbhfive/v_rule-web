<script setup lang="ts">
import { ElButton } from 'element-plus';

// 简单的跳转逻辑
const openLink = (type: string) => {
  const links: Record<string, string> = {
    Github: 'https://github.com/vgbhfive',
    Blog: 'https://blog.vgbhfive.com',
    Email: 'mailto:vgbhfive@foxmail.com'
  };
  window.open(links[type], '_blank');
};
</script>

<template>
  <div class="simple-author-page">
    <div class="content-wrapper">
      <h3 class="author-name">vgbhfive</h3>
      <p class="author-title">风控算法工程师 / 独立开发者</p>

      <hr class="divider" />

      <div class="action-bar">
        <ElButton link type="primary" @click="openLink('Github')">GitHub</ElButton>
        <ElButton link type="primary" @click="openLink('Blog')">个人博客</ElButton>
        <ElButton link type="primary" @click="openLink('Email')">邮箱</ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simple-author-page {
  padding: 20px;
  display: flex;
  justify-content: left;
  color: #303133;
}

.content-wrapper {
  max-width: 300px;
  text-align: left;
}

.author-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.author-title {
  margin: 4px 0 0;
  font-size: 13px;
  color: #909399;
}

.divider {
  margin: 16px 0;
  border: 0;
  border-top: 1px solid #f0f0f0;
}

.action-bar {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
