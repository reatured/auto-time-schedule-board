# FastAPI + React Auth Demo

A full-stack authentication demo with FastAPI backend and React frontend, ready for deployment on Railway.

## Features
- User sign up (`/signup`)
- User log in with JWT (`/login`)
- Get current user info (`/me`)
- React frontend with login/signup forms
- JWT-based authentication
- CORS enabled for cross-origin requests

## Local Development

### Backend Setup
1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Create a `.env` file:**
   ```env
   SECRET_KEY=your-secret-key-here
   ```
3. **Run the backend:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup
1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the frontend:**
   ```bash
   npm start
   ```

## Deploy to Railway

### Backend Deployment
1. **Push your code to GitHub**
2. **Create a new Railway project:**
   - Go to [Railway](https://railway.app/)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
3. **Set environment variables:**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add `SECRET_KEY` with a secure random string
4. **Deploy:**
   - Railway will automatically detect the Python app
   - It will install dependencies from `requirements.txt`
   - The app will start using the `Procfile`

### Frontend Deployment
1. **Update API URL:**
   - In `frontend/src/App.js`, update the `API_URL` to your deployed backend URL
   - Or set `REACT_APP_API_URL` environment variable
2. **Deploy to Railway:**
   - Create another Railway project for the frontend
   - Or use a static hosting service like Vercel/Netlify
   - For Railway, you can create a separate service in the same project

### Alternative: Deploy Frontend to Vercel
1. **Push frontend to a separate GitHub repo**
2. **Connect to Vercel:**
   - Go to [Vercel](https://vercel.com/)
   - Import your frontend repository
   - Set build command: `npm run build`
   - Set output directory: `build`
3. **Set environment variable:**
   - Add `REACT_APP_API_URL` with your Railway backend URL

## API Endpoints

- `GET /` - Health check and API info
- `GET /docs` - Interactive API documentation (Swagger UI)
- `POST /signup` - Register a new user
  - Body: `{ "username": "...", "password": "...", "full_name": "..." }`
- `POST /login` - Get JWT token
  - Form data: `username`, `password`
- `GET /me` - Get current user info
  - Requires `Authorization: Bearer <token>` header

## Environment Variables

- `SECRET_KEY` - Secret key for JWT token signing (required)
- `PORT` - Port for the server (Railway sets this automatically)

## Files Structure

```
├── main.py                 # FastAPI backend
├── requirements.txt        # Python dependencies
├── Procfile               # Railway deployment config
├── railway.json           # Railway configuration
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   └── App.css        # Styles
│   └── package.json       # Node.js dependencies
└── README.md              # This file
```

---

**Note:** This demo uses in-memory storage. For production, use a real database like PostgreSQL. 