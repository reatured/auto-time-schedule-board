#!/usr/bin/env python3
"""
Database initialization script to add sample users for testing.
Run this script to populate your Railway PostgreSQL database with test users.
"""

import os
from passlib.context import CryptContext
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Railway PostgreSQL database URL (you'll need to replace this with your actual Railway DATABASE_URL)
# You can find this in your Railway project dashboard under Variables
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://your-railway-db-url-here")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Database model for User
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String)

def get_password_hash(password):
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)

def create_sample_users():
    """Create sample users in the database."""
    db = SessionLocal()
    
    # Sample users data
    sample_users = [
        {
            "username": "admin",
            "full_name": "Administrator",
            "password": "admin123"
        },
        {
            "username": "john_doe",
            "full_name": "John Doe",
            "password": "password123"
        },
        {
            "username": "jane_smith",
            "full_name": "Jane Smith",
            "password": "password123"
        },
        {
            "username": "demo_user",
            "full_name": "Demo User",
            "password": "demo123"
        }
    ]
    
    try:
        # Check if users already exist
        existing_users = db.query(User).all()
        if existing_users:
            print(f"Database already has {len(existing_users)} users:")
            for user in existing_users:
                print(f"  - {user.username} ({user.full_name})")
            print("\nSkipping user creation. Database already initialized.")
            return
        
        # Create new users
        created_users = []
        for user_data in sample_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.username == user_data["username"]).first()
            if existing_user:
                print(f"User '{user_data['username']}' already exists, skipping...")
                continue
            
            # Create new user
            hashed_password = get_password_hash(user_data["password"])
            new_user = User(
                username=user_data["username"],
                full_name=user_data["full_name"],
                hashed_password=hashed_password
            )
            db.add(new_user)
            created_users.append(user_data["username"])
        
        # Commit changes
        db.commit()
        
        print("✅ Database initialized successfully!")
        print(f"Created {len(created_users)} sample users:")
        for username in created_users:
            print(f"  - {username}")
        
        print("\n📋 Sample login credentials:")
        print("=" * 40)
        for user_data in sample_users:
            if user_data["username"] in created_users:
                print(f"Username: {user_data['username']}")
                print(f"Password: {user_data['password']}")
                print(f"Full Name: {user_data['full_name']}")
                print("-" * 40)
        
        print("\n🚀 You can now test the login functionality!")
        print("🌐 Frontend: https://reatured.github.io/auto-time-schedule-board")
        print("🔗 Backend: https://web-production-02aca.up.railway.app/docs")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        print("\n💡 Make sure to:")
        print("1. Set the DATABASE_URL environment variable with your Railway PostgreSQL URL")
        print("2. Or replace the DATABASE_URL in this script with your actual Railway database URL")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Initializing Railway PostgreSQL database with sample users...")
    print("=" * 60)
    create_sample_users() 