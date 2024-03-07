# LendSqr-Backend API Documentation

This document provides documentation for the LendSqr Finance REST API, including request/response formats, usage examples, limitations, and setup/deployment instructions.

## Limitations and Assumptions
- There is no authentication mechanism like login. Once a user register's their account the response contains their `user ID` which should be included in the `authorization` header in the format `Bearer 2` where `2` is the user's ID.
- have assumed that the requirements of the `users ` endpoint is limited to only fetching the currently authenticated user and creating a new user.
- I have assumed that there should be a seperate route to handle transactions like deposits, withdrawals and transfers and this should be seperate from the `users` route.
- I have assumed that a the transaction pin for user's account should be a minmum of 4 characters.
- I have also assumed that users cannot change / update / delete their account from the API.

# Addtional Note:

### Transaction Scoping
When a user's creates an registers, an account is defaultly created for them in the same transaction batch. If an error occur either while registering the user or creating the account the whole batch is rolled back. 


## Table of Contents
- [Request and Response Formats](#request-and-response-formats)
- [API Endpoints](#api-endpoints)
- [Sample Usage](#sample-usage)
- [Limitations and Assumptions](#limitations-and-assumptions)
- [Setting Up and Deploying the API](#setting-up-and-deploying-the-api)

---

## BASE URL
The base URL of the API is: https://localhost:3000/v1/api

## Authentication

All API requests require authentication using a user ID. Include the User ID in the Authorization header of each request as follows:

```shell
Authorization: Bearer YOUR_USER_ID
```

## Error Handling
The API follows standard HTTP status codes to indicate the failure of a request which is highly unlikely. In case of an error, the API will return an error response in the following format:

```json
{
    "success" : "false",
    "message" : "An internal server error occurred. Please try again later.",
    "errorTrace" : "A valid error response stating what happened"
}
```
The code field represents the specific error code, and the message field provides a human-readable description of the error.

# Common Error Codes
- 400 Bad Request: The request was malformed or had invalid parameters.
- 401 Unauthorized: The provided API key is invalid or missing.
- 403 Forbidden: The requested resource is forbidden for the authenticated user.
- 404 Not Found: The requested resource was not found.
- 500 Internal Server Error: An unexpected server error occurred.(Extremely Rare)

## Request and Response Formats

Check this Postman collections to see a list of available requests.

https://www.postman.com/payload-astronaut-82118376/workspace/learnly-api/collection/29093204-7bc0167b-efdd-4f1a-a796-e16416aa7fb2?action=share&creator=29093204

# USERS

## Create a New User

- HTTP Method: POST
- Endpoint: /users/
- Request Format:

```json
    {
    "firstname": "string",
    "lastname": "string",
    "email": "string",
    "pin": "string",
    "phoneNumber": "number",
  }
  
```

- Response Format:

```json
{
    "id": "string",
    "name": "string",
    "email": "string",
    "pin": "string",
    "phoneNumber": "number",
    "accountNumber": "string",
}
```

## Get Currently Logged in User Details (ADMIN)
- HTTP Method: GET
- Endpoint: /users/me
- Response Format:


```json

    {
        "user" : {
            "id": "string",
            "name": "string",
            "email": "string",
            "phoneNumber": "number"
        },

        "account": {
            "balance": "number",
            "accountNumber": "string"
        }
    },

```

# Accounts

## DEPOSIT

Constraints: User sending request must be authenticated.

- HTTP Method: POST
- Endpoint: /api/account/deposit

- Request Format:

```json
{
    "destination": "string",
    "amount": "number",
}

```

- Response Format:

```json
{
    "destination": "string",
    "amount": "number",
    "success": "boolean"
}
```

## TRANSFER (REGULAR USER)

- HTTP Method: POST
- Endpoint: /transactions/transfer

- Request Format:

```json

{
    "source": "string",
    "destination": "string",
    "amount": "number",
    "pin": "string"
}
```

- Response Format:
```json

{
    "source": "string",
    "destination": "string",
    "amount": "number",
    "success": "boolean"
}
```


## WITHDRAW
- HTTP Method: POST
- Endpoint: /transactions/withdraw

Request :
```json
{
    "source": "string",
    "destination": "string", // an external bankaccount number
    "destinationBankName": "string",
    "amount": "number",
    "pin": "number"
}
```
Response: 

```json
{
    "destination": "string",
    "destinationBankName": "string",
    "amount": "number",
    "success": "boolean" 
}
```

---

# API Endpoints

The API includes the following endpoints:

- POST /auth/login/: Login to the system
- POST /auth/logout: Logout the current user 

- POST /users/: Create a new person.
- GET /users/: Get all the users in the system (Admin role required)
- GET /users/me: View the current user's details

- POST /accounts/: Create a new account for a user
- GET /accounts/: Get all the users in the system (Admin role required)
- GET /accounts/me: View the current user's account details
- GET /accounts/me/transactions : View the current user's account transaction details

- POST /transactions/transfer: Create a new transfer request
- POST /transactions/deposit: Create a new deposit request
- POST /transactions/withdraw: Create a new withdrawal request
---

## Sample Usage

### LOGIN 

Request:

POST /auth/login
Content-Type: application/json

Request: 
```json
{
    "email": "janesmith@example.com",
    "password": "Password456#"
}
```

Response :

Headers: Authorization : Bearer bearer_token
```json
{
    "success" : true
}
```

### CREATING A USER

Request:

POST /users
Content-Type: application/json
Authorization: Bearer bearer_token

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "johndoe@gmail.com",
  "password": "Custompass123#",
  "confrimPassword": "Custompass123#",
  "phoneNumber": "+234-9013489921"
}
```
Response:

```json
{
    "_id" : "39893fhb30023884bdg",
    "firstname": "John",
    "lastname": "Doe",
    "email": "johndoe@gmail.com",
    "phoneNumber": "+234-9013489921"
}
```

### FETCHING ALL USERS DETAILS (ADMIN authorization required)

Request:

GET /users/
Content-Type: application/json
Authorization: Bearer bearer_token


Response:

```json
[
    {
    "_id" : "34fci49304095893bcf",
    "firstname": "John",
    "lastname": "Doe",
    "email": "johndoe@gmail.com",
    "phoneNumber": "+234-9013489921"
    },
    {
    "_id": "29hhi4949834895034f",
    "firstname": "Jane",
    "lastname": "Doe",
    "email": "janedoe@gmail.com",
    "phoneNumber": "+234-901234567"
    }
]
```

### Fetching the cuurently logged in user's details

Request:

PUT /users/me
Content-Type: application/json
Authorization: Bearer bearer_token

Response:

```json
{
    "_id": "65db8480be0e39e3421dd6a1",
    "firstname": "Jane",
    "lastname": "Smith",
    "email": "janesmith@example.com",
    "phoneNumber": "+234-9013489922",
    "isActive": true,
    "joined": "2024-02-25T18:18:40.972Z",
    "lastLogin": "2024-02-25T18:29:17.722Z"
}
```

### CREATE ACCOUNT 

POST /accounts/
Content-Type: application/json
Authorization: Bearer bearer_token

Request :

```json
{
    "owner": "65db95795427480fe2912d8e",
    "pin": 1234
}
```

Response :

```json
{
    "owner": "65db95795427480fe2912d8e",
    "balance": 0,
    "accountNumber": "213154321"
}
```


### VIEW CURRENTLY LOGGED IN USER ACCOUNT DETAILS

GET /users/me
Content-Type: application/json
Authorization: Bearer bearer_token

Request 

:
```json

{
    "user": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "johndoe@example.com",
        "phone_number": "1234567890",
        "last_login": "2024-03-06T23:50:47.000Z"
    },
    "account": {
        "balance": 0,
        "accountNumber": "213154321"
    }
}

```

### VIEW ALL USERS ACCOUNT DETAILS (ADMIN AUTH REQUIRED)

GET /accounts/
Content-Type: application/json
Authorization: Bearer bearer_token

Response :

```json
[
    {
    "owner": "65db95795427480fe2912d8e",
    "balance": 1280,
    "accountNumber": "2131543271",
    },

    {
    "owner": "56db95795427976fe2912f8d",
    "balance": 2500,
    "accountNumber": "2131543271",
    }
]

```

### VIEW CURRENTLY LOGGED IN USER ACCOUNT TRANSACTION DETAILS

GET /accounts/me/transactions
Content-Type: application/json
Authorization: Bearer bearer_token

Response :

```json
[
    {
        "_id": "65db8f845427480fe2912d71",
        "source": "2152297904",
        "transactionType": "DEPOSIT",
        "destination": "2152297904",
        "amount": 239,
        "createdAt": "2024-02-25T19:05:40.281Z",
        "updatedAt": "2024-02-25T19:05:40.281Z",
        "__v": 0
    },
    {
        "_id": "65db8f845427480fe2912d71",
        "source": "2131643271",
        "transactionType": "TRANSFER",
        "destination": "2152297904",
        "amount": 250,
        "createdAt": "2024-02-25T19:05:40.281Z",
        "updatedAt": "2024-02-25T19:05:40.281Z",
        "__v": 0
    }
]

```

### CREATE A DEPOSIT 

POST /transactions/deposit
Content-Type: application/json
Authorization: Bearer bearer_token

Request :

```json
{
    "destination": "2116927207",
    "amount": 10000
}
```

Response : 

```json
{
    "destination": "2116927207",
    "amount": 10000,
    "success": true
}
```

### CREATE A TRANSFER

POST /transactions/transfer
Content-Type: application/json
Authorization: Bearer bearer_token

Request :

```json
{
    "source": "2116927207",
    "destination": "2152297904",
    "amount": 500,
    "pin": 1234
}
```

Response :

```json
{
    "source": "2116927207",
    "destination": "2152297904",
    "amount": 500,
    "success": true
}
```

## WITHDRAWAL 
POST /transactions/withdraw
Content-Type: application/json
Authorization: Bearer bearer_token

Request :

```json
{
    "source": "2152297904",
    "destination": "2116927207", // an external bankaccount number
    "destinationBankName": "Wema Bank",
    "amount": 500,
    "pin": 1234
}
```
Response: 

```json
{
    "destination": "2116927207",
    "destinationBankName": "Wema Bank",
    "amount": 500,
    "success": "true"
}
```

---

## Setting Up and Deploying the API

## Prerequisites

- Node.js and npm and MongoDB should be installed on your machine. You can download and install them from the official Node.js website (https://nodejs.org). MongoDB (https://mongodb.com)

## Installation

1. Clone the repository or download the source code.

```bash
git clone https://github.com/t-ega/Learnly-Financial-Backend
```

2. Navigate to the project directory.

```bash
cd learnly-financial-backend
```

3. Install the project dependencies.
```bash
npm install
```

4. Environment Variables
Create a .env file at the root of the application.
Some environment variables have been set up to provide neccessary variables to the application see .env.example in the root directory of this folder and create a .env file with those variables


## Run the Application
To start the NestJS application locally, use the following command:

```bash
npm run start:dev
``` 
To run in development mode

```bash
npm run start
```
To run normally

## Accessing the Application

Open postman or any other application of your choice and navigate to http://localhost:3000/v1/api (or the specified port if you have configured it differently in your .env file). You should see your NestJS application running locally.


# Dockerization

To containerize your application using Docker, follow these steps:
- Make sure you have Docker Desktop installed on your machine. Visit https://www.docker.com/ to download.

1. Build the Docker image. (The dockerfile is already provided)

```bash
docker build -t learnly-backend-api .
```

2. Run the Docker container. Specify the port on the outside to which you want to map the internal ports to.
E.g 8000:3000. Map port 8000 on the outside to port 3000 on the inside.

```bash
docker run -p 8000:3000 -d learnly-backend-api
```

For local development, make sure you have Node.js, npm, and MongoDB installed.

For production deployment, it is essential to adhere to best practices in securing both your server and MongoDB instance.
 Additionally, you have the option to deploy the API using [Render](https://render.com/), a reliable cloud platform.