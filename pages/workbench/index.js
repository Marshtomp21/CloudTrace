const { DEFAULT_SELECTION, getAnalysis } = require('../../utils/analysis')
const { readSelection, updateSelection } = require('../../utils/selection')

Page({
  data: { vm: null, showScenarios: false },

  onShow() {
    wx.setNavigationBarTitle({ title: '研判' })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.activate(1)
    this.refresh()
  },

  refresh() {
    this.setData({ vm: getAnalysis(readSelection(getApp())) })
  },

  openScenarios() {
    this.setData({ showScenarios: true })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ hidden: true })
  },
  closeScenarios() {
    this.setData({ showScenarios: false })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ hidden: false })
  },
  stopMask() {},

  chooseScenario(e) {
    const scenario = this.data.vm.scenarios.find(item => item.id === e.currentTarget.dataset.id)
    if (!scenario) return
    const patch = { scenarioId: scenario.id }
    if (scenario.id === 'event') patch.regionId = getApp().globalData.lastChosenRegionId || DEFAULT_SELECTION.regionId
    else if (scenario.focusRegionIds.length) patch.regionId = scenario.focusRegionIds[0]
    updateSelection(getApp(), patch)
    this.setData({ showScenarios: false })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ hidden: false })
    this.refresh()
  },

  chooseLead(e) {
    updateSelection(getApp(), { leadMin: Number(e.currentTarget.dataset.min) })
    this.refresh()
  },

  openRegion(e) {
    updateSelection(getApp(), { regionId: e.currentTarget.dataset.id })
    wx.navigateTo({ url: '/pages/objects/index' })
  },

  openSelectedRegion() {
    updateSelection(getApp(), { regionId: this.data.vm.focusRegion.id })
    wx.navigateTo({ url: '/pages/objects/index' })
  },

  goForecast() { wx.navigateTo({ url: '/pages/overview/index' }) }
})
