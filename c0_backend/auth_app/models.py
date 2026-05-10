from django.contrib.auth.models import AbstractUser
from django.db import models


class C0User(AbstractUser):
    """
    Custom user for the C0 platform.
    Extends Django's AbstractUser with role and phone fields
    matching the frontend's UserInfo interface.
    """

    ROLE_CHOICES = [
        ('farmer', 'Farmer / Land Owner'),
        ('buyer', 'Carbon Credit Buyer'),
        ('verifier', 'MRV Verifier'),
        ('admin', 'Platform Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='farmer')
    phone = models.CharField(max_length=20, blank=True, default='')

    class Meta:
        db_table = 'c0_users'
        verbose_name = 'C0 User'
        verbose_name_plural = 'C0 Users'

    def __str__(self):
        return f"{self.username} ({self.role})"
