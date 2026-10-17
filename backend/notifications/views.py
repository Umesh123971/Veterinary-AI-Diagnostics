from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import time
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        lookup = self.kwargs.get('pk')
        notif = Notification.objects.filter(custom_id=lookup).first()
        if notif:
            return notif
        return super().get_object()

    def create(self, request, *args, **kwargs):
        custom_id = f"NOTIF-{int(time.time() * 1000)}"
        title = request.data.get('title', 'Notification')
        message = request.data.get('message', '')
        timestamp = request.data.get('timestamp', 'Just now')
        notif_type = request.data.get('type', 'info')

        notif = Notification.objects.create(
            custom_id=custom_id,
            title=title,
            message=message,
            timestamp=timestamp,
            type=notif_type,
            read=False
        )
        return Response(NotificationSerializer(notif).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch', 'post'], url_path='read')
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.read = True
        notif.save()
        return Response({'success': True, 'notification': NotificationSerializer(notif).data})

    @action(detail=False, methods=['post'], url_path='clear')
    def clear_all(self, request):
        Notification.objects.all().delete()
        return Response({'success': True, 'message': 'All notifications cleared'})
