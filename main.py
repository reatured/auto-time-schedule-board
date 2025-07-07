from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import os
import httpx

from database import get_db, User as DBUser

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
PERPLEXITY_API_KEY = os.environ.get("PERPLEXITY_API_KEY", "YOUR_PERPLEXITY_API_KEY")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

class User(BaseModel):
    username: str
    full_name: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class PerplexityRequest(BaseModel):
    system_input: str
    user_input: str

@app.get("/")
def read_root():
    return {"message": "FastAPI Auth Demo Backend", "docs": "/docs"}

@app.post("/init-db")
def initialize_database(db: Session = Depends(get_db)):
    """Initialize database with sample users for testing."""
    sample_users = [
        {"username": "admin", "full_name": "Administrator", "password": "admin123"},
        {"username": "john_doe", "full_name": "John Doe", "password": "password123"},
        {"username": "jane_smith", "full_name": "Jane Smith", "password": "password123"},
        {"username": "demo_user", "full_name": "Demo User", "password": "demo123"}
    ]
    
    created_users = []
    for user_data in sample_users:
        # Check if user already exists
        existing_user = db.query(DBUser).filter(DBUser.username == user_data["username"]).first()
        if existing_user:
            continue
        
        # Create new user
        hashed_password = get_password_hash(user_data["password"])
        new_user = DBUser(
            username=user_data["username"],
            full_name=user_data["full_name"],
            hashed_password=hashed_password
        )
        db.add(new_user)
        created_users.append(user_data["username"])
    
    db.commit()
    
    return {
        "message": "Database initialized successfully!",
        "created_users": created_users,
        "sample_credentials": [
            {"username": "admin", "password": "admin123", "full_name": "Administrator"},
            {"username": "john_doe", "password": "password123", "full_name": "John Doe"},
            {"username": "jane_smith", "password": "password123", "full_name": "Jane Smith"},
            {"username": "demo_user", "password": "demo123", "full_name": "Demo User"}
        ]
    }

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(db: Session, username: str):
    return db.query(DBUser).filter(DBUser.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

@app.post("/signup", response_model=User)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = get_user(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = DBUser(
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return User(username=db_user.username, full_name=db_user.full_name)

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=User)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(db, username)
    if user is None:
        raise credentials_exception
    return User(username=user.username, full_name=user.full_name)

@app.post("/perplexity")
async def call_perplexity_api(payload: PerplexityRequest):
    print(PERPLEXITY_API_KEY)
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "sonar",
        "messages": [
            {"role": "system", "content": payload.system_input},
            {"role": "user", "content": payload.user_input}
        ]
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json() 