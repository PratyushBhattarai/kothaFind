# listings/models.py
from django.db import models
from users.models import User


class RenterProfile(models.Model):
    """Extended profile for renter users — location + contact."""
    user         = models.OneToOneField(User, on_delete=models.CASCADE, related_name="renter_profile")
    # Location
    latitude     = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude    = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    address      = models.TextField(blank=True)
    ward         = models.CharField(max_length=10, blank=True)
    tole         = models.CharField(max_length=100, blank=True)
    district     = models.CharField(max_length=50, default="Kathmandu")
    # Contact
    phone        = models.CharField(max_length=20, blank=True)
    alt_phone    = models.CharField(max_length=20, blank=True)
    whatsapp     = models.CharField(max_length=20, blank=True)
    email        = models.EmailField(blank=True)
    # Terms
    terms_agreed = models.BooleanField(default=False)
    terms_agreed_at = models.DateTimeField(null=True, blank=True)
    # Meta
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"RenterProfile({self.user.email})"


class Property(models.Model):
    """A building / house owned by a renter."""
    TYPE_CHOICES = [("house","House"),("flat","Apartment/Flat"),("commercial","Commercial")]

    owner        = models.ForeignKey(User, on_delete=models.CASCADE, related_name="properties")
    name         = models.CharField(max_length=200)
    type         = models.CharField(max_length=20, choices=TYPE_CHOICES, default="house")
    floors       = models.PositiveSmallIntegerField(default=1)
    year_built   = models.PositiveSmallIntegerField(null=True, blank=True)
    description  = models.TextField(blank=True)
    amenities    = models.JSONField(default=list)   # e.g. ["Parking","CCTV"]
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.owner.email})"


class Room(models.Model):
    """A single rentable room inside a property."""
    TYPE_CHOICES = [
        ("single","Single"),("double","Double"),
        ("1bhk","1 BHK"),("2bhk","2 BHK"),("studio","Studio"),
    ]
    STATUS_CHOICES = [
        ("available","Available"),("rented","Rented"),("hidden","Hidden"),
    ]

    house        = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="rooms")
    title           = models.CharField(max_length=200)
    room_type       = models.CharField(max_length=10, choices=TYPE_CHOICES, default="single")
    floor           = models.PositiveSmallIntegerField(default=1)
    size_sqft       = models.PositiveSmallIntegerField(null=True, blank=True)
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2)
    description     = models.TextField(blank=True)
    features        = models.JSONField(default=list)   # e.g. ["Attached bathroom","WiFi"]
    status          = models.CharField(max_length=10, choices=STATUS_CHOICES, default="available")
    view_count      = models.PositiveIntegerField(default=0)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    @property
    def room_type_display(self):
        return dict(self.TYPE_CHOICES).get(self.room_type, self.room_type)

    @property
    def inquiry_count(self):
        return self.inquiries.count()

    def __str__(self):
        return f"{self.title} — {self.house.name}"


class RoomMedia(models.Model):
    """Photo or video attached to a room."""
    MEDIA_CHOICES = [("image","Image"),("video","Video")]

    room       = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="media")
    file       = models.FileField(upload_to="rooms/%Y/%m/")
    media_type = models.CharField(max_length=10, choices=MEDIA_CHOICES, default="image")
    uploaded_at= models.DateTimeField(auto_now_add=True)

    @property
    def url(self):
        return self.file.url


class RoomView(models.Model):
    """Records each time a unique visitor views a room listing."""
    room        = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="views")
    ip_address  = models.GenericIPAddressField(null=True, blank=True)
    session_key = models.CharField(max_length=40, blank=True)
    viewed_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        # prevent duplicate views from same session in same hour
        unique_together = ("room","session_key")


class Inquiry(models.Model):
    """A tenant contacting a renter about a room."""
    room       = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="inquiries")
    name       = models.CharField(max_length=100)
    phone      = models.CharField(max_length=20)
    message    = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry for {self.room.title} from {self.name}"
