const leads = [
  { min: 10, probability: 42, level: '低风险' }, { min: 20, probability: 55, level: '低风险' }, { min: 30, probability: 68, level: '需关注' }, { min: 40, probability: 74, level: '需关注' }, { min: 50, probability: 79, level: '需关注' }, { min: 60, probability: 83, level: '重点关注' }
]
const scenarios = [
  { id: 'weather', label: '气象播报', icon: '☁', desc: '组织天气趋势与影响范围' },
  { id: 'airport', label: '机场调度', icon: '✈', desc: '关注跑道与进离港窗口' },
  { id: 'city', label: '城市防汛', icon: '⌁', desc: '提前安排积水点巡查' },
  { id: 'event', label: '活动园区', icon: '◇', desc: '评估人群与设施风险' }
]
const regions = [
  { id: 'r1', name: '东湖高新区', level: '重点关注', probability: 83, time: '约 35 分钟后', color: 'red', reason: '主回波移动方向与区域重叠' },
  { id: 'r2', name: '武汉天河机场', level: '需关注', probability: 68, time: '约 48 分钟后', color: 'orange', reason: '北侧单体新生，向东南移动' },
  { id: 'r3', name: '汉口核心区', level: '观察', probability: 42, time: '约 55 分钟后', color: 'blue', reason: '外围概率带接近，强度仍有限' }
]
const objects = [
  { id: 'F007-O001', label: '主回波', kind: '增强', area: 184, meanVil: 38.2, maxVil: 51.4, confidence: 96, center: '32.6, 28.1', movement: '东南方向 24 km/h' },
  { id: 'F007-O002', label: '北侧单体', kind: '新生', area: 76, meanVil: 34.6, maxVil: 43.8, confidence: 88, center: '18.2, 11.7', movement: '东南方向 18 km/h' },
  { id: 'F007-O003', label: '南侧回波', kind: '减弱', area: 51, meanVil: 29.4, maxVil: 36.1, confidence: 82, center: '45.8, 49.3', movement: '东移 12 km/h' }
]
const basis = [
  { title: '雷达回波', value: '主回波增强', detail: '过去 10 分钟最大 VIL 由 44.8 升至 51.4', icon: 'R' },
  { title: '卫星云图', value: '云顶快速发展', detail: '红外亮温下降，顶部对流继续抬升', icon: 'S' },
  { title: '移动趋势', value: '向东南移动', detail: '对象质心平均移动速度约 22 km/h', icon: '→' },
  { title: '历史帧一致性', value: '8 / 8 帧有效', detail: '当前历史窗口无缺测，结论可追溯', icon: '✓' }
]
module.exports = { leads, scenarios, regions, objects, basis }
