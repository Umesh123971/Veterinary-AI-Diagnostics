from django.db import models
from django.contrib.auth.models import AbstractUser

ROLE_CHOICES = (
    ('admin', 'Administrator'),
    ('technician', 'Lab Technician'),
    ('doctor', 'Doctor / Clinician'),
)

STATUS_CHOICES = (
    ('Active', 'Active'),
    ('Inactive', 'Inactive'),
    ('Suspended', 'Suspended'),
)

class CustomUser(AbstractUser):
    custom_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='doctor')
    role_label = models.CharField(max_length=100, default='Doctor / Clinician')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    phone = models.CharField(max_length=50, blank=True, default='')
    organization = models.CharField(max_length=255, blank=True, default='')
    avatar = models.TextField(blank=True, default='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')
    created_date = models.DateField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.name and (self.first_name or self.last_name):
            self.name = f"{self.first_name} {self.last_name}".strip()
        elif self.name and not self.first_name:
            parts = self.name.split(' ', 1)
            self.first_name = parts[0]
            if len(parts) > 1:
                self.last_name = parts[1]
        
        # Set role label if missing
        if self.role == 'admin':
            self.role_label = 'Administrator'
        elif self.role == 'technician':
            self.role_label = 'Lab Technician'
        elif self.role == 'doctor':
            self.role_label = 'Doctor / Clinician'

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.role})"
