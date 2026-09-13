import { useEffect, useState, useCallback } from 'react'
import { getMe, logout as apiLogout } from '../api/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    // 'loading' | 'authenticated' | 'anonymous'
    const [status, setStatus] = useState('loading')

    useEffect(() => {
        let cancelled = false

        getMe()
            .then(u => {
                if (cancelled) return
                setUser(u)
                setStatus(u ? 'authenticated' : 'anonymous')
            })
            .catch(() => {
                if (cancelled) return
                setUser(null)
                setStatus('anonymous')
            })

        return () => { cancelled = true }
    }, [])

    const logout = useCallback(async () => {
        await apiLogout()
        setUser(null)
        setStatus('anonymous')
    }, [])

    return (
        <AuthContext.Provider value={{ user, status, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
