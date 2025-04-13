# Authentication System

A secure and user-friendly authentication system built with Node.js, Express, and MongoDB. This system provides a complete solution for user registration, login, profile management, and session handling.

## Features

- **User Authentication**
  - Secure registration with email and password
  - Login with username/password
  - Session-based authentication
  - CSRF protection
  - Secure password hashing

- **Profile Management**
  - User profile creation and editing
  - First name, last name, and bio fields
  - Profile picture support (avatar with initials)

- **Security Features**
  - Password hashing with bcrypt
  - Session management
  - CSRF token protection
  - Secure cookie handling
  - Input validation and sanitization

- **User Interface**
  - Clean and modern design
  - Responsive layout
  - User-friendly forms
  - Real-time feedback
  - Error handling and messages

## Tech Stack

- **Frontend**
  - HTML5
  - CSS3 (with Tailwind CSS)
  - JavaScript (ES6+)
  - Fetch API for HTTP requests

- **Backend**
  - Node.js
  - Express.js
  - MongoDB (with Mongoose)
  - Express-session for session management
  - CSURF for CSRF protection

## Project Structure

```
authentication_system/
├── client/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── auth.js
│   └── index.html
├── server/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   └── server.js
└── README.md
```

## Getting Started

1. **Prerequisites**
   - Node.js (v14 or higher)
   - MongoDB
   - npm or yarn

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/authentication_system.git
   cd authentication_system

   # Install dependencies
   npm install

   # Start MongoDB
   # (Make sure MongoDB is running on your system)

   # Start the server
   npm start
   ```

3. **Configuration**
   - The server runs on `http://localhost:3001`
   - MongoDB connection string can be configured in `server.js`
   - Session and CSRF settings can be adjusted in `server.js`

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check-auth` - Check authentication status
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

## Security Features

- **Password Security**
  - Passwords are hashed using bcrypt
  - Minimum password length requirement
  - Password confirmation check

- **Session Security**
  - Secure session cookies
  - Session expiration
  - CSRF protection on all POST/PUT requests

- **Input Validation**
  - Server-side validation
  - Client-side validation
  - Error handling and sanitization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Express.js team for the amazing framework
- MongoDB for the database
- Tailwind CSS for the styling framework 