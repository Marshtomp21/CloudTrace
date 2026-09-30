const { sample, leads, probabilities, scenarios, regions, objects, basis } = require('./mock')

const DEFAULT_SELECTION = { scenarioId: 'weather', leadMin: 60, regionId: 'r1' }

function normalizeSelection(value) {
  const input = value || {}
  return {
    scenarioId: scenarios.some(item => item.id === input.scenarioId) ? input.scenarioId : DEFAULT_SELECTION.scenarioId,
    leadMin: leads.includes(Number(input.leadMin)) ? Number(input.leadMin) : DEFAULT_SELECTION.leadMin,
    regionId: regions.some(item => item.id === input.regionId) ? input.regionId : DEFAULT_SELECTION.regionId
  }
}

function statusFor(probability) {
  if (probability >= 70) return { label: '重点关注', key: 'critical' }
  if (probability >= 50) return { label: '需关注', key: 'watch' }
  return { label: '观察', key: 'observe' }
}

function regionViewsAt(leadMin) {
  const values = probabilities[leadMin] || probabilities[DEFAULT_SELECTION.leadMin]
  return regions.map(region => {
    const probability = values[region.id]
    const status = statusFor(probability)
    return { ...region, probability, level: status.label, statusKey: status.key }
  }).sort((a, b) => b.probability - a.probability)
}

function getAnalysis(value) {
  const selection = normalizeSelection(value)
  const regionViews = regionViewsAt(selection.leadMin)
  const scenario = scenarios.find(item => item.id === selection.scenarioId)
  const selectedRegion = regionViews.find(item => item.id === selection.regionId)
  const focusIds = scenario.id === 'event' ? [selection.regionId] : scenario.focusRegionIds
  const focusRegions = focusIds.map(id => regionViews.find(item => item.id === id)).filter(Boolean)
  const focusRegion = focusRegions[0] || regionViews[0]
  const leadViews = leads.map(min => ({ min, maxProbability: regionViewsAt(min)[0].probability }))
  // 场景柱图只汇总同一份样本中的关注区域，不生成新的场景预报。
  const scenarioLeadLabel = focusIds.length === 1
    ? `${focusRegion.shortName}区域概率`
    : `${focusIds.length}个关注区域的概率均值`
  const scenarioLeadViews = leads.map(min => {
    const values = probabilities[min]
    const probability = Math.round(focusIds.reduce((sum, id) => sum + values[id], 0) * 10 / focusIds.length) / 10
    return { min, probability }
  })
  const objectViews = objects.map(item => ({ ...item, related: item.regionId === selection.regionId }))
    .sort((a, b) => Number(b.related) - Number(a.related))
  const relatedObject = objectViews.find(item => item.related)
  const regionBasis = basis.map(item => {
    if (item.id === 'radar') return {
      ...item,
      value: `${relatedObject.label} · ${relatedObject.kind}`,
      detail: `关联${selectedRegion.shortName} · 最大 VIL ${relatedObject.maxVil}，平均 VIL ${relatedObject.meanVil}`
    }
    if (item.id === 'movement') return {
      ...item,
      value: relatedObject.movement,
      detail: selectedRegion.reason
    }
    return item
  })

  return {
    sample,
    selection,
    scenario,
    scenarios,
    regions: regionViews,
    selectedRegion,
    focusRegions,
    focusRegion,
    maxRegion: regionViews[0],
    leadViews,
    scenarioLeadLabel,
    scenarioLeadViews,
    objects: objectViews,
    basis: regionBasis
  }
}

module.exports = { DEFAULT_SELECTION, normalizeSelection, statusFor, regionViewsAt, getAnalysis }
