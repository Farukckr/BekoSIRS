from products.models import ProductAssignment

print("Checking for inconsistent assignments...")
# Filter assignments that say 'PLANNED' but actually have a delivery
inconsistent_qs = ProductAssignment.objects.filter(status='PLANNED', delivery__isnull=False)

count = inconsistent_qs.count()
print(f"Found {count} inconsistent assignments.")

if count > 0:
    for a in inconsistent_qs:
        print(f"Fixing Assignment ID: {a.id} - Customer: {a.customer.username} - Product: {a.product.name}")
        # Fix status to SCHEDULED
        a.status = 'SCHEDULED'
        a.save()
        print(f"  -> Updated status to SCHEDULED")
        
    print("All fixed.")
else:
    print("No inconsistencies found. Data looks clean.")
