const { basis } = require('../../utils/mock')
Page({ data: { basis, expanded: false }, onShow() { wx.setNavigationBarTitle({ title: '判断依据' }) }, toggle() { this.setData({ expanded: !this.data.expanded }) } })
