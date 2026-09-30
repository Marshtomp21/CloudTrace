const sample = {
  id: 'wuhan-f007-demo',
  area: '武汉及周边',
  sampleTime: '12:10',
  durationMin: 60,
  label: '固定合成样本',
  note: '以下概率、回波和区域位置均为合成演示，不能用作实时预警。'
}

const leads = [10, 20, 30, 40, 50, 60]

// 每个时点的区域概率都显式存放在样本中。页面和演示问答只从这里取数。
const probabilities = {
  10: { r1: 42, r2: 20, r3: 9 },
  20: { r1: 55, r2: 31, r3: 15 },
  30: { r1: 68, r2: 41, r3: 22 },
  40: { r1: 74, r2: 51, r3: 29 },
  50: { r1: 79, r2: 60, r3: 36 },
  60: { r1: 83, r2: 68, r3: 42 }
}

const scenarios = [
  { id: 'weather', label: '气象播报', desc: '先看全域变化与重点区域', focusRegionIds: ['r1', 'r2', 'r3'], advice: '先概括东湖高新区的较高概率，再说明机场与汉口的变化。' },
  { id: 'airport', label: '机场调度', desc: '优先查看天河机场窗口', focusRegionIds: ['r2'], advice: '优先核对天河机场的影响窗口，并结合人工值守安排调度。' },
  { id: 'city', label: '城市防汛', desc: '关注东湖与汉口区域', focusRegionIds: ['r1', 'r3'], advice: '优先核对东湖高新区和汉口核心区的变化；积水判断仍需地面信息。' },
  { id: 'event', label: '活动园区', desc: '围绕所选样本区域查看', focusRegionIds: [], advice: '先选定活动所在的样本区域，再核对户外作业与人员活动窗口。' }
]

const regions = [
  { id: 'r1', name: '东湖高新区', shortName: '东湖高新区', arrival: '约 35 分钟后', reason: '主回波移动方向与区域重叠', objectIds: ['F007-O001'] },
  { id: 'r2', name: '武汉天河机场', shortName: '天河机场', arrival: '约 48 分钟后', reason: '北侧单体新生并向东南移动', objectIds: ['F007-O002'] },
  { id: 'r3', name: '汉口核心区', shortName: '汉口核心区', arrival: '约 55 分钟后', reason: '外围概率带接近，强度仍有限', objectIds: ['F007-O003'] }
]

const objects = [
  { id: 'F007-O001', label: '主回波', kind: '增强', regionId: 'r1', area: 184, meanVil: 38.2, maxVil: 51.4, movement: '东南方向 24 km/h' },
  { id: 'F007-O002', label: '北侧单体', kind: '新生', regionId: 'r2', area: 76, meanVil: 34.6, maxVil: 43.8, movement: '东南方向 18 km/h' },
  { id: 'F007-O003', label: '南侧回波', kind: '减弱', regionId: 'r3', area: 51, meanVil: 29.4, maxVil: 36.1, movement: '东移 12 km/h' }
]

const basis = [
  { id: 'radar', title: '雷达回波', value: '主回波增强', detail: '过去 10 分钟最大 VIL 由 44.8 升至 51.4' },
  { id: 'satellite', title: '卫星云图', value: '云顶快速发展', detail: '红外亮温下降，顶部对流继续抬升' },
  { id: 'movement', title: '移动趋势', value: '向东南移动', detail: '对象质心平均移动速度约 22 km/h' },
  { id: 'history', title: '历史帧一致性', value: '8 / 8 帧有效', detail: '当前样本的历史窗口无缺测' }
]

module.exports = { sample, leads, probabilities, scenarios, regions, objects, basis }
