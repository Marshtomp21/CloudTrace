const STORAGE_KEY = 'cloudtrace.demoChats.v1'

function makeSession(now = Date.now()) {
  return {
    id: `demo_${now}_${Math.random().toString(36).slice(2, 8)}`,
    title: '新对话',
    createdAt: now,
    updatedAt: now,
    context: {},
    messages: []
  }
}

function createStore() {
  const session = makeSession()
  return { activeId: session.id, sessions: [session] }
}

function normalizeStore(raw) {
  if (!raw || !Array.isArray(raw.sessions)) return createStore()
  const sessions = raw.sessions.filter(item => item && typeof item.id === 'string' && Array.isArray(item.messages))
    .map(item => ({ ...item, context: item.context || {}, title: item.title || '新对话' }))
  if (!sessions.length) return createStore()
  const activeId = sessions.some(item => item.id === raw.activeId) ? raw.activeId : sessions[0].id
  return { activeId, sessions }
}

function readStore(storage) {
  try {
    return normalizeStore(storage.getStorageSync(STORAGE_KEY))
  } catch (error) {
    return createStore()
  }
}

function saveStore(storage, store) {
  try {
    storage.setStorageSync(STORAGE_KEY, store)
    return true
  } catch (error) {
    return false
  }
}

function activeSession(store) {
  return store.sessions.find(item => item.id === store.activeId) || store.sessions[0]
}

function startSession(store) {
  const session = makeSession()
  return { activeId: session.id, sessions: [session, ...store.sessions] }
}

function activateSession(store, id) {
  return store.sessions.some(item => item.id === id) ? { ...store, activeId: id } : store
}

function removeSession(store, id) {
  const sessions = store.sessions.filter(item => item.id !== id)
  if (!sessions.length) return createStore()
  return { activeId: store.activeId === id ? sessions[0].id : store.activeId, sessions }
}

function appendExchange(store, userText, answer) {
  const now = Date.now()
  const sessions = store.sessions.map(session => {
    if (session.id !== store.activeId) return session
    const suffix = Math.random().toString(36).slice(2, 8)
    const userMessage = { id: `u_${now}_${suffix}`, role: 'user', text: userText }
    const assistantMessage = { id: `a_${now}_${suffix}`, role: 'assistant', ...answer }
    return {
      ...session,
      title: session.messages.length ? session.title : userText.slice(0, 18),
      updatedAt: now,
      context: answer.context || session.context,
      messages: [...session.messages, userMessage, assistantMessage]
    }
  })
  return { ...store, sessions }
}

module.exports = {
  STORAGE_KEY, createStore, normalizeStore, readStore, saveStore,
  activeSession, startSession, activateSession, removeSession, appendExchange
}
