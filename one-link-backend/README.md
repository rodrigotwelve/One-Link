# One-Link Backend

A complete backend solution for the One-Link social bio platform, built with Express.js, Sequelize ORM, and SQLite.

## Features

- **User Management**: User registration, authentication, and profile management
- **Link Management**: CRUD operations for social bio links with ordering
- **JWT Authentication**: Secure token-based authentication
- **Database**: SQLite database with Sequelize ORM
- **Validation**: Comprehensive input validation and error handling
- **Security**: Password hashing with bcrypt, CORS support

## Project Structure

```
one-link-backend/
├── config.env              # Environment configuration
├── index.js               # Main server file
├── package.json           # Dependencies and scripts
├── models/                # Database models
│   ├── index.js          # Sequelize configuration and associations
│   ├── User.js           # User model with authentication
│   └── Link.js           # Link model for social bio
├── routes/                # API route handlers
│   ├── auth.js           # Authentication routes (register/login)
│   └── links.js          # Link management routes
├── middleware/            # Custom middleware
│   └── auth.js           # JWT authentication middleware
└── README.md             # This file
```

## Database Models

### User Model
- `user_id` (Primary Key, Auto-increment)
- `username` (Unique, 3-50 characters)
- `email` (Unique, validated format)
- `password_hash` (Encrypted with bcrypt)
- `created_at`, `updated_at` (Timestamps)

### Link Model
- `link_id` (Primary Key, Auto-increment)
- `user_id` (Foreign Key to User)
- `title` (1-100 characters)
- `url` (Validated URL format, max 500 characters)
- `order` (Integer for sorting, default 0)
- `created_at`, `updated_at` (Timestamps)

### Relationships
- **One-to-Many**: One User can have many Links
- **Cascade**: Deleting a user automatically deletes their links

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/login`
Authenticate existing user and get access token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:** Same format as register, but for existing user.

### Link Management Routes (`/api/links`)

**Note:** All link routes require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### GET `/api/links`
Get all links for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "link_id": 1,
      "title": "My Website",
      "url": "https://example.com",
      "order": 0,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Found 1 links"
}
```

#### POST `/api/links`
Create a new link for the authenticated user.

**Request Body:**
```json
{
  "title": "My Instagram",
  "url": "https://instagram.com/johndoe",
  "order": 1
}
```

**Note:** `order` is optional. If not provided, it will be automatically set to the next available order number.

#### PUT `/api/links/:id`
Update an existing link by ID.

**Request Body:** Same as POST, but all fields are optional.

#### DELETE `/api/links/:id`
Delete a link by ID.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   cd one-link-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `config.env.example` to `config.env` (if available)
   - Update the following variables:
     - `PORT`: Server port (default: 5000)
     - `NODE_ENV`: Environment (development/production)
     - `JWT_SECRET`: Secret key for JWT tokens (change this in production!)

4. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify the server is running:**
   - Visit `http://localhost:5000` in your browser
   - You should see: `{"message": "One-Link Backend is running"}`

### Database

The application uses SQLite with Sequelize ORM. The database file (`database.sqlite`) will be automatically created in the backend directory when you first run the application.

**Database synchronization:**
- Tables are automatically created on first run
- Existing data is preserved between restarts
- Use `{ force: true }` in `sequelize.sync()` to recreate tables (⚠️ **WARNING**: This will delete all data!)

## Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login and Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 3. Create a Link (using the token from step 2)
```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "My Website",
    "url": "https://example.com"
  }'
```

### 4. Get All Links
```bash
curl -X GET http://localhost:5000/api/links \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific error message"
    }
  ]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
- **JWT Authentication**: Secure token-based authentication with configurable expiration
- **Input Validation**: Comprehensive validation for all user inputs
- **CORS Support**: Configurable Cross-Origin Resource Sharing
- **SQL Injection Protection**: Sequelize ORM provides built-in protection

## Development

### Adding New Models
1. Create a new model file in the `models/` directory
2. Import and define associations in `models/index.js`
3. Export the model from `models/index.js`

### Adding New Routes
1. Create a new route file in the `routes/` directory
2. Import and use the route in `index.js`
3. Apply appropriate middleware (authentication, validation, etc.)

### Environment Variables
- `PORT`: Server port number
- `NODE_ENV`: Environment mode (affects error details and logging)
- `JWT_SECRET`: Secret key for JWT token signing

## Production Considerations

1. **Change JWT_SECRET**: Use a strong, unique secret key
2. **Database**: Consider using PostgreSQL or MySQL for production
3. **HTTPS**: Enable HTTPS in production
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Logging**: Add comprehensive logging and monitoring
6. **Environment**: Set `NODE_ENV=production`

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check if the backend directory is writable
   - Verify SQLite is supported on your system

2. **JWT token invalid**
   - Ensure the token is included in the Authorization header
   - Check if the token has expired
   - Verify JWT_SECRET is set correctly

3. **Validation errors**
   - Check the request body format
   - Ensure all required fields are provided
   - Verify field length limits

### Debug Mode
Set `NODE_ENV=development` in your `config.env` file to see detailed error messages and SQL queries.

## License

This project is licensed under the ISC License.
