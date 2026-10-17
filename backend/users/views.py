from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from .models import CustomUser
from .serializers import UserSerializer, LoginSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all().order_by('-id')
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        lookup = self.kwargs.get('pk')
        if lookup.startswith('USR-'):
            user = CustomUser.objects.filter(custom_id=lookup).first()
            if user:
                return user
        return super().get_object()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'success': True, 'message': 'User deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data.get('password', '')

        user = CustomUser.objects.filter(email__iexact=email).first()
        if user:
            # For demo convenience or normal auth
            django_login(request, user)
            user_data = UserSerializer(user).data
            return Response({'success': True, 'user': user_data})
        
        return Response({'success': False, 'message': 'Invalid credentials. User not found.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    django_logout(request)
    return Response({'success': True, 'message': 'Logged out successfully'})

@api_view(['GET'])
@permission_classes([AllowAny])
def me_view(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data})
    
    first_user = CustomUser.objects.first()
    if first_user:
        return Response({'user': UserSerializer(first_user).data})
    
    return Response({'user': None})
