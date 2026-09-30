Component({
  data: {
    selected: 0,
    hidden: false,
    animateSelection: false,
    tabs: [
      { path: '/pages/home/index', label: '对话', icon: '/assets/tab-chat.png', activeIcon: '/assets/tab-chat-active.png' },
      { path: '/pages/workbench/index', label: '研判', icon: '/assets/tab-analysis.png', activeIcon: '/assets/tab-analysis-active.png' },
      { path: '/pages/evidence/index', label: '依据', icon: '/assets/tab-evidence.png', activeIcon: '/assets/tab-evidence-active.png' }
    ]
  },
  lifetimes: {
    attached() {
      const pages = getCurrentPages()
      const current = pages[pages.length - 1]
      const index = current && this.data.tabs.findIndex(tab => tab.path === `/${current.route}`)
      if (!Number.isInteger(index) || index < 0) return
      this.activeIndex = index
      const transition = getApp().globalData.tabTransition
      const selected = transition && transition.to === index ? transition.from : index
      this.setData({ selected, animateSelection: false })
    },
    detached() {
      this.cancelMotion()
    }
  },
  pageLifetimes: {
    hide() {
      this.cancelMotion()
      this.switching = false
    }
  },
  methods: {
    cancelMotion() {
      this.motionToken = (this.motionToken || 0) + 1
      if (this.selectionTimer) clearTimeout(this.selectionTimer)
      this.selectionTimer = null
    },
    activate(index) {
      this.cancelMotion()
      this.switching = false
      this.activeIndex = index
      const state = getApp().globalData
      const transition = state.tabTransition
      if (!transition || transition.to !== index || transition.from === index) {
        state.tabTransition = null
        this.setData({ selected: index, animateSelection: false, hidden: false })
        return
      }

      state.tabTransition = null
      const token = this.motionToken
      this.setData({ selected: transition.from, animateSelection: false, hidden: false }, () => {
        if (token !== this.motionToken) return
        this.selectionTimer = setTimeout(() => {
          this.selectionTimer = null
          if (token !== this.motionToken) return
          this.setData({ animateSelection: true }, () => {
            if (token === this.motionToken) this.setData({ selected: index })
          })
        }, 24)
      })
    },
    switchTab(e) {
      const index = Number(e.currentTarget.dataset.index)
      const tab = this.data.tabs[index]
      const from = Number.isInteger(this.activeIndex) ? this.activeIndex : this.data.selected
      if (!tab || index === from || this.switching) return

      const state = getApp().globalData
      const transition = { from, to: index }
      state.tabTransition = transition
      this.switching = true
      wx.switchTab({
        url: tab.path,
        fail: () => {
          this.switching = false
          if (state.tabTransition === transition) state.tabTransition = null
          this.setData({ selected: from, animateSelection: false })
        }
      })
    }
  }
})
