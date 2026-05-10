// ============================================================
//  AUTH HELPERS — JWT-style token using localStorage session
//  Tokens are base64-encoded JSON with expiry; no real crypto.
// ============================================================

const SESSION_KEY = 'bookease_session'
const TOKEN_TTL   = 86400000 * 7   // 7 days in ms

export function createToken(user) {
  const payload = { id: user.id, role: user.role, exp: Date.now() + TOKEN_TTL }
  return btoa(JSON.stringify(payload))
}

export function parseToken(token) {
  try { return JSON.parse(atob(token)) } catch { return null }
}

export function isTokenValid(token) {
  const data = parseToken(token)
  return data && data.exp > Date.now()
}

export function saveSession(userId, token) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, token }))
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!isTokenValid(session.token)) { clearSession(); return null }
    return session
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
