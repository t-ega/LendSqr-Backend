# LendSqr-Backend API Documentation

This document provides documentation for the LendSqr Finance REST API, including request/response formats, usage examples, limitations, and setup/deployment instructions.

## Check out this Google Docs Version of the Documentaion
[LendSqr Backend Google Docs ](https://docs.google.com/document/d/1JVFXnK8wEq-1DIcGvdmGBG6YTAkrvnLXGV7BNwyo3JQ/edit?usp=sharing)

## Limitations and Assumptions
- There is no authentication mechanism like login. Once a user register's their account the response contains their `user ID` which should be included in the `authorization` header in the format `Bearer 2` where `2` is the user's ID.
- have assumed that the requirements of the `users ` endpoint is limited to only fetching the currently authenticated user and creating a new user.
- I have assumed that there should be a seperate route to handle transactions like deposits, withdrawals and transfers and this should be seperate from the `users` route.
- I have assumed that the test suites should be created only for critical components of the application like the `users` and `accounts` controller.
- I have assumed that a the transaction pin for user's account should be a minmum of 4 characters.
- I have also assumed that users cannot change / update / delete their account from the API.

# Addtional Note:

### Performance

For quick and optimal perfomance of the system, all POST requests to the `transfer`, `deposit` and `withdraw` endpoint are `cached` for idempotency. Idempotency would help in situations where users retries a request after it was successful and the response didnt get to them, the request would be cached so if they retry the system remains unchanged. 
- This idempotency is achieved by passing in an `Idempotency-key` in the request headers.
- **NOTE If the idepotency key isn't passed in the request wont be cached!**


#### IdempotencyMiddleware

This middleware class handles idempotency key checks and caching for incoming requests.

- Checks for the presence of an idempotency key in the request headers.
- If an idempotency key is found, attempts to retrieve a cached response from the NodeCache instance.
- If a cached response exists, sends the cached response as the HTTP response and exits the middleware chain.
- If no cached response is found, proceeds to the next middleware in the chain.

### Transaction Scoping
When a user's creates an registers, an account is defaultly created for them in the same transaction batch. If an error occur either while registering the user or creating the account the whole batch is rolled back. 

# SCHEMA
Link: https://res.cloudinary.com/dkhelyskt/image/upload/v1709860908/schemaDesign_gmicnn.png
![Schema Design](https://res.cloudinary.com/dkhelyskt/image/upload/v1709860908/schemaDesign_gmicnn.png)

## Table of Contents
- [Setting Up and Deploying the API](#setting-up-and-deploying-the-api)
- [Request and Response Formats](#request-and-response-formats)
- [API Endpoints](#api-endpoints)
- [Sample Usage](#sample-usage)
- [Limitations and Assumptions](#limitations-and-assumptions)

---


## Setting Up and Deploying the API

## Prerequisites

- Node.js and npm should be installed on your machine. You can download and install them from the official Node.js website (https://nodejs.org).

## Installation

1. Clone the repository or download the source code.

```bash
git clone https://github.com/t-ega/Lendsqr-Backend
```

2. Navigate to the project directory.

```bash
cd lendsqr-backend
```

3. Install the project dependencies.
```bash
npm install
```

4. Environment Variables
Create a .env file at the root of the application.
Some environment variables have been set up to provide neccessary variables to the application see .env.example in the root directory of this folder and create a .env file with those variables


## Run the Application
To start the NodeJs application locally, use the following command:

```bash
npm run dev
``` 
To run in development mode

```bash
npm run start
```
To run normally

## Accessing the Application

Open postman or any other application of your choice and navigate to http://localhost:3000/v1/api (or the specified port if you have configured it differently in your .env file). You should see your NestJS application running locally.


For local development, make sure you have Node.js, npm, and MySQL installed.

---

## BASE URL
The base URL of the API is: https://localhost:3000/api

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

https://www.postman.com/payload-astronaut-82118376/workspace/lendsqr-backend/collection/29093204-1264bcf3-38d2-4381-a8c5-c8fe7169fdc1?action=share&creator=29093204

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

## Get Currently Logged in User Details
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
- Endpoint: /account/deposit
- Headers : Idempotency-key: myIdempotencyKey // optional

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

## TRANSFER

- HTTP Method: POST
- Endpoint: /account/transfer
- Headers : Idempotency-key: myIdempotencyKey // optional

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
- Endpoint: /account/withdraw
- Headers : Idempotency-key: myIdempotencyKey // optional

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

- POST /users/: Create a new user
- GET /users/me: View the current user's details

- POST /accounts/transfer: Create a new transfer request
- POST /accounts/deposit: Create a new deposit request
- POST /accounts/withdraw: Create a new withdrawal request
---

## Sample Usage

### CREATING A USER

Request:

POST /users
Content-Type: application/json
Authorization: Bearer user_id

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "johndoej@example.com",
  "pin": "1235",
  "phone_number": "1834567899"
}
```
Response:

```json
{
    "id": 13,
    "first_name": "John",
    "last_name": "Doe",
    "email": "johndoe@example.com",
    "phone_number": "1834567399",
    "accountNumber": "2121778027"
}
```

### CREATE A DEPOSIT 

POST /accounts/deposit
Content-Type: application/json
Authorization: Bearer user_id
Headers : Idempotency-key: myIdempotencyKey // optional

Request :

```json
{
    "amount": 10000
}
```

Response : 

```json
{
    "success": true,
    "details": {
        "balance": 50,
        "owner": "13"
    }
}
```

### CREATE A TRANSFER

POST /accounts/transfer
Content-Type: application/json
Authorization: Bearer user_id
Headers : Idempotency-key: myIdempotencyKey // optional

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
    "success": true,
    "destination": "2135460892",
    "source": "2121778027",
    "amount": 25
}
```

## WITHDRAWAL 
POST /accounts/withdraw
Content-Type: application/json
Authorization: Bearer user_id
Headers : Idempotency-key: myIdempotencyKey // optional

Request :

```json
{
    "source": "2152297904",
    "destination": "2116927207", // an external bankaccount number
    "destinationBankName": "Wema Bank",
    "amount": 500,
    "pin": "1234"
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
```# MonyWell-CRUD-API
