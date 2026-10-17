from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='custom_id', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'custom_id', 'title', 'message', 'timestamp', 'type', 'read', 'created_at']

    def to_representation(self, instance):
        return {
            'id': instance.custom_id,
            'title': instance.title,
            'message': instance.message,
            'timestamp': instance.timestamp,
            'type': instance.type,
            'read': instance.read,
            'createdAt': instance.created_at.strftime('%Y-%m-%d %H:%M:%S') if instance.created_at else ''
        }
