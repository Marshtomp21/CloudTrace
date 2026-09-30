const test = require('node:test')
const assert = require('node:assert/strict')

const { DEFAULT_SELECTION, getAnalysis, regionViewsAt } = require('../utils/analysis')
const { updateSelection } = require('../utils/selection')
const { answerDemo, getQuickQuestions } = require('../utils/demo-chat')
const {
  createStore, activeSession, startSession, activateSession,
  removeSession, appendExchange, readStore, saveStore
} = require('../utils/sessions')

test('all forecast summaries and ranking use the same lead table', () => {
  const expectedMax = [42, 55, 68, 74, 79, 83]
  const view = getAnalysis(DEFAULT_SELECTION)
  assert.deepEqual(view.leadViews.map(item => item.maxProbability), expectedMax)
  for (const lead of view.leadViews) {
    const ranked = regionViewsAt(lead.min)
    assert.equal(ranked[0].probability, lead.maxProbability)
    assert.ok(ranked.every((item, index) => index === 0 || ranked[index - 1].probability >= item.probability))
  }
  assert.deepEqual(view.regions.map(item => item.probability), [83, 68, 42])
  assert.deepEqual(view.regions.map(item => item.level), ['重点关注', '需关注', '观察'])
})

test('scenario changes focus and prompts without changing sample probabilities', () => {
  const weather = getAnalysis({ ...DEFAULT_SELECTION, scenarioId: 'weather' })
  const airport = getAnalysis({ ...DEFAULT_SELECTION, scenarioId: 'airport' })
  const city = getAnalysis({ ...DEFAULT_SELECTION, scenarioId: 'city' })
  const event = getAnalysis({ ...DEFAULT_SELECTION, scenarioId: 'event', regionId: 'r3' })
  assert.equal(airport.focusRegion.id, 'r2')
  assert.deepEqual(city.focusRegions.map(item => item.id), ['r1', 'r3'])
  assert.equal(event.focusRegion.id, 'r3')
  assert.deepEqual(weather.regions.map(item => item.probability), airport.regions.map(item => item.probability))
  assert.match(getQuickQuestions('airport')[0], /天河机场/)
  assert.match(airport.basis[0].value, /主回波/)
  assert.match(getAnalysis({ ...DEFAULT_SELECTION, regionId: 'r2' }).basis[0].value, /北侧单体/)
})

test('scenario chart derives different series from the same regional sample', () => {
  const weather = getAnalysis({ ...DEFAULT_SELECTION, scenarioId: 'weather' })
  const airport = getAnalysis({ ...DEFAULT_SELECTION, scenarioId: 'airport' })
  const city = getAnalysis({ ...DEFAULT_SELECTION, scenarioId: 'city' })
  const event = getAnalysis({ ...DEFAULT_SELECTION, scenarioId: 'event' })
  const values = view => view.scenarioLeadViews.map(item => item.probability)

  assert.deepEqual(values(weather), [23.7, 33.7, 43.7, 51.3, 58.3, 64.3])
  assert.deepEqual(values(airport), [20, 31, 41, 51, 60, 68])
  assert.deepEqual(values(city), [25.5, 35, 45, 51.5, 57.5, 62.5])
  assert.deepEqual(values(event), [42, 55, 68, 74, 79, 83])
  for (let index = 0; index < 6; index += 1) {
    assert.equal(new Set([weather, airport, city, event].map(view => values(view)[index])).size, 4)
  }
  assert.equal(weather.scenarioLeadLabel, '3个关注区域的概率均值')
  assert.equal(airport.scenarioLeadLabel, '天河机场区域概率')
  assert.equal(city.scenarioLeadLabel, '2个关注区域的概率均值')
  assert.deepEqual(values(getAnalysis({ ...DEFAULT_SELECTION, scenarioId: 'event', regionId: 'r3' })), [9, 15, 22, 29, 36, 42])
  assert.deepEqual(airport.leadViews, weather.leadViews)
})

test('automatic scenario focus does not replace the last manually chosen region', () => {
  const app = { globalData: { selection: { ...DEFAULT_SELECTION }, lastChosenRegionId: DEFAULT_SELECTION.regionId } }
  updateSelection(app, { scenarioId: 'airport', regionId: 'r2' })
  assert.equal(app.globalData.lastChosenRegionId, 'r1')
  updateSelection(app, { regionId: 'r3' })
  assert.equal(app.globalData.lastChosenRegionId, 'r3')
  updateSelection(app, { scenarioId: 'city', regionId: 'r1' })
  assert.equal(app.globalData.lastChosenRegionId, 'r3')
})

test('demo replies use explicit and follow-up context and expose limits', () => {
  const airport = answerDemo('天河机场 30 分钟后概率？', DEFAULT_SELECTION, {})
  assert.equal(airport.context.regionId, 'r2')
  assert.equal(airport.context.leadMin, 30)
  assert.match(airport.body, /41%/)
  const followUp = answerDemo('为什么这样判断？', DEFAULT_SELECTION, airport.context)
  assert.match(followUp.title, /天河机场/)
  assert.match(followUp.source, /30 分钟/)
  const scenarioQuestion = answerDemo('为什么这样判断？', { ...DEFAULT_SELECTION, scenarioId: 'airport' }, {})
  assert.match(scenarioQuestion.title, /天河机场/)
  const unknown = answerDemo('帮我预订机票', DEFAULT_SELECTION, {})
  assert.match(unknown.body, /本地演示|可以询问/)
  const boundary = answerDemo('这是实时预警吗？', DEFAULT_SELECTION, {})
  assert.match(boundary.body, /没有实时/)
})

test('local sessions retain history and handle storage failure', () => {
  let stored = null
  const storage = { getStorageSync: () => stored, setStorageSync: (key, value) => { stored = value } }
  let store = createStore()
  const firstId = store.activeId
  store = appendExchange(store, '未来一小时哪里会受影响？', answerDemo('未来一小时哪里会受影响？', DEFAULT_SELECTION, {}))
  assert.equal(activeSession(store).messages.length, 2)
  assert.equal(saveStore(storage, store), true)
  assert.equal(readStore(storage).sessions[0].title, '未来一小时哪里会受影响？'.slice(0, 18))
  store = startSession(store)
  const secondId = store.activeId
  assert.notEqual(secondId, firstId)
  store = activateSession(store, firstId)
  assert.equal(activeSession(store).messages.length, 2)
  store = removeSession(store, firstId)
  assert.equal(store.activeId, secondId)
  assert.equal(saveStore({ setStorageSync: () => { throw new Error('full') } }, store), false)
})
