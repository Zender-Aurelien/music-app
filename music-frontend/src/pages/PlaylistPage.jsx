import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    deletePlaylist,
    getPlaylist,
    removeTrackFromPlaylist,
    renamePlaylist,
} from '../api/playlists'
import { shuffle } from '../utils/shuffle'
import '../styles/shared.css'
import './PlaylistPage.css'

export function PlaylistPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [playlist, setPlaylist] = useState(null)
    const [status, setStatus] = useState('loading') // loading | done | error
    // The order actually rendered/played. Starts equal to the playlist's
    // saved order; Shuffle only ever changes this, never `playlist`, so
    // the saved order in the database is never touched.
    const [playbackOrder, setPlaybackOrder] = useState([])
    const [shuffled, setShuffled] = useState(false)
    const [isEditingName, setIsEditingName] = useState(false)
    const [nameDraft, setNameDraft] = useState('')

    useEffect(() => {
        let cancelled = false
        getPlaylist(id)
            .then(data => {
                if (cancelled) return
                setPlaylist(data)
                setPlaybackOrder(data.tracks)
                setShuffled(false)
                setStatus('done')
            })
            .catch(() => {
                if (cancelled) return
                setStatus('error')
            })
        return () => { cancelled = true }
    }, [id])

    function handleShuffle() {
        setPlaybackOrder(shuffle(playlist.tracks))
        setShuffled(true)
    }

    function handleUnshuffle() {
        setPlaybackOrder(playlist.tracks)
        setShuffled(false)
    }

    async function handleRemoveTrack(trackRowId) {
        try {
            await removeTrackFromPlaylist(playlist.id, trackRowId)
            const updated = await getPlaylist(playlist.id)
            setPlaylist(updated)
            setPlaybackOrder(shuffled ? shuffle(updated.tracks) : updated.tracks)
        } catch {
            setStatus('error')
        }
    }

    function startRename() {
        setNameDraft(playlist.name)
        setIsEditingName(true)
    }

    async function submitRename(e) {
        e.preventDefault()
        const name = nameDraft.trim()
        if (!name) return
        const updated = await renamePlaylist(playlist.id, name)
        setPlaylist(updated)
        setIsEditingName(false)
    }

    async function handleDelete() {
        await deletePlaylist(playlist.id)
        navigate('/playlists')
    }

    if (status === 'loading') return <p className="status">Loading...</p>
    if (status === 'error') return <p className="status error">Something went wrong.</p>
    if (!playlist) return null

    return (
        <div className="playlist-page">
            <div className="playlist-header">
                {isEditingName ? (
                    <form onSubmit={submitRename} className="playlist-rename-form">
                        <input
                            className="search-input"
                            value={nameDraft}
                            onChange={e => setNameDraft(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="navbar-button">Save</button>
                        <button type="button" className="navbar-button" onClick={() => setIsEditingName(false)}>
                            Cancel
                        </button>
                    </form>
                ) : (
                    <>
                        <h1 className="playlist-title">{playlist.name}</h1>
                        <div className="playlist-actions">
                            <button className="navbar-button" onClick={startRename}>Rename</button>
                            <button
                                className="navbar-button"
                                onClick={shuffled ? handleUnshuffle : handleShuffle}
                                disabled={playlist.tracks.length < 2}
                            >
                                {shuffled ? 'Un-shuffle' : 'Shuffle'}
                            </button>
                            <button className="navbar-button" onClick={handleDelete}>Delete</button>
                        </div>
                    </>
                )}
            </div>

            {playlist.tracks.length === 0 && (
                <p className="status">This playlist is empty. Add tracks from the search page.</p>
            )}

            <ul className="track-list">
                {playbackOrder.map(track => (
                    <li key={track.id} className="track-card">
                        <img className="track-art" src={track.image} alt={track.album_name || track.name} />
                        <div className="track-info">
                            <p className="track-name">{track.name}</p>
                            <p className="artist-name">{track.artist_name}</p>
                            <audio className="track-audio" src={track.audio} controls />
                        </div>
                        <span className="track-duration">
                            {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                        </span>
                        <button
                            className="playlist-remove-track"
                            onClick={() => handleRemoveTrack(track.id)}
                            aria-label="Remove from playlist"
                            title="Remove from playlist"
                        >
                            ×
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
