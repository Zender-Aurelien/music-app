import requests
from flask import current_app


def get_tracks(query=None, fuzzy_tags="rock", limit=20):
    """Fetch tracks from the Jamendo API and return plain Python data.

    This mirrors the original app.py logic exactly, except it no longer
    calls jsonify() itself — that's left to the route handler, so this
    function stays usable outside of a request/response context (e.g. in
    tests or a script) and only knows about data, not HTTP responses.
    """
    params = {
        "client_id": current_app.config["JAMENDO_CLIENT_ID"],
        "format": "json",
        "limit": limit,
        "include": "musicinfo",
    }
    if query:
        params["namesearch"] = query
    else:
        params["fuzzytags"] = fuzzy_tags

    response = requests.get(current_app.config["JAMENDO_BASE_URL"], params=params)
    data = response.json()
    return data.get("results", [])
