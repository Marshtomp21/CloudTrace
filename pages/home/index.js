const { getAnalysis } = require('../../utils/analysis')
const { readSelection, updateSelection } = require('../../utils/selection')
const { answerDemo, getQuickQuestions } = require('../../utils/demo-chat')
const {
  readStore, saveStore, activeSession, startSession,
  activateSession, removeSession, appendExchange
} = require('../../utils/sessions')

function formatDate(timestamp) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

Page({
  data: {
    vm: null,
    quickQuestions: [],
    messages: [],
    sessions: [],
    inputText: '',
    canSend: false,
    isMultiline: false,
    composerHeight: 80,
    scrollTo: '',
    showHistory: false,
    saveWarning: false
  },

  onLoad() {
    this.chatStore = readStore(wx)
    this.renderStore()
  },

  onShow() {
    wx.setNavigationBarTitle({ title: '云迹先知' })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.activate(0)
    const vm = getAnalysis(readSelection(getApp()))
    this.setData({ vm, quickQuestions: getQuickQuestions(vm.selection.scenarioId) })
  },

  renderStore() {
    const session = activeSession(this.chatStore)
    const sessions = this.chatStore.sessions.map(item => ({
      id: item.id,
      title: item.title,
      updatedLabel: formatDate(item.updatedAt),
      count: Math.floor(item.messages.length / 2),
      active: item.id === this.chatStore.activeId
    }))
    this.setData({ messages: session.messages, sessions }, () => {
      const last = session.messages[session.messages.length - 1]
      if (last) this.setData({ scrollTo: `msg-${last.id}` })
    })
  },

  persist() {
    this.setData({ saveWarning: !saveStore(wx, this.chatStore) })
  },

  onInput(e) {
    const inputText = e.detail.value || ''
    const next = { inputText, canSend: !!inputText.trim() }
    if (!inputText) {
      next.isMultiline = false
      next.composerHeight = 80
    }
    this.setData(next)
  },

  onInputLineChange(e) {
    const lines = Math.max(1, Number(e.detail.lineCount) || 1)
    const isMultiline = lines > 1
    const composerHeight = isMultiline ? Math.min(180, lines * 44) + 30 : 80
    if (this.data.isMultiline !== isMultiline || this.data.composerHeight !== composerHeight) {
      this.setData({ isMultiline, composerHeight })
    }
  },

  send() {
    this.sendText(this.data.inputText)
  },

  sendQuick(e) {
    this.sendText(e.currentTarget.dataset.question)
  },

  sendText(rawText) {
    const text = String(rawText || '').trim()
    if (!text) return
    const session = activeSession(this.chatStore)
    const answer = answerDemo(text, readSelection(getApp()), session.context)
    this.chatStore = appendExchange(this.chatStore, text, answer)
    this.persist()
    this.setData({ inputText: '', canSend: false, isMultiline: false, composerHeight: 80 })
    this.renderStore()
  },

  openHistory() {
    this.setData({ showHistory: true })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ hidden: true })
  },
  closeHistory() {
    this.setData({ showHistory: false })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ hidden: false })
  },
  stopMask() {},

  newChat() {
    this.chatStore = startSession(this.chatStore)
    this.persist()
    this.setData({ showHistory: false, inputText: '', canSend: false, isMultiline: false, composerHeight: 80, scrollTo: '' })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ hidden: false })
    this.renderStore()
  },

  selectHistory(e) {
    this.chatStore = activateSession(this.chatStore, e.currentTarget.dataset.id)
    this.persist()
    this.setData({ showHistory: false, scrollTo: '' })
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ hidden: false })
    this.renderStore()
  },

  deleteHistory(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除这条对话？',
      content: '这会删除当前设备保存的该条记录。',
      confirmText: '删除',
      confirmColor: '#B33B3F',
      success: result => {
        if (!result.confirm) return
        this.chatStore = removeSession(this.chatStore, id)
        this.persist()
        this.renderStore()
      }
    })
  },

  goWorkbench() { wx.switchTab({ url: '/pages/workbench/index' }) },

  goAction(e) {
    const data = e.currentTarget.dataset
    const patch = {}
    if (data.region) patch.regionId = data.region
    if (data.lead) patch.leadMin = Number(data.lead)
    updateSelection(getApp(), patch)
    if (data.url === '/pages/evidence/index' || data.url === '/pages/workbench/index') {
      wx.switchTab({ url: data.url })
    } else {
      wx.navigateTo({ url: data.url })
    }
  }
})
