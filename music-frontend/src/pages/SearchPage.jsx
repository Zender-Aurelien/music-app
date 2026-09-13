import { useState, useEffect } from 'react'
import { AddToPlaylistMenu } from '../components/AddToPlaylistMenu'
import '../styles/shared.css'
import './SearchPage.css'
export function SearchPage() {
    const [query, setQuery] = useState('')
    const [tracks, setTracks] = useState([])
    const [status, setStatus] = useState('loading')

    useEffect(() => {
        const url = query.trim() ? `/api/search?q=${encodeURIComponent(query)}` : '/api/tracks'

        const controller = new AbortController()

        fetch(url, { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                setTracks(data)
                setStatus('done')
            })
            .catch(err => {
                if (err.name !== 'AbortError') setStatus('error')
            })

        return () => controller.abort()
    }, [query])

    return (
        <div className="app">
            <input
                className="search-input"
                type="text"
                placeholder="Search tracks..."
                value={query}
                onChange={e => {
                    setQuery(e.target.value)
                    setStatus('loading')
                }}
            />

            {status === 'loading' && <p className="status">Loading...</p>}
            {status === 'error' && <p className="status error">Something went wrong.</p>}
            {status === 'done' && tracks.length === 0 && <p className="status">No tracks found.</p>}

            <ul className="track-list">
                {tracks.map(track => (
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
                        <AddToPlaylistMenu track={track} />
                    </li>
                ))}
            </ul>
        </div>
    )
}