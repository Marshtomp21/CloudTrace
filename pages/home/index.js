const { leads, scenarios, regions } = require('../../utils/mock')
Page({
  data: { leads, scenarios, regions, selectedLead: 60, selectedScenario: 'weather', selectedScenarioData: scenarios[0], now: '12:10', showScenario: false },
  onShow() { wx.setNavigationBarTitle({ title: '云迹先知' }) },
  chooseLead(e) { const selectedLead = Number(e.currentTarget.dataset.min); this.setData({ selectedLead }); getApp().globalData.selectedLead = selectedLead },
  chooseScenario(e) { const selectedScenario = e.currentTarget.dataset.id; this.setData({ selectedScenario, selectedScenarioData: scenarios.find(item => item.id === selectedScenario), showScenario: false }) },
  openScenario() { this.setData({ showScenario: true }) },
  closeScenario() { this.setData({ showScenario: false }) },
  noop() {},
  goPage(e) { wx.switchTab({ url: e.currentTarget.dataset.url }) }
})
