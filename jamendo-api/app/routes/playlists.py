from flask import Blueprint, abort, jsonify, request
from flask_login import current_user, login_required

from app.extensions import db
from app.models import Playlist, PlaylistTrack

playlists_bp = Blueprint("playlists", __name__, url_prefix="/api/playlists")


def _serialize_track(track):
    return {
        "id": track.id,
        "jamendo_track_id": track.jamendo_track_id,
        "position": track.position,
        "name": track.name,
        "artist_name": track.artist_name,
        "album_name": track.album_name,
        "image": track.image,
        "audio": track.audio,
        "duration": track.duration,
    }


def _serialize_playlist(playlist, include_tracks=False):
    data = {
        "id": playlist.id,
        "name": playlist.name,
        "track_count": len(playlist.tracks),
        "created_at": playlist.created_at.isoformat(),
        "updated_at": playlist.updated_at.isoformat(),
    }
    if include_tracks:
        data["tracks"] = [_serialize_track(t) for t in playlist.tracks]
    return data


def _get_owned_playlist_or_404(playlist_id):
    playlist = db.session.get(Playlist, playlist_id)
    if playlist is None:
        abort(404, description="playlist not found")
    if playlist.user_id != current_user.id:
        abort(403, description="not your playlist")
    return playlist


@playlists_bp.route("", methods=["GET"])
@login_required
def list_playlists():
    playlists = (
        Playlist.query.filter_by(user_id=current_user.id)
        .order_by(Playlist.created_at.desc())
        .all()
    )
    return jsonify([_serialize_playlist(p) for p in playlists])


@playlists_bp.route("", methods=["POST"])
@login_required
def create_playlist():
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    if not name:
        abort(400, description="name is required")

    playlist = Playlist(user_id=current_user.id, name=name)
    db.session.add(playlist)
    db.session.commit()
    return jsonify(_serialize_playlist(playlist, include_tracks=True)), 201


@playlists_bp.route("/<int:playlist_id>", methods=["GET"])
@login_required
def get_playlist(playlist_id):
    playlist = _get_owned_playlist_or_404(playlist_id)
    return jsonify(_serialize_playlist(playlist, include_tracks=True))


@playlists_bp.route("/<int:playlist_id>", methods=["PATCH"])
@login_required
def rename_playlist(playlist_id):
    playlist = _get_owned_playlist_or_404(playlist_id)
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    if not name:
        abort(400, description="name is required")

    playlist.name = name
    db.session.commit()
    return jsonify(_serialize_playlist(playlist, include_tracks=True))


@playlists_bp.route("/<int:playlist_id>", methods=["DELETE"])
@login_required
def delete_playlist(playlist_id):
    playlist = _get_owned_playlist_or_404(playlist_id)
    db.session.delete(playlist)
    db.session.commit()
    return "", 204


@playlists_bp.route("/<int:playlist_id>/tracks", methods=["POST"])
@login_required
def add_track(playlist_id):
    playlist = _get_owned_playlist_or_404(playlist_id)
    body = request.get_json(silent=True) or {}

    jamendo_track_id = str(body.get("jamendo_track_id") or body.get("id") or "").strip()
    name = (body.get("name") or "").strip()
    artist_name = (body.get("artist_name") or "").strip()
    audio = (body.get("audio") or "").strip()
    if not jamendo_track_id or not name or not artist_name or not audio:
        abort(400, description="jamendo_track_id, name, artist_name and audio are required")

    next_position = len(playlist.tracks)
    track = PlaylistTrack(
        playlist_id=playlist.id,
        jamendo_track_id=jamendo_track_id,
        position=next_position,
        name=name,
        artist_name=artist_name,
        album_name=body.get("album_name"),
        image=body.get("image"),
        audio=audio,
        duration=body.get("duration"),
    )
    db.session.add(track)
    db.session.commit()
    return jsonify(_serialize_track(track)), 201


@playlists_bp.route("/<int:playlist_id>/tracks/<int:track_id>", methods=["DELETE"])
@login_required
def remove_track(playlist_id, track_id):
    playlist = _get_owned_playlist_or_404(playlist_id)
    track = next((t for t in playlist.tracks if t.id == track_id), None)
    if track is None:
        abort(404, description="track not in this playlist")

    db.session.delete(track)
    db.session.flush()

    # Resequence remaining tracks so position stays contiguous (0..n-1).
    remaining = (
        PlaylistTrack.query.filter_by(playlist_id=playlist.id)
        .order_by(PlaylistTrack.position)
        .all()
    )
    for index, t in enumerate(remaining):
        t.position = index

    db.session.commit()
    return "", 204
