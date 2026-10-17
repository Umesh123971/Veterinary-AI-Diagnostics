from django.db import models

class Notification(models.Model):
    custom_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    timestamp = models.CharField(max_length=100, default='Just now')
    type = models.CharField(max_length=20, default='info') # info, warning, success, alert
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({'Read' if self.read else 'Unread'})"
