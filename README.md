# VIDTUBE

VIDTUBE is a video sharing platform that allows users to register, log in, and manage their accounts. This project includes user authentication, token generation, and cloud storage for user avatars and cover images.

## Features

- User Registration
- User Login
- Token Generation (Access and Refresh Tokens)
- User Logout
- Refresh Access Token
- Cloud Storage for Avatars and Cover Images

## Installation

1. Clone the repository:
  ```bash
  git clone https://github.com/yourusername/vidtube.git
  cd vidtube
  ```

2. Install dependencies:
  ```bash
  npm install
  ```

3. Set up environment variables:
  Create a `.env` file in the root directory and add the following variables:
  ```env
  NODE_ENV=development
  PORT=5000
  MONGO_URI=your_mongodb_uri
  JWT_SECRET=your_jwt_secret
  REFRESH_TOKEN_SECRET=your_refresh_token_secret
  CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
  CLOUDINARY_API_KEY=your_cloudinary_api_key
  CLOUDINARY_API_SECRET=your_cloudinary_api_secret
  ```

4. Start the server:
  ```bash
  npm start
  ```

## API Endpoints

### User Registration

- **URL:** `/api/users/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
   "fullName": "John Doe",
   "email": "john@example.com",
   "username": "johndoe",
   "password": "password123",
   "avatar": "path/to/avatar",
   "coverImage": "path/to/coverImage"
  }
  ```

### User Login

- **URL:** `/api/users/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
   "email": "john@example.com",
   "username": "johndoe",
   "password": "password123"
  }
  ```

### Refresh Access Token

- **URL:** `/api/users/refresh-token`
- **Method:** `POST`
- **Cookies:** `refreshToken`

### User Logout

- **URL:** `/api/users/logout`
- **Method:** `POST`

## License

This project is licensed under the MIT License.
