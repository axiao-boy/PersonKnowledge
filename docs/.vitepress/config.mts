import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '个人知识库',
  description: '个人知识库',
  lang: 'zh-CN',
  base: '/PersonKnowledge/',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/PersonKnowledge/favicon.svg' }]
  ],

  themeConfig: {
    siteTitle: '个人知识库',
    logo: '/logo.svg',
    outline: [2, 3],  
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
            { text: '劳动者须知', link: '/labor-law/' },
            { text: '劳动仲裁', link: '/labor-law/zhongcai/' },
            { text: '健身', link: '/labor-law/exercise/' },
            { text: '形象管理', link: '/labor-law/grooming/' },
            { text: '人生挑战', link: '/labor-law/life-challenge/' },
          ]
        },
        {
          items: [{
            text: '企业形式', link: '/finance/enterprise/' },
            { text: '金融知识', link: '/finance/stock/' },
            { text: '银行', link: '/finance/bank/' }]
        },
        {
          items: [{ text: '食品', link: '/commodity/food/' }
          ]
        },
        {
          items: [
            { text: '网络', link: '/internet/network/' },
            { text: '办公常用软件', link: '/internet/office/' }
          ]
        },
        {
          items: [
            {
              text: '公考',
              link: '/gongkao/',
              items: [
                {
                  text: '行测',
                  link: '/gongkao/xingce/',
                  items: [
                    { text: '常识判断', link: '/gongkao/xingce/changshi' },
                    { text: '言语理解与表达', link: '/gongkao/xingce/yanyu' },
                    { text: '数量关系', link: '/gongkao/xingce/shuliang' },
                    { text: '判断推理', link: '/gongkao/xingce/panduan' },
                    { text: '资料分析', link: '/gongkao/xingce/ziliao' }
                  ]
                },
                {
                  text: '申论',
                  link: '/gongkao/shenlun/',
                  items: [
                    { text: '归纳概括', link: '/gongkao/shenlun/guina' },
                    { text: '综合分析', link: '/gongkao/shenlun/zonghe' },
                    { text: '提出对策', link: '/gongkao/shenlun/duice' },
                    { text: '公文写作', link: '/gongkao/shenlun/gongwen' },
                    { text: '文章写作', link: '/gongkao/shenlun/zuowen' },
                    { text: '素材积累', link: '/gongkao/shenlun/sucai' }
                  ]
                },
                {
                  text: '面试',
                  link: '/gongkao/mianshi/',
                  items: [
                    { text: '结构化面试', link: '/gongkao/mianshi/jiegouhua' },
                    { text: '无领导小组讨论', link: '/gongkao/mianshi/xiaozu' },
                    { text: '专业能力测试', link: '/gongkao/mianshi/zhuanye' }
                  ]
                }
              ]
            }
          ]
        },
      ]
    },
    footer: {
      message: '基于 VitePress 构建',
      copyright: 'All rights reserved.'
    },
    editLink: {
      pattern: 'https://github.com/axiao-boy/personKnowledge/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
})
