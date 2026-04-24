Component({
  data: {
    selected: 0,
    list: [
      { pagePath: 'pages/plaza/plaza',  text: '首页' },
      { pagePath: 'pages/plaza-detail/plaza-detail', text: '广场' },
      { pagePath: 'pages/main/main',    text: '消息' },
      { pagePath: 'pages/profile/profile', text: '我' }
    ]
  },

  pageLifetimes: {
    show() {
      // 页面显示时自动更新选中状态
      this.updateSelected()
    }
  },

  methods: {
    updateSelected() {
      const pages = getCurrentPages()
      if (!pages.length) return
      const cur = pages[pages.length - 1]
      const route = cur.route
      const idx = this.data.list.findIndex(item => item.pagePath === route)
      if (idx !== -1) this.setData({ selected: idx })
    },

    switchTab(e) {
      const index = parseInt(e.currentTarget.dataset.index)
      const url = '/' + this.data.list[index].pagePath
      this.setData({ selected: index })
      wx.switchTab({ url })
    },

    onAdd() {
      wx.navigateTo({ url: '/pages/create/create' })
    }
  }
})
