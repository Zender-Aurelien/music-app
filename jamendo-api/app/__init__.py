from flask import Flask

from app.config import Config
from app.extensions import db


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)

    # Import models so their tables are registered with SQLAlchemy's
    # metadata before `flask init-db` (db.create_all()) runs.
    from app import models  # noqa: F401

    from app.routes.tracks import tracks_bp

    app.register_blueprint(tracks_bp)

    register_cli(app)

    return app


def register_cli(app):
    @app.cli.command("init-db")
    def init_db():
        """Create all database tables (run once, or after adding a model)."""
        with app.app_context():
            db.create_all()
        print("Database tables created.")
