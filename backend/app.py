from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
import os
import pymongo
import time
import requests
import hashlib
from datetime import timedelta
import datetime
import stripe
import threading

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
print(stripe.api_key)

mongoConnectionString = os.getenv("MONGODB_CONNECTION_URL")
# print(mongoConnectionString)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
# app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=60)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=10)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*" }})

@app.route('/', methods=['GET'])
def hello():
    return "<h1>Python Backend is working</h1>"

@app.route('/signup', methods=['POST'])
def signup():
    client = pymongo.MongoClient(mongoConnectionString)
    database = client["Cluster0"]
    cluster = database["users"]
    data = {
        "name": request.json['name'],
        "email": request.json['email'],
        "password": request.json['password'],
        "remember_user": request.json['remember_user'],
        "last_login": time.time(),
        "created_at": time.time(),
        "num_of_logins": 1,
        "subscribed": False,
        "subscribed_on": None,
        "renewal_date": None,
        "subscription_type": None,
        "subscription_fee": None,
        "subscribed_plan": None,
        "max_allowed_sessions": 1,
        "subscription_devices": [],
        "recent_activity": [{}],
    }
    # check if user already exists
    if cluster.find_one({"email": request.json['email']}):
        return jsonify({"status": "error", "message": "User already exists"}), 200
    # create user
    else:
        cluster.insert_one(data)
        client.close()
        # Remove _id from response which is inserted by MongoDB and is not JSON serializable (cannot be converted to JSON)
        data.pop('_id')
        session.permanent = True
        if(request.json['remember_user'] == True):
            app.permanent_session_lifetime = timedelta(minutes=20)
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
            # check for expired sessions in recent_activity array and remove them
            for i in range(len(cluster.find_one({"email": request.json['email']})['recent_activity'])):
                print(cluster.find_one({"email": request.json['email']})['recent_activity'][i]['expiring_at'], time.time())
                if cluster.find_one({"email": request.json['email']})['recent_activity'][i]['expiring_at'] < time.time():
                    print("Removing expired session")
                    cluster.update_one({"email": request.json['email']}, {"$pull": {"recent_activity": cluster.find_one({"email": request.json['email']})['recent_activity'][i]}})

            if len(cluster.find_one({"email": request.json['email']})['recent_activity']) >= cluster.find_one({"email": request.json['email']})['max_allowed_sessions']:            
                return jsonify({"status": "error", "message": "Maximum number of sessions reached for your account. Please logout from one of the other devices to login from this device"}), 200
            # add the current session to the recent_activity array
            if(request.json['remember_user'] == True):
                # cluster.update_one({"email": request.json['email']}, {"$push": {"recent_activity": {"activity": "Logged in", "expiring_at": time.time() + 120}}}) # 120 seconds
                cluster.update_one({"email": request.json['email']}, {"$push": {"recent_activity": {"activity": "Logged in", "expiring_at": time.time() + 1200}}}) # 20 minutes
            else:
                # cluster.update_one({"email": request.json['email']}, {"$push": {"recent_activity": {"activity": "Logged in", "expiring_at": time.time() + 60}}}) # 60 seconds
                cluster.update_one({"email": request.json['email']}, {"$push": {"recent_activity": {"activity": "Logged in", "expiring_at": time.time() + 600}}}) # 10 minutes
            # update last login
            cluster.update_one({"email": request.json['email']}, {"$set": {"last_login": time.time()}})
            # set session
            print(request.json['remember_user'])
            session.permanent = True
            if(request.json['remember_user'] == True):
                # app.permanent_session_lifetime = timedelta(seconds=120)
                app.permanent_session_lifetime = timedelta(minutes=20)
            session['user_email'] = request.json['email']
            print(session.get('user_email'))
            # update last login
            cluster.update_one({"email": request.json['email']}, {"$set": {"last_login": time.time()}})
            # update number of logins
            cluster.update_one({"email": request.json['email']}, {"$inc": {"num_of_logins": 1}})
            data = cluster.find_one({"email": request.json['email']})
            # Remove _id from response which is inserted by MongoDB and is not JSON serializable (cannot be converted to JSON)
            data.pop('_id')
            client.close()
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
        client.close()
        return jsonify({"status": "success", "message": "User found and logged in", "user": user}), 200
    else:
        return jsonify({"status": "error", "message": "User not found or not logged in"}), 200

# Not used
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
            client.close()
            return jsonify({"status": "success", "message": "Payment intent created successfully", "client_secret": intent['client_secret']}), 200
    else:
        return jsonify({"status": "error", "message": "User not found or not logged in"}), 200

# Not used
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
                client.close()
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
                "price": request.json['price_id'],
            }],
            payment_settings={
                'payment_method_types': ['card'],
                'save_default_payment_method': 'on_subscription',
            },
            expand=['latest_invoice.payment_intent']
        )
        print("subscription created", subscription)
        client.close()
        return jsonify({'status': 'success', 'message': 'Subscription successful', 'client_secret': subscription.latest_invoice.payment_intent.client_secret}), 200
    except Exception as e:
        print("error", e)
        return jsonify({'status': 'error', 'message': str(e)}), 200

@app.route('/delete_subscription', methods=['POST'])
def delete_subscriptions():
    try:
        prod_ID = request.get_json()['price_id']
        email = session['user_email']
        client = pymongo.MongoClient(mongoConnectionString)
        database = client["Cluster0"]
        cluster = database["users"]

        customers = stripe.Customer.list(email=email)
        customer_id = customers.data[0].id
        subscriptions = stripe.Subscription.list(customer=customer_id)
        for subscription in subscriptions.data:
            print(subscription.plan.id)
            if(subscription.plan.id == prod_ID):
                stripe.Subscription.delete(subscription.id)
                cluster.update_one({"email": email}, {"$set": {"subscribed": False, "subscribed_on": None, "renewal_date": None, "subscription_type": None, "subscription_fee": None, "subscribed_plan": None, "max_allowed_sessions": 1, "subscription_devices": [] }})
            return jsonify({'status': 'success', 'message': 'Subscription deleted successfully', 'deleted_on': datetime.datetime.now()}), 200
    except Exception as e:
        print("error", e)
        return jsonify({'status': 'error', 'message': str(e)}), 200

@app.route('/get_plans', methods=['GET'])
def get_plans():
    try:
        client = pymongo.MongoClient(mongoConnectionString)
        database = client["Cluster0"]
        cluster = database["plans"]
        plans = list(cluster.find({}, {'_id': False}))
        client.close()
        return jsonify({'status': 'success', 'message': 'Plans retrieved successfully', 'plans': plans}), 200
    except Exception as e:
        print("error", e)
        return jsonify({'status': 'error', 'message': str(e)}), 200

@app.route('/update_user', methods=['POST'])
def update_user():
    user_email = session['user_email']
    data = request.get_json()
    userSessionsMap = {
        "mobile": 1,
        "basic": 3,
        "standard": 5,
        "premium": 7
    }
    print(data)
    if(data['sub'] == "monthly"):
        renewaldays = 30
    elif(data['sub'] == "yearly"):
        renewaldays = 365
    client = pymongo.MongoClient(mongoConnectionString)
    database = client["Cluster0"]
    cluster = database["users"]
    cluster.update_one({"email": user_email}, {"$set": {"subscribed": True, "subscribed_on": datetime.datetime.now(), "renewal_date": datetime.datetime.now() + datetime.timedelta(days=renewaldays), "subscription_type": data['sub'], "subscription_fee": data['fee'], "subscribed_plan": data['plan'], "subscription_devices": data['devices'], "price_id": data['priceID']}})
    # Update the max_allowed_sessions for the user
    cluster.update_one({"email": user_email}, {"$set": {"max_allowed_sessions": userSessionsMap[data['plan']]}})
    client.close()
    return jsonify({'status': 'success', 'message': 'User updated successfully'}), 200
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    print('Server running on port 5000')