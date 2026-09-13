from datetime import datetime, timezone

from app.extensions import db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    # The OIDC "sub" claim from Google — a stable, unique identifier for the
    # account that doesn't change even if the user's email does.
    google_sub = db.Column(db.String(255), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    picture_url = db.Column(db.String(1024), nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)

    playlists = db.relationship(
        "Playlist", backref="owner", cascade="all, delete-orphan"
    )


class Playlist(db.Model):
    __tablename__ = "playlists"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    tracks = db.relationship(
        "PlaylistTrack",
        backref="playlist",
        order_by="PlaylistTrack.position",
        cascade="all, delete-orphan",
    )


class PlaylistTrack(db.Model):
    """A track that belongs to a playlist.

    Jamendo tracks aren't stored locally as their own table — instead each
    row snapshots the display fields (name/artist/album/image/audio/
    duration) as they were at the time the track was added. That keeps a
    saved playlist stable even if Jamendo's data for that track later
    changes or disappears, and avoids an extra Jamendo API round-trip every
    time a playlist is viewed.
    """

    __tablename__ = "playlist_tracks"

    id = db.Column(db.Integer, primary_key=True)
    playlist_id = db.Column(
        db.Integer, db.ForeignKey("playlists.id"), nullable=False, index=True
    )
    jamendo_track_id = db.Column(db.String(64), nullable=False)
    position = db.Column(db.Integer, nullable=False)

    name = db.Column(db.String(500), nullable=False)
    artist_name = db.Column(db.String(500), nullable=False)
    album_name = db.Column(db.String(500), nullable=True)
    image = db.Column(db.String(1024), nullable=True)
    audio = db.Column(db.String(1024), nullable=False)
    duration = db.Column(db.Integer, nullable=True)

    added_at = db.Column(db.DateTime, default=utcnow, nullable=False)
