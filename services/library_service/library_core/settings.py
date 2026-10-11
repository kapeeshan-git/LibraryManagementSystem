"""
Django settings for Library Functions Microservice.
Handles: Authentication, Circulation, Reservations, Fines, Notifications, Reports
University of Vavuniya - Library Management System
"""

from pathlib import Path
import os
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
import sys
import os
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
SHARED_CORE_PATH = os.path.abspath(os.path.join(BASE_DIR, '..'))
if SHARED_CORE_PATH not in sys.path:
    sys.path.insert(0, SHARED_CORE_PATH)
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-library-service-dev-key')
DEBUG = os.getenv('DEBUG', 'True') == 'True'

allowed_hosts_str = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1')
ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_str.split(',') if h.strip()]

INSTALLED_APPS = [
    'django_q',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Internal Domain Apps
    'apps.authentication',
    'apps.circulation',
    'apps.reservations',
    'apps.fines',
    'apps.notifications',
    'apps.reports',
    'apps.backups',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'library_core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'library_core.wsgi.application'

# Database
DB_ENGINE = os.getenv('DB_ENGINE', 'sqlite').lower()

if DB_ENGINE == 'mysql':
    try:
        import pymysql
        pymysql.install_as_MySQLdb()
    except ImportError:
        pass
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv('DB_NAME', 'library_db'),
            'USER': os.getenv('DB_USER', 'root'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', '127.0.0.1'),
            'PORT': os.getenv('DB_PORT', '3306'),
            'OPTIONS': {
                'charset': 'utf8mb4',
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'library_db.sqlite3',
        }
    }

# Custom User Model
AUTH_USER_MODEL = 'authentication.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Colombo'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ('shared_core.response.StandardizedJSONRenderer',),
    'EXCEPTION_HANDLER': 'shared_core.response.standardized_exception_handler',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'library_core.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 24,
}

# Simple JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=4),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS
cors_origins_str = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000')
CORS_ALLOWED_ORIGINS = [orig.strip() for orig in cors_origins_str.split(',') if orig.strip()]
CORS_ALLOW_CREDENTIALS = True

# Library Business Rules
STUDENT_MAX_BOOKS = int(os.getenv('STUDENT_MAX_BOOKS', 2))
STUDENT_LOAN_DAYS = int(os.getenv('STUDENT_LOAN_DAYS', 14))
LECTURER_MAX_BOOKS = int(os.getenv('LECTURER_MAX_BOOKS', 5))
LECTURER_LOAN_DAYS = int(os.getenv('LECTURER_LOAN_DAYS', 30))
FINE_PER_DAY_RS = float(os.getenv('FINE_PER_DAY_RS', 10.00))
HOLD_EXPIRY_HOURS = int(os.getenv('HOLD_EXPIRY_HOURS', 48))

# Inter-service communication
CATALOG_SERVICE_URL = os.getenv('CATALOG_SERVICE_URL', 'http://127.0.0.1:8001')
INTERNAL_API_KEY = os.getenv('INTERNAL_API_KEY', 'dev-internal-api-key-catalog')





# Django-Q Configuration for Background Task Messaging
Q_CLUSTER = {
    'name': 'library_service_q',
    'workers': 4,
    'recycle': 500,
    'timeout': 60,
    'compress': True,
    'cpu_affinity': 1,
    'save_limit': 250,
    'queue_limit': 500,
    'catch_up': False,
    'orm': 'default'
}
