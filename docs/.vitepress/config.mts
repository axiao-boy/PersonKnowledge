import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '个人知识库',
  description: '个人知识库',
  lang: 'zh-CN',
  base: '/PersonKnowledge/',

  themeConfig: {
    siteTitle: '个人知识库',
    logo: '/logo.svg',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索'
          },
          modal: {
            displayDetails: '显示详情',
            noResultsText: '未找到结果',
            resetButtonTitle: '清除查询',
            footer: {
              selectText: '选择',
              navigateText: '导航',
              closeText: '关闭'
            }
          }
        }
      }
    },
    nav: [
      { text: '公共资源', link: '/public/' }
    ],
    sidebar: {
      '/': [
        {
          items: [{ text: '首页', link: '/' }]
        },
        {

          items: [
            { text: '劳动纠纷', link: '/labor-law/' },
            { text: '劳动仲裁', link: '/labor-law/zhongcai/' }]
        }
      ]
    },
    footer: {
      message: '基于 VitePress 构建',
      copyright: '2026 个人知识库. All rights reserved.'
    },
    editLink: {
      pattern: 'https://github.com/axiao-boy/personKnowledge/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
})
