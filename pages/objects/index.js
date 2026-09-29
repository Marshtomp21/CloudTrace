const { regions, objects } = require('../../utils/mock')
Page({ data: { regions, objects, selected: regions[0], selectedObject: objects[0] }, onShow() { wx.setNavigationBarTitle({ title: '区域影响' }) }, selectRegion(e) { this.setData({ selected: regions.find(item => item.id === e.currentTarget.dataset.id) }) }, goEvidence() { wx.switchTab({ url: '/pages/evidence/index' }) } })
