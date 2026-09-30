const { getAnalysis, normalizeSelection } = require('./analysis')

const FORECAST_URL = '/pages/overview/index'
const REGION_URL = '/pages/objects/index'
const EVIDENCE_URL = '/pages/evidence/index'

function explicitRegionId(text) {
  if (/东湖|高新/.test(text)) return 'r1'
  if (/天河|机场/.test(text)) return 'r2'
  if (/汉口/.test(text)) return 'r3'
  return null
}

function explicitLeadMin(text) {
  if (/一小时|1\s*小时/.test(text)) return 60
  if (/半小时/.test(text)) return 30
  const match = text.match(/(?:\+|未来|后)?\s*(10|20|30|40|50|60)\s*(?:分钟|分|min)/i)
  return match ? Number(match[1]) : null
}

function getQuickQuestions(scenarioId) {
  const common = ['未来一小时哪里会受影响？', '为什么这样判断？', '查看回波对象']
  if (scenarioId === 'airport') return ['天河机场何时需关注？', '机场调度建议', ...common.slice(1)]
  if (scenarioId === 'city') return ['城市防汛建议', '东湖高新区的影响', ...common.slice(1)]
  if (scenarioId === 'event') return ['活动园区建议', '所选区域的影响', ...common.slice(1)]
  return common
}

function answerDemo(rawText, selectionValue, priorContext) {
  const text = String(rawText || '').trim()
  const selection = normalizeSelection(selectionValue)
  const prior = priorContext || {}
  const isFollowUp = /这里|那里|该区域|这个|它|为什么|依据|证据/.test(text)
  const regionId = explicitRegionId(text) || (isFollowUp && prior.regionId) || getAnalysis(selection).focusRegion.id
  const leadMin = explicitLeadMin(text) || (isFollowUp && prior.leadMin) || selection.leadMin
  const vm = getAnalysis({ ...selection, regionId, leadMin })
  const region = vm.selectedRegion
  const context = { regionId, leadMin }
  const source = `固定合成样本 ${vm.sample.sampleTime} · +${leadMin} 分钟`
  const action = (label, url) => ({ label, url, kind: url === EVIDENCE_URL ? 'tab' : 'page' })

  if (/实时|预警|准确|数据来源|局限|边界|降雨|积水|真假/.test(text)) {
    return {
      title: '这份数据的使用边界',
      body: '当前只有固定合成样本，没有实时雷达、卫星、预报或 AI 服务。VIL 表示强回波相关变量，不能直接当作降雨量或积水深度。区域位置也只是示意。',
      facts: [], source, context,
      actions: [action('查看使用边界', EVIDENCE_URL)]
    }
  }

  if (/为什么|依据|证据|如何判断|怎么判断/.test(text)) {
    const object = vm.objects.find(item => item.related)
    return {
      title: `${region.shortName}的判断依据`,
      body: `${region.reason}。关联的${object.label}处于${object.kind}状态，样本还提供卫星云顶发展和历史帧信息；这些项目可在依据页逐项复核。`,
      facts: [{ label: '该时点可能性', value: `${region.probability}%` }, { label: '估计进入窗口', value: region.arrival }],
      source, context,
      actions: [action('查看完整依据', EVIDENCE_URL), action('查看区域', REGION_URL)]
    }
  }

  if (/回波|对象|VIL|轨迹|移动/.test(text)) {
    const object = vm.objects.find(item => item.related)
    return {
      title: `${region.shortName}的相关回波`,
      body: `${object.label}处于${object.kind}状态，移动趋势为${object.movement}。这是合成对象属性，图上的位置并非地理坐标。`,
      facts: [{ label: '最大 VIL', value: String(object.maxVil) }, { label: '样本面积', value: `${object.area} km²` }],
      source, context,
      actions: [action('查看回波对象', REGION_URL), action('查看依据', EVIDENCE_URL)]
    }
  }

  if (/建议|调度|防汛|活动|园区|播报|场景/.test(text)) {
    return {
      title: `${vm.scenario.label}的关注点`,
      body: vm.scenario.advice,
      facts: vm.focusRegions.map(item => ({ label: item.shortName, value: `${item.probability}%` })),
      source, context,
      actions: [action('进入研判', '/pages/workbench/index'), action('查看依据', EVIDENCE_URL)]
    }
  }

  if (explicitRegionId(text) || /所选区域|该区域|区域影响|何时|什么时候/.test(text)) {
    return {
      title: `${region.shortName} · +${leadMin} 分钟`,
      body: `样本中的强回波超阈值可能性为 ${region.probability}%，属于“${region.level}”。估计${region.arrival}进入影响窗口；${region.reason}。`,
      facts: [{ label: '可能性', value: `${region.probability}%` }, { label: '估计窗口', value: region.arrival }],
      source, context,
      actions: [action('查看区域详情', REGION_URL), action('查看预测', FORECAST_URL)]
    }
  }

  if (/未来|一小时|分钟|预测|哪里|概况|概率|影响|趋势/.test(text)) {
    return {
      title: `未来 +${leadMin} 分钟的区域影响`,
      body: `样本中最高的是${vm.maxRegion.shortName}，超阈值可能性 ${vm.maxRegion.probability}%。下列数值对应同一预测时点，可继续查看区域排序和依据。`,
      facts: vm.regions.map(item => ({ label: item.shortName, value: `${item.probability}%` })),
      source, context: { regionId: vm.maxRegion.id, leadMin },
      actions: [action('查看预测', FORECAST_URL), action('查看依据', EVIDENCE_URL)]
    }
  }

  return {
    title: '本地演示可查询的内容',
    body: '可以询问未来 10–60 分钟的区域影响、东湖高新区或天河机场等样本区域、回波对象、判断依据与场景建议。其它问题需要后续接入真实服务。',
    facts: [], source, context,
    actions: [action('进入研判', '/pages/workbench/index')]
  }
}

module.exports = { answerDemo, getQuickQuestions, explicitRegionId, explicitLeadMin }
