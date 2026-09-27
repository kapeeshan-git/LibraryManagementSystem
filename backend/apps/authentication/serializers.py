from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Department
import csv
import io

User = get_user_model()

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'faculty', 'created_at']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer returning role and profile data alongside tokens."""
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'reg_number': user.reg_number,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user.role,
            'department': user.department.name if user.department else None,
            'is_active_patron': user.is_active_patron,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    full_name = serializers.ReadOnlyField(source='get_full_name')

    class Meta:
        model = User
        fields = [
            'id', 'username', 'reg_number', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'department', 'department_name', 'phone_number',
            'is_active_patron', 'debarment_reason', 'staff_notes', 'is_staff', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            # Default fallback password is registration number
            user.set_password(user.reg_number)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class CSVBatchImportSerializer(serializers.Serializer):
    file = serializers.FileField()
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.STUDENT)
