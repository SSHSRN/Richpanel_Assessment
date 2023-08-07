# Richpanel Assessment

## Description

This is a web application built for the Richpanel assessment. Users can create accounts and login to the application. Once logged in, they can subscribe to a plan and view their subscription details, update the subscription or cancel the subscription. The payment gateway used is Stripe and the database used is MongoDB. The frontend is built using React and the backend is built using the Flask framework. The website is containerized using Docker-compose and is deployed on Google Cloud Run. 

## Installation

- Clone the repository

```
git clone https://github.com/SSHSRN/Richpanel_Assessment
cd Richpanel_Assessment
```

- Create a virtual environment

```
cd backend
python -m venv venv
```

- Install the dependencies

```
pip install -r requirements.txt
```

- Set the environment variables by creating a .env file in the backend directory and adding the following variables

```
MONGODB_CONNECTION_URL=______
STRIPE_SECRET_KEY=______
```

- Run the backend server

```
python app.py
```

- Install the dependencies for the frontend

```
cd frontend
yarn install
```

- Run the frontend server

```
yarn start
```

- To run the Docker container, run the following commands

```
docker-compose up
```

## Links:

- Github Repository: https://github.com/SSHSRN/Richpanel_Assessment
- Frontend Deployment Link: https://richpanel-assessment-frontend-hixnctymba-uc.a.run.app/
- Backend Deployment Link: https://richpanel-assessment-backend-hixnctymba-uc.a.run.app/
- Video Link: https://youtu.be/HFsZBVo4voM
