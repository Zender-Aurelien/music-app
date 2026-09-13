import os


class Config:
    """Central place for reading configuration from environment variables.

    Values are loaded from `.env` (via python-dotenv, in wsgi.py) before this
    class is read, so plain os.getenv() calls here are enough.
    """

    JAMENDO_CLIENT_ID = os.getenv("CLIENT_ID")
    JAMENDO_BASE_URL = "https://api.jamendo.com/v3.0/tracks/"

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = os.getenv("SECRET_KEY")

    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

    # Where to send the browser back to after a successful Google login.
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Dev cookie settings: frontend and backend are same-origin via the
    # Vite proxy over plain HTTP, so Lax + non-Secure works. If frontend
    # and backend ever move to different origins (e.g. separate prod
    # domains), this needs SESSION_COOKIE_SAMESITE="None" and
    # SESSION_COOKIE_SECURE=True (which requires HTTPS), plus CORS with
    # supports_credentials=True for the real frontend origin.
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True
