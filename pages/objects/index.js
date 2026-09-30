const { getAnalysis } = require('../../utils/analysis')
const { readSelection, updateSelection } = require('../../utils/selection')

Page({
  data: { vm: null },

  onShow() {
    wx.setNavigationBarTitle({ title: '区域与回波对象' })
    this.refresh()
  },

  refresh() {
    const vm = getAnalysis(readSelection(getApp()))
    const previousObjects = this.data.vm ? this.data.vm.objects : []
    const defaultObject = vm.objects.find(item => item.related) || vm.objects[0]
    vm.objects = vm.objects.map(item => {
      const previous = previousObjects.find(other => other.id === item.id)
      return { ...item, expanded: previous ? previous.expanded : item.id === defaultObject.id }
    })
    this.setData({ vm })
  },

  selectRegion(e) {
    updateSelection(getApp(), { regionId: e.currentTarget.dataset.id })
    this.refresh()
  },

  toggleObject(e) {
    const id = e.currentTarget.dataset.id
    const index = this.data.vm.objects.findIndex(item => item.id === id)
    if (index < 0) return
    this.setData({ [`vm.objects[${index}].expanded`]: !this.data.vm.objects[index].expanded })
  }
})
