# -*- coding: utf-8 -*-
"""
Reset admin user password to a known value
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bekosirs_backend.settings')
django.setup()

from products.models import CustomUser

# Find admin user
try:
    admin = CustomUser.objects.get(username='admin')
    # Set password to 'admin123'
    admin.set_password('admin123')
    admin.save()
    print("✓ Admin password has been reset to: admin123")
    print(f"✓ Username: {admin.username}")
    print(f"✓ Email: {admin.email}")
    print(f"✓ Role: {admin.role}")
except CustomUser.DoesNotExist:
    print("✗ Admin user not found. Creating new admin user...")
    admin = CustomUser.objects.create_user(
        username='admin',
        email='admin@bekosirs.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        role='admin',
        is_staff=True,
        is_superuser=True
    )
    print("✓ New admin user created!")
    print("✓ Username: admin")
    print("✓ Password: admin123")
    print("✓ Email: admin@bekosirs.com")
