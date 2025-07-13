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
    ```
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    JWT_SECRET=your-jwt-secret-key
    PORT=5000
    MONGO_URI=your-mongodb-uri
    ```
- The `dotenv` package loads these variables into the application via `require('dotenv').config()` in `server.js`.

### 3. **Designing the User Model**
- The `models/User.js` file includes fields to support Google authentication:
  - `googleId`: Stores the unique Google user ID.
  - `authMethod`: Tracks the authentication method (`password` or `google`) to enforce method-specific login.
  - `email`: Set as unique to prevent duplicate accounts.
- The schema is defined as:
  ```javascript
  const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    googleId: String,
    authMethod: { type: String, required: true, enum: ['password', 'google'], default: 'password' }
  });
  ```

### 4. **Integrating Passport.js with Google Strategy**
- Passport.js is configured in `routes/auth.js` to handle Google OAuth:
  - The `GoogleStrategy` is initialized with credentials from `.env` and a callback URL (`http://localhost:5000/api/auth/google/callback`) for post-authentication redirects.
- The strategy callback logic works as follows:
  - Checks for an existing user by `email`.
  - If no user exists, creates a new user with `googleId`, `email`, `name`, and sets `authMethod` to `google`.
  - If a user exists with a `password` `authMethod`, returns a message to use password login.
  - If a user exists with `googleId` or is linked, generates a JWT token.
- Example implementation:
  ```javascript
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        if (user.authMethod === 'password') {
          return done(null, { user: null, msg: 'This email is registered with password authentication. Please log in using the password method.' });
        }
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
      } else {
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          authMethod: 'google'
        });
        await user.save();
      }
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
      return done(null, { user, token });
    } catch (err) {
      return done(err, null);
    }
  }));
  ```

### 5. **Defining OAuth Routes**
- Two routes were added in `routes/auth.js` to manage the OAuth flow:
  - `/google`: Initiates the authentication process using `passport.authenticate` with scopes for `profile` and `email`.
  - `/google/callback`: Handles the redirect from Google, processes the authentication result, and redirects to the frontend with a JWT token or an error message.
- Example routes:
  ```javascript
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    if (!req.user.user) {
      return res.redirect(`http://localhost:3000?msg=${encodeURIComponent(req.user.msg)}`);
    }
    const token = req.user.token;
    res.redirect(`http://localhost:3000?token=${token}`);
  });
  ```

### 6. **Ensuring Middleware Integration**
- Passport.js is initialized in `server.js` with `app.use(passport.initialize())` to enable authentication middleware.
- CORS is configured to allow requests from the frontend (`http://localhost:3000`) using `app.use(cors({ origin: 'http://localhost:3000' }))`.

### 7. **Enforcing Authentication Method Consistency**
- The `/signup` and `/login` routes were designed to enforce that users log in with their original method:
  - During signup, the system checks if an email is associated with a different `authMethod` and returns a message to use the appropriate method.
  - During login, it verifies that `authMethod` matches `password` before allowing password-based login.
- This approach prevents conflicts and guides users to the correct authentication path.

### 8. **Testing the Implementation**
- The OAuth flow was tested with various scenarios:
  - Signing up with a password, then attempting Google login—resulted in a message to use password login.
  - Signing up with Google, then attempting password login—resulted in a message to use Google login.
  - Verified successful logins with the correct method.
- Ensured the system handled all cases gracefully without server errors.

## Key Considerations
- **Security**: Environment variables store sensitive data, and JWT tokens are signed with a secret key, expiring after 1 hour.
- **Error Handling**: Custom messages guide users instead of exposing MongoDB errors like `E11000`.
- **Flexibility**: The `authMethod` field supports future integration of additional OAuth providers.
- **Redirect URL**: The callback URL is set for local development (`http://localhost:5000/api/auth/google/callback`), requiring updates for production.
- **Session Management**: Passport sessions are disabled (`session: false`) since JWT manages authentication state.

## Lessons Learned
- Checking for existing users by `email` before creation avoids duplicate key issues.
- Using `authMethod` ensures method-specific login, improving security and user experience.
- Careful handling of OAuth redirects passes tokens or errors to the frontend securely.
- Testing edge cases (e.g., mixed authentication methods) is essential for robustness.

## Next Steps
- **Production Readiness**: Update the callback URL and CORS origin using environment variables.
- **Refresh Tokens**: Add refresh tokens to extend session duration.
- **Input Validation**: Incorporate `express-validator` for robust input checks.
- **Logging**: Implement logging for authentication attempts to monitor activity.

This implementation provides a solid foundation for Google OAuth integration, balancing security, usability, and scalability. Explore the code to adapt and expand it further!
