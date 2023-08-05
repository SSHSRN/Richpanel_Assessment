from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
import os
import pymongo
import time
import requests
import hashlib
from datetime import timedelta

load_dotenv()

mongoConnectionString = os.getenv("MONGODB_CONNECTION_URL")
# print(mongoConnectionString)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=10)
# app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=10)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/', methods=['GET'])
def hello():
    return "<h1>Python Backend is working</h1>"

@app.route('/signup', methods=['POST'])
def signup():
    client = pymongo.MongoClient(mongoConnectionString)
    database = client["Cluster0"]
    cluster = database["users"]
    token = hashlib.sha256(f'{request.json["email"]}:{int(time.time())}'.encode()).hexdigest()
    data = {
        "name": request.json['name'],
        "email": request.json['email'],
        "password": request.json['password'],
        "remember_user": request.json['remember_user'],
        "last_login": time.time(),
        "created_at": time.time(),
        "num_of_logins": 1,
        "subscribed": False,
        "subscribed_at": None,
        "subscribed_till": None,
        "subscribed_plan": None,
        "subscription_type": None,
        "amount_paid": None,
        "token": token,
    }
    # check if user already exists
    if cluster.find_one({"email": request.json['email']}):
        return jsonify({"status": "error", "message": "User already exists"}), 200
    # create user
    else:
        cluster.insert_one(data)
        # Remove _id from response which is inserted by MongoDB and is not JSON serializable (cannot be converted to JSON)
        data.pop('_id')
        if(request.json['remember_user'] == True):
            session.permanent = True
            app.permanent_session_lifetime = timedelta(seconds=20)
            # app.permanent_session_lifetime = timedelta(minutes=20)
        else:
            session.permanent = False
        session['user_email'] = request.json['email']
        return jsonify({"status": "success", "message": "User created successfully", "user": data}), 200

@app.route('/login', methods=['POST'])
def login():
    if 'user_email' in session:
        return jsonify({"status": "error", "message": "User already logged in"}), 200
    client = pymongo.MongoClient(mongoConnectionString)
    database = client["Cluster0"]
    cluster = database["users"]
    # check if user exists
    if cluster.find_one({"email": request.json['email']}):
        # check if password is correct
        if cluster.find_one({"email": request.json['email']})['password'] == request.json['password']:
            # set session
            print(request.json['remember_user'])
            if(request.json['remember_user'] == True):
                session.permanent = True
                app.permanent_session_lifetime = timedelta(seconds=20)
                # app.permanent_session_lifetime = timedelta(minutes=20)
            session['user_email'] = request.json['email']
            print(session.get('user_email'))
            # update last login
            cluster.update_one({"email": request.json['email']}, {"$set": {"last_login": time.time()}})
            # update number of logins
            cluster.update_one({"email": request.json['email']}, {"$inc": {"num_of_logins": 1}})
            # update token
            cluster.update_one({"email": request.json['email']}, {"$set": {"token": hashlib.sha256(f'{request.json["email"]}:{int(time.time())}'.encode()).hexdigest()}})
            data = cluster.find_one({"email": request.json['email']})
            # Remove _id from response which is inserted by MongoDB and is not JSON serializable (cannot be converted to JSON)
            data.pop('_id')
            return jsonify({"status": "success", "message": "User logged in successfully", "user": data}), 200
        else:
            return jsonify({"status": "error", "message": "Incorrect password"}), 200
    else:
        return jsonify({"status": "error", "message": "User does not exist"}), 200

@app.route('/get_user', methods=['GET'])
def get_user():
    client = pymongo.MongoClient(mongoConnectionString)
    database = client["Cluster0"]
    cluster = database["users"]
    print(session.get('user_email'))
    if 'user_email' in session:
        print(session['user_email'])
        user = cluster.find_one({"email": session['user_email']})
        # Remove _id from response which is inserted by MongoDB and is not JSON serializable (cannot be converted to JSON)
        user.pop('_id')
        return jsonify({"status": "success", "message": "User found and logged in", "user": user}), 200
    else:
        return jsonify({"status": "error", "message": "User not found or not logged in"}), 200


# Run Server on port 5000
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    print('Server running on port 5000')