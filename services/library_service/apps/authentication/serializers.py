from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Department, CustomFieldDefinition
import csv
import io

User = get_user_model()

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'faculty', 'created_at']

class CustomFieldDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomFieldDefinition
        fields = '__all__'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        token['full_name'] = user.get_full_name() or user.username
        token['reg_number'] = user.reg_number or ''
        token['department'] = user.department.name if getattr(user, 'department', None) else ''
        return token

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
            'is_active_patron', 'debarment_reason', 'staff_notes', 'is_staff', 'date_joined',
            'custom_fields'
        ]
        read_only_fields = ['id', 'date_joined']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
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
