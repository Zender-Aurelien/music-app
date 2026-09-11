import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
import requests

BASE_URL="https://api.jamendo.com/v3.0/tracks/"

load_dotenv()
client_id=os.getenv("CLIENT_ID")

app = Flask(__name__)

def get_tracks(query=None, fuzzy_tags="rock", limit=20):
  params={'client_id':client_id,
          'format':'json',
          'limit':limit,
          'include':'musicinfo'
          }
  if query:
    params['namesearch'] = query
  else:
    params['fuzzytags'] = fuzzy_tags

  response=requests.get(BASE_URL, params=params)
  data=response.json()
  return jsonify(data.get('results', []))

@app.route("/")
def index():
  return get_tracks()

@app.route("/api/tracks")
def tracks():
  return get_tracks()

@app.route("/api/search")
def search():
  query = request.args.get("q", "").strip()
  if not query:
    return jsonify([])
  return get_tracks(query=query)

if __name__ == "__main__":
  app.run(debug=True)