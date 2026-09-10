import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
import requests

BASE_URL="https://api.jamendo.com/v3.0/tracks/"

load_dotenv()
client_id=os.getenv("CLIENT_ID")

app = Flask(__name__)

def get_tracks(fuzzy_tags="rock", limit=5):
  params={'client_id':client_id,
          'format':'json',
          'limit':limit,
          'fuzzytags':fuzzy_tags,
          'include':'musicinfo'
          }
  response=requests.get(BASE_URL, params=params)
  data=response.json()
  return jsonify(data.get('results', []))
  
@app.route("/")
def index():
  return get_tracks()

if __name__ in "__main__":
  app.run(debug=True)