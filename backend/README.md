# Authentication Backend

Complete email/password authentication system with JWT, email verification, and password reset.

## Features

- ✅ User registration with email verification
- ✅ Login with JWT authentication
- ✅ Password reset via email
- ✅ Protected routes with middleware
- ✅ Secure password hashing with bcrypt
- ✅ MySQL database
- ✅ Input validation
- ✅ Security best practices

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure MySQL Database

Create the database and table:

```bash
mysql -u root -p < database/schema.sql
```

Or manually:
1. Open MySQL: `mysql -u root -p`
2. Run the SQL commands in `database/schema.sql`

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
- Database credentials
- JWT secret key
- Email credentials (Gmail app password)

### 4. Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server runs on: `http://localhost:5000`

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/verify-email?token=xxx` | Verify email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Protected Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user info |

## API Usage Examples

### Register User

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

### Login

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
}
```

### Get Current User (Protected)

```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

## Email Configuration (Gmail)

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use the app password in `.env` file

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token authentication
- ✅ Protected routes with middleware
- ✅ Email verification required before login
- ✅ Password reset token expiration (1 hour)
- ✅ SQL injection protection (parameterized queries)
- ✅ Input validation
- ✅ CORS configuration

## Database Schema

```sql
users
├── id (INT, PK)
├── first_name (VARCHAR)
├── last_name (VARCHAR)
├── username (VARCHAR, UNIQUE)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── is_email_verified (BOOLEAN)
├── email_verification_token (VARCHAR)
├── reset_password_token (VARCHAR)
├── reset_password_expires (DATETIME)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Deployment

### Environment Variables for Production

- Change `JWT_SECRET` to a strong random string
- Use strong database password
- Configure proper email service
- Set `NODE_ENV=production`
- Use HTTPS in production
- Set proper CORS origins

### Recommended Hosting

- Backend: Heroku, Railway, DigitalOcean, AWS
- Database: AWS RDS, DigitalOcean Managed DB, PlanetScale
- Email: SendGrid, AWS SES, Mailgun

## Troubleshooting

**Database connection error:**
- Check MySQL is running: `mysql -u root -p`
- Verify database credentials in `.env`
- Ensure database exists

**Email not sending:**
- Verify Gmail app password
- Check EMAIL_* variables in `.env`
- Check firewall/network settings

**JWT errors:**
- Ensure JWT_SECRET is set
- Check token expiration
- Verify Authorization header format: `Bearer TOKEN`

