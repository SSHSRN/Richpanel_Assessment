from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import pymongo
import time
import requests

load_dotenv()

mongoConnectionString = os.getenv("MONGODB_CONNECTION_URL")
# print(mongoConnectionString)

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def hello():
    return "<h1>Python Backend is working</h1>"
