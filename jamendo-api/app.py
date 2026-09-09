import os
from dotenv import load_dotenv
from flask import Flask

BASE_URL="https://api.jamendo.com"

load_dotenv()
client_id=os.getenv("CLIENT_ID")


app = Flask(__name__)

@app.route("/")
def get_tracks():
  params={'client_id':client_id,
          'format':'json',
          }

if __name__ in "__main__":
  app.run(debug=True)