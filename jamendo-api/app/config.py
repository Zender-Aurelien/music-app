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
