from flask import Blueprint, jsonify, request

from app.services.jamendo import get_tracks

tracks_bp = Blueprint("tracks", __name__)


@tracks_bp.route("/")
def index():
    return jsonify(get_tracks())


@tracks_bp.route("/api/tracks")
def tracks():
    return jsonify(get_tracks())


@tracks_bp.route("/api/search")
def search():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify([])
    return jsonify(get_tracks(query=query))
