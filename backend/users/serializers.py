from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    createdDate = serializers.DateField(source='created_date', read_only=True)
    roleLabel = serializers.CharField(source='role_label', read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'custom_id',
            'username',
            'email',
            'name',
            'role',
            'roleLabel',
            'status',
            'phone',
            'organization',
            'avatar',
            'createdDate',
            'password'
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Use custom_id if present for frontend compatibility (e.g. USR-001)
        if instance.custom_id:
            ret['id'] = instance.custom_id
        else:
            ret['id'] = f"USR-{instance.id:03d}"
        return ret

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if 'username' not in validated_data and 'email' in validated_data:
            validated_data['username'] = validated_data['email']

        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_password('demo1234')
        user.save()
        
        if not user.custom_id:
            user.custom_id = f"USR-{user.id:03d}"
            user.save(update_fields=['custom_id'])
            
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
