import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-gateway-secret-key-default')

DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'gateway_core.urls'

WSGI_APPLICATION = 'gateway_core.wsgi.application'

DATABASES = {}

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True

# Origins from env if specific domains are needed, otherwise default for dev
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173'
).split(',')

TIME_ZONE = 'Asia/Colombo'

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Service URLs configuration
CATALOG_SERVICE_URL = os.getenv('CATALOG_SERVICE_URL', 'http://127.0.0.1:8001')
REPOSITORY_SERVICE_URL = os.getenv('REPOSITORY_SERVICE_URL', 'http://127.0.0.1:8002')
LIBRARY_SERVICE_URL = os.getenv('LIBRARY_SERVICE_URL', 'http://127.0.0.1:8003')
