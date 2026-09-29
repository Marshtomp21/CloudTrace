App({
  globalData: {
    mode: 'synthetic_demo',
    warning: '合成演示数据，仅用于验证数据流与界面。',
    selectedLead: 30,
    selectedObject: 'F007-O001'
  },
  onLaunch() {
    wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#F5F7FB' })
  }
})
