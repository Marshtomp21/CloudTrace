const { DEFAULT_SELECTION, normalizeSelection } = require('./analysis')

function readSelection(app) {
  return normalizeSelection(app.globalData.selection || DEFAULT_SELECTION)
}

function updateSelection(app, patch) {
  const next = normalizeSelection({ ...readSelection(app), ...patch })
  app.globalData.selection = next
  if (Object.prototype.hasOwnProperty.call(patch, 'regionId') && !Object.prototype.hasOwnProperty.call(patch, 'scenarioId')) {
    app.globalData.lastChosenRegionId = next.regionId
  }
  return next
}

module.exports = { readSelection, updateSelection }
