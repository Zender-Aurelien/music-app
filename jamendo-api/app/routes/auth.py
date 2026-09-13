from flask import Blueprint, current_app, jsonify, redirect, url_for
from flask_login import current_user, login_required, login_user, logout_user

from app.extensions import db, oauth
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login")
def login():
    redirect_uri = url_for("auth.callback", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@auth_bp.route("/callback")
def callback():
    token = oauth.google.authorize_access_token()
    userinfo = token.get("userinfo") or oauth.google.userinfo(token=token)

    google_sub = userinfo["sub"]
    user = User.query.filter_by(google_sub=google_sub).first()
    if user is None:
        user = User(
            google_sub=google_sub,
            email=userinfo["email"],
            name=userinfo.get("name", userinfo["email"]),
            picture_url=userinfo.get("picture"),
        )
        db.session.add(user)
    else:
        # Keep the cached profile fields fresh on every login.
        user.email = userinfo["email"]
        user.name = userinfo.get("name", userinfo["email"])
        user.picture_url = userinfo.get("picture")
    db.session.commit()

    login_user(user)
    return redirect(current_app.config["FRONTEND_URL"])


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return "", 204


@auth_bp.route("/me")
def me():
    if current_user.is_authenticated:
        return jsonify(
            {
                "user": {
                    "id": current_user.id,
                    "email": current_user.email,
                    "name": current_user.name,
                    "picture_url": current_user.picture_url,
                }
            }
        )
    return jsonify({"user": None})
