# Full-Stack Authentication App

A modern full-stack application with React frontend and Django backend, featuring JWT authentication, OAuth2 social login, user management, and modern UI components.

## 🧩 Tech Stack

### Frontend
- **React 18** (Vite + TypeScript)
- **Tailwind CSS** for styling
- **Headless UI** for accessible components
- **Redux Toolkit** for state management
- **React Router v6** for routing
- **Axios** for API calls
- **Heroicons** for icons

### Backend
- **Django 4.2.7** with Django REST Framework
- **SimpleJWT** for JWT authentication
- **Custom Google OAuth** integration with People API
- **PostgreSQL** database support
- **Redis** for caching and Celery
- **Celery** for background tasks
- **Pillow** for image handling
- **WhiteNoise** for static files
- **Gunicorn** for production deployment

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, SQLite for development)
- Redis (for production)
- Google Cloud Console account (for OAuth setup)

### 🔒 Repository Security Notice

**Important**: This repository has been cleaned of sensitive files including `.env` files and `node_modules` directories. The Git history was rewritten starting from commit `7a790af9` to ensure no sensitive data remains in the version history.

**Security Recommendations:**
- If you had previously cloned this repository, consider rotating any Google OAuth credentials
- Always use the provided `.env.example` files as templates
- Never commit `.env` files (protected by `.gitignore`)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ProjectKarthik
   ```

2. **Set up Python virtual environment**
   ```bash
   cd backend
   python -m venv backend
   source backend/bin/activate  # On Windows: backend\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   **Required Environment Variables:**
   - `SECRET_KEY`: Django secret key (generate a new one)
   - `DEBUG`: Set to `True` for development
   - `GOOGLE_OAUTH2_CLIENT_ID`: From Google Cloud Console
   - `GOOGLE_OAUTH2_CLIENT_SECRET`: From Google Cloud Console
   - Database credentials (if using PostgreSQL)
   
   **Google OAuth Setup:**
   - Follow the detailed guide in `GoogleAuthSetup.md`
   - Set authorized redirect URIs to `http://localhost:5173` (development)
   - Set authorized JavaScript origins to `http://localhost:5173` and `http://localhost:3000`

5. **Database setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   **Required Environment Variables:**
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `VITE_API_BASE_URL`: Backend API URL (default: `http://localhost:8000/api`)

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:8000/api/
Production: https://your-domain.com/api/
```

### Authentication Endpoints

#### 1. User Registration
**POST** `/api/auth/register/`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password1": "securepassword123",
  "password2": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "avatar": null,
    "bio": "",
    "location": "",
    "birth_date": null,
    "is_email_verified": false,
    "date_joined": "2024-01-15T10:30:00Z",
    "last_login": null
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "message": "User registered successfully"
}
```

#### 2. User Login
**POST** `/api/auth/login/`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "avatar": null,
    "bio": "",
    "location": "",
    "birth_date": null,
    "is_email_verified": false,
    "date_joined": "2024-01-15T10:30:00Z",
    "last_login": "2024-01-15T11:45:00Z"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "message": "Login successful"
}
```

#### 3. Password Reset Request
**POST** `/api/auth/password-reset/`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account with this email exists, a password reset link has been sent."
}
```

#### 4. Password Reset Confirmation
**POST** `/api/auth/password-reset-confirm/<uidb64>/<token>/`

**Request Body:**
```json
{
  "new_password": "newSecurePassword123!",
  "confirm_password": "newSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

#### 5. User Logout
**POST** `/api/auth/logout/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

#### 6. Get Current User Profile
**GET** `/api/auth/user/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "avatar": "http://localhost:8000/media/avatars/profile.jpg",
  "bio": "Software Developer",
  "location": "New York",
  "birth_date": "1990-01-15",
  "is_email_verified": true,
  "date_joined": "2024-01-15T10:30:00Z",
  "last_login": "2024-01-15T11:45:00Z"
}
```

#### 7. JWT Token Obtain
**POST** `/api/auth/token/`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe"
  }
}
```

#### 8. JWT Token Refresh
**POST** `/api/auth/token/refresh/`

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 9. Change Password
**PUT** `/api/auth/change-password/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "old_password": "oldpassword123",
  "new_password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

### Social Authentication Endpoints

#### 10. Google OAuth Login
**POST** `/api/auth/google/`

**Request Body:**
```json
{
  "access_token": "ya29.a0AfH6SMC..."
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@gmail.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "avatar": "https://lh3.googleusercontent.com/a/...",
    "bio": "",
    "location": "",
    "birth_date": null,
    "is_email_verified": true,
    "date_joined": "2024-01-15T10:30:00Z",
    "last_login": "2024-01-15T11:45:00Z"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "message": "Google login successful"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid access token"
}
```

This endpoint:
- Verifies the Google access token with Google's People API
- Creates a new user account if the email doesn't exist
- Updates existing user information with Google profile data
- Returns JWT tokens for application authentication

### User Management Endpoints

#### 12. Get User Profile
**GET** `/api/users/profile/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "avatar": "http://localhost:8000/media/avatars/profile.jpg",
  "bio": "Software Developer",
  "location": "New York",
  "birth_date": "1990-01-15"
}
```

#### 13. Update User Profile
**PUT/PATCH** `/api/users/profile/`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
first_name: John
last_name: Doe
bio: Senior Software Developer
location: San Francisco
birth_date: 1990-01-15
avatar: <file>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "avatar": "http://localhost:8000/media/avatars/new_profile.jpg",
  "bio": "Senior Software Developer",
  "location": "San Francisco",
  "birth_date": "1990-01-15"
}
```

#### 14. List Users (Admin Only)
**GET** `/api/users/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "avatar": null,
    "bio": "",
    "location": "",
    "birth_date": null,
    "is_email_verified": false,
    "date_joined": "2024-01-15T10:30:00Z",
    "last_login": "2024-01-15T11:45:00Z"
  }
]
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Lifecycle
- **Access Token**: Expires in 5 minutes (configurable)
- **Refresh Token**: Expires in 7 days (configurable)
- Use the refresh token to obtain new access tokens
- Tokens are blacklisted on logout

## 📝 Error Responses

### Validation Errors (400 Bad Request)
```json
{
  "field_name": [
    "This field is required."
  ],
  "email": [
    "Enter a valid email address."
  ]
}
```

### Authentication Errors (401 Unauthorized)
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

### Permission Errors (403 Forbidden)
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Not Found Errors (404 Not Found)
```json
{
  "detail": "Not found."
}
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
# Or for SQLite (development)
# DATABASE_URL=sqlite:///db.sqlite3

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT Settings
ACCESS_TOKEN_LIFETIME=5  # minutes
REFRESH_TOKEN_LIFETIME=7  # days

# Email Settings (for password reset)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com

# Google OAuth (Required for Google login)
GOOGLE_OAUTH2_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_OAUTH2_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Redis (Production)
REDIS_URL=redis://localhost:6379/0
```

### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Google OAuth (Required for Google login)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 🚀 Deployment

### Backend Deployment (Django)

1. **Install production dependencies**
   ```bash
   pip install gunicorn whitenoise
   ```

2. **Collect static files**
   ```bash
   python manage.py collectstatic --noinput
   ```

3. **Run with Gunicorn**
   ```bash
   gunicorn config.wsgi:application --bind 0.0.0.0:8000
   ```

### Frontend Deployment (React)

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Serve static files**
   ```bash
   npm run preview
   # Or deploy dist/ folder to your hosting service
   ```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🔧 Troubleshooting

### Common Issues

#### Google OAuth "Error 400: redirect_uri_mismatch"
- Verify redirect URIs in Google Cloud Console match exactly:
  - Development: `http://localhost:5173`
  - Production: `https://yourdomain.com`
- Check that JavaScript origins are also configured

#### Environment Variables Not Loading
- Ensure `.env` files exist in both `frontend/` and `backend/` directories
- Verify variable names match exactly (case-sensitive)
- Restart development servers after changing `.env` files

#### Database Connection Issues
- For PostgreSQL: Ensure database exists and credentials are correct
- For SQLite: Default database will be created automatically
- Run migrations: `python manage.py migrate`

#### CORS Issues
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Default development setup allows `http://localhost:5173`

#### Password Reset Issues
- **"Password confirmation is required" error**: This was a known issue that has been fixed. The frontend now properly sends both `new_password` and `confirm_password` fields to the backend
- **Email not received**: Check spam/junk folders, verify SMTP configuration in `.env` file
- **"Bad Request" errors**: Ensure both password fields are filled and match
- **SMTP configuration**: Use the provided `test_smtp.py` script to verify email settings

## 📁 Project Structure

```
ProjectKarthik/
├── .gitignore                    # Protects sensitive files
├── README.md
├── AuthenticationFlow.md         # Authentication architecture docs
├── GoogleAuthSetup.md           # Google OAuth setup guide
├── backend/
│   ├── .env                     # Environment variables (not in Git)
│   ├── .env.example             # Template for environment setup
│   ├── apps/
│   │   ├── authentication/
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── models.py
│   │   └── users/
│   │       ├── views.py
│   │       ├── serializers.py
│   │       ├── urls.py
│   │       └── models.py
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── .env                     # Environment variables (not in Git)
    ├── .env.example             # Template for environment setup
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── store/
    │   ├── types/
    │   └── utils/
    ├── package.json
    └── vite.config.ts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

---

**Happy Coding! 🚀**