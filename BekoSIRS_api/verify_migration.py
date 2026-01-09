# -*- coding: utf-8 -*-
"""
Verify data migration from SQLite to SQL Server
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bekosirs_backend.settings')
django.setup()

from products.models import CustomUser, Product, Category, Wishlist, ServiceRequest, Notification

print("=" * 60)
print("DATABASE MIGRATION VERIFICATION REPORT")
print("=" * 60)
print()

# Check counts
models_to_check = [
    ('Users', CustomUser),
    ('Products', Product),
    ('Categories', Category),
    ('Wishlists', Wishlist),
    ('Service Requests', ServiceRequest),
    ('Notifications', Notification),
]

print("Data Count Verification:")
print("-" * 60)
total_objects = 0
for name, model in models_to_check:
    count = model.objects.count()
    total_objects += count
    print(f"  {name:<20} : {count:>5} records")

print("-" * 60)
print(f"  {'TOTAL':<20} : {total_objects:>5} records")
print()

# Check users with details
print("User Details:")
print("-" * 60)
users = CustomUser.objects.all()[:5]
for user in users:
    print(f"  - {user.username} ({user.email}) - {user.role}")

if users.count() == 0:
    print("  No users found")
print()

# Check products
print("Product Sample:")
print("-" * 60)
products = Product.objects.all()[:3]
for product in products:
    print(f"  - {product.name} ({product.price} TL) - Stock: {product.stock}")
    
if products.count() == 0:
    print("  No products found")
print()

print("=" * 60)
print("✓ MIGRATION VERIFICATION COMPLETED")
print("=" * 60)
