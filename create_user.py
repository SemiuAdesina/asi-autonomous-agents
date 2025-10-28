#!/usr/bin/env python3
import sys
sys.path.insert(0, 'backend')
from backend.app import app, db
from backend.models import User

with app.app_context():
    import hashlib
    
    # Check if test user exists
    existing = User.query.filter_by(email='test@example.com').first()
    
    if not existing:
        password = 'Test@123456'
        hashed = hashlib.sha256(password.encode()).hexdigest()
        
        user = User(
            username='testuser',
            email='test@example.com',
            password=hashed,
            is_active=True
        )
        db.session.add(user)
        db.session.commit()
        print('✅ Test user created!')
    else:
        print('⚠️  User already exists')
    
    print('📧 Email: test@example.com')
    print('🔑 Password: Test@123456')
