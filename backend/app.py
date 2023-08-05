from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
import os
import pymongo
import time
import requests
import hashlib
from datetime import timedelta
import stripe

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
print(stripe.api_key)

mongoConnectionString = os.getenv("MONGODB_CONNECTION_URL")
# print(mongoConnectionString)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=1000)
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

@app.route('/create_payment_intent', methods=['POST'])
def create_payment_intent():
    client = pymongo.MongoClient(mongoConnectionString)
    database = client["Cluster0"]
    cluster = database["users"]
    # check if user exists
    if cluster.find_one({"email": session['user_email']}):
        # check if user is subscribed
        if cluster.find_one({"email": session['user_email']})['subscribed'] == True:
            return jsonify({"status": "error", "message": "User is already subscribed"}), 200
        else:
            # create payment intent
            intent = stripe.PaymentIntent.create(
                amount=request.json['amount'],
                currency='inr',
                payment_method_types=['card'],
            )
            # Save the client_secret and id in the database
            cluster.update_one({"email": session['user_email']}, {"$set": {"payment_intent_id": intent['id']}})
            cluster.update_one({"email": session['user_email']}, {"$set": {"payment_intent_client_secret": intent['client_secret']}})

            # Save the client_secret and id in the session as well da
            session['payment_intent_id'] = intent['id']
            session['payment_intent_client_secret'] = intent['client_secret']
            return jsonify({"status": "success", "message": "Payment intent created successfully", "client_secret": intent['client_secret']}), 200
    else:
        return jsonify({"status": "error", "message": "User not found or not logged in"}), 200

@app.route('/check_card', methods=['POST'])
def check_card():
    client = pymongo.MongoClient(mongoConnectionString)
    database = client["Cluster0"]
    cluster = database["users"]
    # check if user exists
    if cluster.find_one({"email": session['user_email']}):
        # check if user is subscribed
        if cluster.find_one({"email": session['user_email']})['subscribed'] == True:
            return jsonify({"status": "error", "message": "User is already subscribed"}), 200
        else:
            # check card
            try:
                card_number = request.json['card_number']
                exp_month = request.json['expiry_month']
                exp_year = request.json['expiry_year']
                cvc = request.json['cvc']

                # Attempt to create a Payment Method with the provided card details
                payment_method = stripe.PaymentMethod.create(
                    type='card',
                    card={
                        'number': card_number,
                        'exp_month': exp_month,
                        'exp_year': exp_year,
                        'cvc': cvc,
                    },
                )

                # If the Payment Method is successfully created, the card details are valid
                return jsonify({'valid': True})
            except stripe.error.CardError as e:
                # If there's a CardError, the card details are invalid
                return jsonify({'valid': False, 'message': e.user_message}), 200
            except Exception as e:
                return jsonify({'valid': False, 'message': 'An error occurred while validating the card details.'}), 200
    else:
        return jsonify({"status": "error", "message": "User not found or not logged in"}), 200

@app.route('/create_subscription', methods=['POST'])
def create_subscription():
    try:
        data = request.get_json()
        print(data)
        # Check if user is already subscribed
        client = pymongo.MongoClient(mongoConnectionString)
        database = client["Cluster0"]
        cluster = database["users"]

        # get user name from database
        name = cluster.find_one({"email": session['user_email']})['name']
        print("name from database: " + name)

        # Check if the customer already exists in Stripe
        stripe_customer = stripe.Customer.list(email=session['user_email'], limit=1)
        if stripe_customer.data:
            # If the customer already exists, retrieve the first customer in the list
            customer_id = stripe_customer.data[0].id
            print("customer already exists in stripe as: " + customer_id)
        else:
            # If the customer does not exist, create a new customer in Stripe
            print("customer does not exist in stripe")
            customer = stripe.Customer.create(
                email=session['user_email'],
                name=name,
                payment_method=data['payment_method'], # payment_method is the PaymentMethod ID from the client
                invoice_settings={
                    'default_payment_method': data['payment_method']
                }
            )

        # Create the subscription
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{
                "price": "price_1NbkwSSCT3zDBivM0Q4DXeF6",
            }],
            payment_settings={
                'payment_method_types': ['card'],
                'save_default_payment_method': 'on_subscription',
            },
            expand=['latest_invoice.payment_intent']
        )
        print("subscription created", subscription)
        return jsonify({'status': 'success', 'message': 'Subscription successful', 'client_secret': subscription.latest_invoice.payment_intent.client_secret}), 200
    except Exception as e:
        print("error", e)
        return jsonify({'status': 'error', 'message': str(e)}), 200


# Run Server on port 5000
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    print('Server running on port 5000')