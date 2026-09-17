export async function getMe() {
    const res = await fetch('/api/auth/me')
    if (!res.ok) throw new Error(`GET /api/auth/me failed: ${res.status}`)
    const data = await res.json()
    return data.user
}

export async function logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' })
    if (!res.ok) throw new Error(`POST /api/auth/logout failed: ${res.status}`)
}
