from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, firebase_uid, **extra):
        if not email:
            raise ValueError("Email required")
        user = self.model(email=self.normalize_email(email), firebase_uid=firebase_uid, **extra)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, firebase_uid, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self.create_user(email, firebase_uid, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [("rentee", "Rentee"), ("renter", "Renter")]

    firebase_uid   = models.CharField(max_length=128, unique=True)
    email          = models.EmailField(unique=True)
    display_name   = models.CharField(max_length=100, blank=True)
    phone          = models.CharField(max_length=20, blank=True)
    role           = models.CharField(max_length=10, choices=ROLE_CHOICES, default="rentee")
    district       = models.CharField(max_length=50, blank=True)  # for renters
    is_verified    = models.BooleanField(default=False)           # renter verification
    is_active      = models.BooleanField(default=True)
    is_staff       = models.BooleanField(default=False)
    created_at     = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["firebase_uid"]
    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"

