<script setup lang="ts">
import Giscus from '@giscus/vue'
import { useData, useRoute } from 'vitepress'

const { theme } = useData()
const route = useRoute()

// Giscus 配置（从主题配置中读取，便于统一管理）
const giscusConfig = {
  repo: 'axiao-boy/PersonKnowledge',
  repoId: 'R_kgDOThQW-w', // 需要重新获取（在 https://giscus.app 获取）
  category: 'Announcements',
  categoryId: 'DIC_kwDOThQW-84DB0W5', // 需要重新获取
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  lang: 'zh-CN',
  loading: 'lazy'
}
</script>

<template>
  <div class="giscus-comment">
    <ClientOnly>
      <Giscus
        :key="route.path"
        :repo="giscusConfig.repo"
        :repo-id="giscusConfig.repoId"
        :category="giscusConfig.category"
        :category-id="giscusConfig.categoryId"
        :mapping="giscusConfig.mapping"
        :strict="giscusConfig.strict"
        :reactions-enabled="giscusConfig.reactionsEnabled"
        :emit-metadata="giscusConfig.emitMetadata"
        :input-position="giscusConfig.inputPosition"
        :lang="giscusConfig.lang"
        :loading="giscusConfig.loading"
      />
    </ClientOnly>
  </div>
</template>

<style scoped>
.giscus-comment {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-border);
}
</style>
