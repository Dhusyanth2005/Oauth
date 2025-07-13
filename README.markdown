# Authentication System with Google OAuth Implementation

This project features a full-stack authentication system built with Node.js, Express, MongoDB, and React, supporting both password-based authentication and Google OAuth. This README details how Google OAuth was implemented in the backend, offering a step-by-step guide for learners to understand the process and the considerations involved.

## Overview
The backend leverages Express.js as the web framework, Mongoose for MongoDB interaction, Passport.js for authentication, and the `passport-google-oauth20` strategy to integrate Google OAuth. The implementation allows users to sign up and log in using their Google accounts while ensuring compatibility with the password-based system.

## How Google OAuth Was Implemented in the Backend

### 1. **Setting Up Dependencies**
- The project includes several Node.js packages to support OAuth:
  - `passport`: Provides authentication middleware.
  - `passport-google-oauth20`: Enables the Google OAuth 2.0 strategy.
  - `jsonwebtoken`: Generates JWT tokens after successful authentication.
  - `bcryptjs`: Handles password hashing, integrated with OAuth flows.
  - `express`: Serves as the web server framework.
  - `mongoose`: Manages MongoDB schemas and models.
- These dependencies were added to `package.json` and installed using `npm install`.

### 2. **Configuring Environment Variables**
- A `.env` file stores sensitive credentials securely:
  - `GOOGLE_CLIENT_ID`: Retrieved from the Google Cloud Console after creating a project and OAuth 2.0 credentials.
  - `GOOGLE_CLIENT_SECRET`: The corresponding secret key for the client ID.
  - `JWT_SECRET`: A secret key used to sign JWT tokens.
  - Example `.env` content:
