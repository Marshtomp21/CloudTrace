const { getAnalysis } = require('../../utils/analysis')
const { readSelection, updateSelection } = require('../../utils/selection')

Page({
  data: { vm: null },

  onShow() {
    wx.setNavigationBarTitle({ title: '预测时间轴' })
    this.refresh()
  },

  refresh() {
    this.setData({ vm: getAnalysis(readSelection(getApp())) })
  },

  chooseLead(e) {
    updateSelection(getApp(), { leadMin: Number(e.currentTarget.dataset.min) })
    this.refresh()
  },

  openRegion(e) {
    updateSelection(getApp(), { regionId: e.currentTarget.dataset.id })
    wx.navigateTo({ url: '/pages/objects/index' })
  }
})
