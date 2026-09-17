from flask import Flask, jsonify

from app.config import Config
from app.extensions import db, limiter, login_manager, oauth


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    login_manager.init_app(app)
    oauth.init_app(app)
    limiter.init_app(app)

    oauth.register(
        name="google",
        client_id=app.config["GOOGLE_CLIENT_ID"],
        client_secret=app.config["GOOGLE_CLIENT_SECRET"],
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

    # Import models so their tables are registered with SQLAlchemy's
    # metadata before `flask init-db` (db.create_all()) runs, and so
    # the user_loader below can query User.
    from app import models  # noqa: F401

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(models.User, int(user_id))

    # This is a JSON API, not a server-rendered site — an unauthenticated
    # request to a @login_required route should get a 401, not Flask-
    # Login's default redirect to a (nonexistent) login page.
    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({"error": "authentication required"}), 401

    from app.routes.auth import auth_bp
    from app.routes.playlists import playlists_bp
    from app.routes.tracks import tracks_bp

    app.register_blueprint(tracks_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(playlists_bp)

    register_error_handlers(app)
    register_cli(app)

    return app


def register_error_handlers(app):
    # This is a JSON API — return {"error": ...} instead of Flask's default
    # HTML error pages for the abort() calls used throughout the routes
    # (400/403/404) and for Flask-Limiter's 429 when a client goes over
    # the rate limit.
    for status in (400, 403, 404, 429):
        app.register_error_handler(status, _json_error)


def _json_error(error):
    return jsonify({"error": error.description}), error.code


def register_cli(app):
    @app.cli.command("init-db")
    def init_db():
        """Create all database tables (run once, or after adding a model)."""
        with app.app_context():
            db.create_all()
        print("Database tables created.")
