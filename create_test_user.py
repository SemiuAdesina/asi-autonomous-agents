#!/usr/bin/env python3
"""
Quick script to create a test user in the backend database
"""
import sqlite3
import hashlib
import secrets

# Connect to database
conn = sqlite3.connect('instance/asi_agents.db')
cursor = conn.cursor()

# Create test user
username = 'testuser'
email = 'test@example.com'
password = 'Test@123456'
hashed_password = hashlib.sha256(password.encode()).hexdigest()

# Check if user exists
cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
existing = cursor.fetchone()

if not existing:
    cursor.execute('''
        INSERT INTO users (username, email, password, is_active, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
    ''', (username, email, hashed_password, 1))
    conn.commit()
    print(f'✅ Test user created:')
    print(f'   Email: {email}')
    print(f'   Password: {password}')
else:
    print(f'⚠️  User already exists: {email}')

conn.close()
