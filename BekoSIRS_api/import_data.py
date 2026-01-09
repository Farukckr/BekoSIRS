# -*- coding: utf-8 -*-
"""
Custom data import script with truncation handling
"""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bekosirs_backend.settings')
django.setup()

from django.core import serializers
from django.db import transaction

# Load the JSON data
with open('data_backup.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"✓ Loaded {len(data)} objects from backup")

# Import with error handling
imported_count = 0
skipped_count = 0
errors = []

for obj in data:
    try:
        # Truncate long fields if needed
        if obj['model'] == 'products.product' and 'fields' in obj:
            if 'campaign_tag' in obj['fields'] and obj['fields']['campaign_tag']:
                # Truncate to 100 characters (or whatever the model allows)
                if len(obj['fields']['campaign_tag']) > 100:
                    obj['fields']['campaign_tag'] = obj['fields']['campaign_tag'][:97] + '...'
        
        # Deserialize and save
        for deserialized_obj in serializers.deserialize('json', json.dumps([obj])):
            deserialized_obj.save()
            imported_count += 1
            
            if imported_count % 50 == 0:
                print(f"  Imported {imported_count} objects...")
                
    except Exception as e:
        skipped_count += 1
        error_msg = f"Error importing {obj.get('model', 'unknown')} (pk={obj.get('pk', 'N/A')}): {str(e)[:100]}"
        errors.append(error_msg)
        if skipped_count <= 5:  # Only print first 5 errors
            print(f"  ⚠ {error_msg}")

print(f"\n✓ Import completed!")
print(f"  Imported: {imported_count}")
print(f"  Skipped: {skipped_count}")

if errors and skipped_count > 5:
    print(f"  (... and {skipped_count - 5} more errors)")
