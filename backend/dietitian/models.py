from django.db import models
from django.conf import settings

class DietitianClientRelation(models.Model):
    dietitian = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='client_relationships'
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='dietitian_relationship'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('dietitian', 'client')

    def __str__(self):
        return f"Dietitian: {self.dietitian.username} -> Client: {self.client.username}"


class DietitianMessage(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_dietitian_messages'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='received_dietitian_messages'
    )
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['sent_at']

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username} at {self.sent_at}"


class Appointment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('cancelled', 'Cancelled'),
    )
    dietitian = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='dietitian_appointments'
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='client_appointments'
    )
    scheduled_at = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')

    class Meta:
        ordering = ['scheduled_at']

    def __str__(self):
        return f"Session: {self.client.username} & {self.dietitian.username} at {self.scheduled_at}"
