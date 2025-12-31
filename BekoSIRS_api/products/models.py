from django.db import models
from django.contrib.auth.models import AbstractUser
from dateutil.relativedelta import relativedelta

# -------------------------------
# 🔹 Custom User Model
# -------------------------------
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('seller', 'Satıcı'),
        ('customer', 'Müşteri'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)

    # Bildirim Tercihleri
    notify_service_updates = models.BooleanField(default=True, verbose_name="Servis Güncellemeleri")
    notify_price_drops = models.BooleanField(default=True, verbose_name="Fiyat Düşüşleri")
    notify_restock = models.BooleanField(default=True, verbose_name="Stok Bildirimleri")
    notify_recommendations = models.BooleanField(default=True, verbose_name="Ürün Önerileri")
    notify_warranty_expiry = models.BooleanField(default=True, verbose_name="Garanti Süresi Uyarıları")
    notify_general = models.BooleanField(default=True, verbose_name="Genel Bildirimler")

    def __str__(self):
        return f"{self.username} ({self.role})"


# -------------------------------
# 🔹 Category Model
# -------------------------------
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


# -------------------------------
# 🔹 Product Model
# -------------------------------
class Product(models.Model):
    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=50)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    #status = models.CharField(max_length=20, default='in_stock')
    warranty_duration_months = models.PositiveIntegerField(default=24, help_text="Garanti süresi (ay olarak)")
    stock = models.IntegerField(default=0, verbose_name="Stok Adedi")

    def __str__(self):
        return self.name


# -------------------------------
# 🔹 Product Ownership (Kim aldı?)
# -------------------------------
class ProductOwnership(models.Model):
    customer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='owned_products',
        limit_choices_to={'role': 'customer'}
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    purchase_date = models.DateField()
    serial_number = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.customer.username} owns {self.product.name}"

    @property
    def warranty_end_date(self):
        if self.purchase_date:
            return self.purchase_date + relativedelta(months=self.product.warranty_duration_months)
        return None


# -------------------------------
# 🔹 Kullanıcı Aktivite Takibi
# -------------------------------
class UserActivity(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=10)  # 'view', 'search'
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} - {self.product.name}"


# -------------------------------
# 🔹 Wishlist (İstek Listesi)
# -------------------------------
class Wishlist(models.Model):
    customer = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='wishlist',
        limit_choices_to={'role': 'customer'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer.username}'s Wishlist"

    @property
    def item_count(self):
        return self.items.count()


# -------------------------------
# 🔹 WishlistItem (İstek Listesi Öğesi)
# -------------------------------
class WishlistItem(models.Model):
    wishlist = models.ForeignKey(
        Wishlist,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='wishlisted_by'
    )
    added_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True, help_text="Kullanıcı notu")
    notify_on_price_drop = models.BooleanField(default=True, help_text="Fiyat düşüşünde bildirim")
    notify_on_restock = models.BooleanField(default=True, help_text="Stok geldiğinde bildirim")

    class Meta:
        unique_together = ('wishlist', 'product')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.wishlist.customer.username} - {self.product.name}"


# -------------------------------
# 🔹 ViewHistory (Görüntüleme Geçmişi)
# -------------------------------
class ViewHistory(models.Model):
    customer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='view_history',
        limit_choices_to={'role': 'customer'}
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='viewed_by'
    )
    viewed_at = models.DateTimeField(auto_now_add=True)
    view_count = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('customer', 'product')
        ordering = ['-viewed_at']

    def __str__(self):
        return f"{self.customer.username} viewed {self.product.name}"


# -------------------------------
# 🔹 Review (Ürün Değerlendirmesi)
# -------------------------------
class Review(models.Model):
    customer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='reviews',
        limit_choices_to={'role': 'customer'}
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.PositiveIntegerField(help_text="1-5 arası puan")
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(default=False, help_text="Admin onayı")

    class Meta:
        unique_together = ('customer', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.username} - {self.product.name} ({self.rating}/5)"


# -------------------------------
# 🔹 ServiceRequest (Servis Talebi)
# -------------------------------
class ServiceRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Beklemede'),
        ('in_queue', 'Sırada'),
        ('in_progress', 'İşlemde'),
        ('completed', 'Tamamlandı'),
        ('cancelled', 'İptal Edildi'),
    )
    REQUEST_TYPE_CHOICES = (
        ('repair', 'Tamir'),
        ('maintenance', 'Bakım'),
        ('warranty', 'Garanti'),
        ('complaint', 'Şikayet'),
        ('other', 'Diğer'),
    )

    customer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='service_requests',
        limit_choices_to={'role': 'customer'}
    )
    product_ownership = models.ForeignKey(
        ProductOwnership,
        on_delete=models.CASCADE,
        related_name='service_requests'
    )
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES, default='repair')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    description = models.TextField(help_text="Sorun açıklaması")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    assigned_to = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_requests',
        limit_choices_to={'role__in': ['admin', 'seller']}
    )
    resolution_notes = models.TextField(blank=True, null=True, help_text="Çözüm notları")
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"SR-{self.id}: {self.customer.username} - {self.product_ownership.product.name}"


# -------------------------------
# 🔹 ServiceQueue (Servis Kuyruğu)
# -------------------------------
class ServiceQueue(models.Model):
    service_request = models.OneToOneField(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name='queue_entry'
    )
    queue_number = models.PositiveIntegerField()
    priority = models.PositiveIntegerField(default=5, help_text="1=En yüksek, 10=En düşük")
    estimated_wait_time = models.PositiveIntegerField(default=0, help_text="Tahmini bekleme süresi (dakika)")
    entered_queue_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['priority', 'entered_queue_at']

    def __str__(self):
        return f"Queue #{self.queue_number} - SR-{self.service_request.id}"


# -------------------------------
# 🔹 Notification (Bildirim)
# -------------------------------
class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = (
        ('price_drop', 'Fiyat Düşüşü'),
        ('restock', 'Stok Geldi'),
        ('service_update', 'Servis Güncellemesi'),
        ('recommendation', 'Öneri'),
        ('general', 'Genel'),
    )

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES, default='general')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    related_service_request = models.ForeignKey(
        ServiceRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


# -------------------------------
# 🔹 Recommendation (Öneri)
# -------------------------------
class Recommendation(models.Model):
    customer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='recommendations',
        limit_choices_to={'role': 'customer'}
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='recommended_to'
    )
    score = models.FloatField(help_text="Öneri skoru (0-1)")
    reason = models.CharField(max_length=200, help_text="Öneri sebebi")
    created_at = models.DateTimeField(auto_now_add=True)
    is_shown = models.BooleanField(default=False)
    clicked = models.BooleanField(default=False)

    class Meta:
        unique_together = ('customer', 'product')
        ordering = ['-score', '-created_at']

    def __str__(self):
        return f"Recommendation: {self.product.name} for {self.customer.username}"
