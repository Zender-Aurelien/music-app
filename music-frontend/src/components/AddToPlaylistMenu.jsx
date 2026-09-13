import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/auth-context'
import { addTrackToPlaylist, createPlaylist, listPlaylists } from '../api/playlists'
import './AddToPlaylistMenu.css'

export function AddToPlaylistMenu({ track }) {
    const { status: authStatus } = useAuth()
    const [open, setOpen] = useState(false)
    const [playlists, setPlaylists] = useState(null)
    const [loading, setLoading] = useState(false)
    const [addedIds, setAddedIds] = useState(() => new Set())
    const [newName, setNewName] = useState('')
    const [message, setMessage] = useState('')
    const rootRef = useRef(null)

    useEffect(() => {
        if (!open) return

        function handleClickOutside(e) {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    function toggleOpen() {
        if (authStatus !== 'authenticated') {
            setMessage('Sign in to save playlists')
            return
        }
        setMessage('')
        setOpen(prev => {
            const next = !prev
            if (next && playlists === null) {
                setLoading(true)
                listPlaylists()
                    .then(setPlaylists)
                    .catch(() => setMessage('Could not load playlists'))
                    .finally(() => setLoading(false))
            }
            return next
        })
    }

    async function handleAdd(playlistId) {
        try {
            await addTrackToPlaylist(playlistId, track)
            setAddedIds(prev => new Set(prev).add(playlistId))
        } catch {
            setMessage('Could not add track')
        }
    }

    async function handleCreateAndAdd(e) {
        e.preventDefault()
        const name = newName.trim()
        if (!name) return

        try {
            const playlist = await createPlaylist(name)
            await addTrackToPlaylist(playlist.id, track)
            setPlaylists(prev => [playlist, ...(prev || [])])
            setAddedIds(prev => new Set(prev).add(playlist.id))
            setNewName('')
        } catch {
            setMessage('Could not create playlist')
        }
    }

    return (
        <div className="add-to-playlist" ref={rootRef}>
            <button
                type="button"
                className="add-to-playlist-button"
                onClick={toggleOpen}
                aria-label="Add to playlist"
                title="Add to playlist"
            >
                +
            </button>

            {message && !open && <span className="add-to-playlist-hint">{message}</span>}

            {open && (
                <div className="add-to-playlist-menu">
                    {loading && <p className="add-to-playlist-status">Loading playlists...</p>}
                    {!loading && message && <p className="add-to-playlist-status">{message}</p>}
                    {!loading && playlists && playlists.length === 0 && (
                        <p className="add-to-playlist-status">No playlists yet.</p>
                    )}
                    {!loading && playlists && playlists.length > 0 && (
                        <ul className="add-to-playlist-list">
                            {playlists.map(p => (
                                <li key={p.id}>
                                    <button
                                        type="button"
                                        className="add-to-playlist-item"
                                        onClick={() => handleAdd(p.id)}
                                    >
                                        {p.name}
                                        {addedIds.has(p.id) && <span className="add-to-playlist-check">Added</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <form className="add-to-playlist-new" onSubmit={handleCreateAndAdd}>
                        <input
                            type="text"
                            placeholder="New playlist..."
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                        <button type="submit" disabled={!newName.trim()}>Add</button>
                    </form>
                </div>
            )}
        </div>
    )
}
