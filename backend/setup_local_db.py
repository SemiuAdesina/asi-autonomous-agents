#!/usr/bin/env python3
"""
ASI Autonomous Agents Database Initialization Script
This script creates the database schema and initial data for local PostgreSQL
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
import sys

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'asi_agents',
    'user': 'asi_user',
    'password': 'asi_password_2024'
}

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to default postgres database to create our database
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='postgres',
            user='postgres'  # or your superuser
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'asi_agents'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("CREATE DATABASE asi_agents")
            print("Database 'asi_agents' created successfully")
        else:
            print("Database 'asi_agents' already exists")
            
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"Error creating database: {e}")
        return False
    
    return True

def create_user():
    """Create the database user if it doesn't exist"""
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='postgres',
            user='postgres'  # or your superuser
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT 1 FROM pg_roles WHERE rolname = 'asi_user'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("CREATE USER asi_user WITH PASSWORD 'asi_password_2024'")
            print("User 'asi_user' created successfully")
        else:
            print("User 'asi_user' already exists")
            
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"Error creating user: {e}")
        return False
    
    return True

def grant_permissions():
    """Grant permissions to the user"""
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='postgres',
            user='postgres'  # or your superuser
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Grant database ownership
        cursor.execute("ALTER DATABASE asi_agents OWNER TO asi_user")
        cursor.execute("GRANT ALL PRIVILEGES ON DATABASE asi_agents TO asi_user")
        print("Permissions granted to 'asi_user'")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"Error granting permissions: {e}")
        return False
    
    return True

def initialize_schema():
    """Initialize the database schema"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Read and execute the init.sql file
        with open('init.sql', 'r') as f:
            sql_script = f.read()
        
        cursor.execute(sql_script)
        conn.commit()
        
        print("Database schema initialized successfully")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"Error initializing schema: {e}")
        return False
    
    return True

def test_connection():
    """Test the database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        cursor.execute("SELECT version()")
        version = cursor.fetchone()[0]
        print(f"Connected to PostgreSQL: {version}")
        
        cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
        table_count = cursor.fetchone()[0]
        print(f"Number of tables created: {table_count}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg2.Error as e:
        print(f"Connection test failed: {e}")
        return False

def main():
    print("ASI Autonomous Agents Database Setup")
    print("=" * 40)
    
    # Step 1: Create database
    print("\n1. Creating database...")
    if not create_database():
        print("Failed to create database")
        return
    
    # Step 2: Create user
    print("\n2. Creating user...")
    if not create_user():
        print("Failed to create user")
        return
    
    # Step 3: Grant permissions
    print("\n3. Granting permissions...")
    if not grant_permissions():
        print("Failed to grant permissions")
        return
    
    # Step 4: Initialize schema
    print("\n4. Initializing schema...")
    if not initialize_schema():
        print("Failed to initialize schema")
        return
    
    # Step 5: Test connection
    print("\n5. Testing connection...")
    if not test_connection():
        print("Failed to test connection")
        return
    
    print("\n" + "=" * 40)
    print("Database setup completed successfully!")
    print("\nConnection details:")
    print(f"Host: {DB_CONFIG['host']}")
    print(f"Port: {DB_CONFIG['port']}")
    print(f"Database: {DB_CONFIG['database']}")
    print(f"Username: {DB_CONFIG['user']}")
    print(f"Password: {DB_CONFIG['password']}")
    print("\nYou can now connect to this database using pgAdmin or any PostgreSQL client.")

if __name__ == "__main__":
    main()
