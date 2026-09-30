const { getAnalysis } = require('../../utils/analysis')
const { readSelection } = require('../../utils/selection')

Page({
  data: { vm: null },

  onShow() {
    wx.setNavigationBarTitle({ title: '判断依据' })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.activate(2)
    this.setData({ vm: getAnalysis(readSelection(getApp())) })
  },

  goForecast() { wx.navigateTo({ url: '/pages/overview/index' }) },
  goRegion() { wx.navigateTo({ url: '/pages/objects/index' }) }
})
