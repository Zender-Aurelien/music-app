import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { createPlaylist, listPlaylists } from '../api/playlists'
import './LibraryPage.css'

export function LibraryPage() {
    const { status: authStatus } = useAuth()
    const [playlists, setPlaylists] = useState([])
    const [status, setStatus] = useState('loading') // loading | done | error
    const [newName, setNewName] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        if (authStatus !== 'authenticated') return

        let cancelled = false
        listPlaylists()
            .then(data => {
                if (cancelled) return
                setPlaylists(data)
                setStatus('done')
            })
            .catch(() => {
                if (cancelled) return
                setStatus('error')
            })

        return () => { cancelled = true }
    }, [authStatus])

    async function handleCreate(e) {
        e.preventDefault()
        const name = newName.trim()
        if (!name || creating) return

        setCreating(true)
        try {
            const playlist = await createPlaylist(name)
            setPlaylists(prev => [playlist, ...prev])
            setNewName('')
        } catch {
            setStatus('error')
        } finally {
            setCreating(false)
        }
    }

    if (authStatus === 'loading') {
        return <p className="status">Loading...</p>
    }

    if (authStatus === 'anonymous') {
        return <p className="status">Sign in with Google to see your playlists.</p>
    }

    return (
        <div className="library">
            <form className="create-playlist-form" onSubmit={handleCreate}>
                <input
                    className="search-input"
                    type="text"
                    placeholder="New playlist name..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                />
                <button className="navbar-button" type="submit" disabled={creating || !newName.trim()}>
                    Create
                </button>
            </form>

            {status === 'loading' && <p className="status">Loading your playlists...</p>}
            {status === 'error' && <p className="status error">Something went wrong.</p>}
            {status === 'done' && playlists.length === 0 && (
                <p className="status">You don't have any playlists yet.</p>
            )}

            <ul className="playlist-list">
                {playlists.map(playlist => (
                    <li key={playlist.id} className="playlist-card">
                        <Link to={`/playlists/${playlist.id}`} className="playlist-link">
                            <span className="playlist-name">{playlist.name}</span>
                            <span className="playlist-meta">
                                {playlist.track_count} {playlist.track_count === 1 ? 'track' : 'tracks'}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
