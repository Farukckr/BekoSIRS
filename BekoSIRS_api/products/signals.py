"""
Django signals for Products app.
Auto-creates Delivery record when ProductAssignment is created.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ProductAssignment, Delivery, DepotLocation


@receiver(post_save, sender=ProductAssignment)
def create_delivery_for_assignment(sender, instance, created, **kwargs):
    """
    Automatically create a Delivery record when a ProductAssignment is created.
    Sets delivery address from customer's profile.
    """
    if created:
        # Get customer address
        customer = instance.customer
        
        # Get default depot (if exists)
        try:
            default_depot = DepotLocation.objects.get(is_default=True)
        except DepotLocation.DoesNotExist:
            default_depot = None
        
        # Create formatted address
        address_parts = []
        if customer.open_address:
            address_parts.append(customer.open_address)
        if customer.area:
            address_parts.append(customer.area.name)
        if customer.district:
            address_parts.append(customer.district.name)
        
        formatted_address = ", ".join(address_parts) if address_parts else customer.address or ""
        
        # Create delivery
        Delivery.objects.create(
            assignment=instance,
            address=formatted_address,
            address_lat=customer.address_lat,
            address_lng=customer.address_lng,
            depot=default_depot,
            customer_phone_snapshot=customer.phone_number or "",
            address_snapshot=formatted_address,
            status='WAITING'
        )
