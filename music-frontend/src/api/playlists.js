async function handle(res) {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed: ${res.status}`)
    }
    if (res.status === 204) return null
    return res.json()
}

export function listPlaylists() {
    return fetch('/api/playlists').then(handle)
}

export function createPlaylist(name) {
    return fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    }).then(handle)
}

export function getPlaylist(id) {
    return fetch(`/api/playlists/${id}`).then(handle)
}

export function renamePlaylist(id, name) {
    return fetch(`/api/playlists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    }).then(handle)
}

export function deletePlaylist(id) {
    return fetch(`/api/playlists/${id}`, { method: 'DELETE' }).then(handle)
}

export function addTrackToPlaylist(id, track) {
    return fetch(`/api/playlists/${id}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jamendo_track_id: track.id,
            name: track.name,
            artist_name: track.artist_name,
            album_name: track.album_name,
            image: track.image,
            audio: track.audio,
            duration: track.duration,
        }),
    }).then(handle)
}

export function removeTrackFromPlaylist(playlistId, trackRowId) {
    return fetch(`/api/playlists/${playlistId}/tracks/${trackRowId}`, {
        method: 'DELETE',
    }).then(handle)
}
