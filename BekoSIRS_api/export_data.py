# -*- coding: utf-8 -*-
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bekosirs_backend.settings')
django.setup()

from django.core import serializers
from django.apps import apps

# Get all models
all_models = []
for app_config in apps.get_app_configs():
    if app_config.name not in ['contenttypes', 'auth', 'admin', 'sessions']:
        all_models.extend(app_config.get_models())

# Serialize all data
data = serializers.serialize('json', 
    [obj for model in all_models for obj in model.objects.all()],
    indent=2,
    use_natural_foreign_keys=True,
    use_natural_primary_keys=True
)

# Write to file with UTF-8 encoding
with open('data_backup.json', 'w', encoding='utf-8') as f:
    f.write(data)

print(f"✓ Data exported successfully to data_backup.json")
print(f"✓ Total models exported: {len(all_models)}")
