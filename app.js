const { DEFAULT_SELECTION } = require('./utils/analysis')

App({
  globalData: {
    mode: 'synthetic_demo',
    selection: { ...DEFAULT_SELECTION },
    lastChosenRegionId: DEFAULT_SELECTION.regionId,
    tabTransition: null
  }
})
