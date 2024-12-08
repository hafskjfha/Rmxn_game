"""
Django settings for WebServer project.

Generated by 'django-admin startproject' using Django 5.1.3.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import os,dotenv

dotenv.load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-idatx6u2h48-!l*4pw_0-z)nlrcve765g(nt7a9a@n4d^9wc_y"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    "daphne",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "SocketApp",
    "corsheaders",
    "DBapp",
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "WebServer.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "WebServer.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": f"{os.getenv('POSTGRES_DB')}",
        'USER': f"{os.getenv('POSTGRES_USER')}",        # 데이터베이스 사용자 이름
        'PASSWORD': f"{os.getenv('POSTGRES_PASSWORD')}",         # 데이터베이스 비밀번호
        'HOST': f"{os.getenv('POSTGRES_HOST')}",                 # PostgreSQL이 실행 중인 호스트
        'PORT': '5432',   
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

ASGI_APPLICATION = "WebServer.asgi.application"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [f"{os.getenv('redis_setting')}"],  # 비밀번호 포함 URL
        },
    },
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React의 주소
    "https://ominous-space-winner-x55xg5rp4x553v5w5-3000.app.github.dev",
    "https://ominous-space-winner-x55xg5rp4x553v5w5-8000.app.github.dev",
]

CORS_ORIGIN_WHITELIST =["http://localhost:3000",  # React의 주소
    "https://ominous-space-winner-x55xg5rp4x553v5w5-3000.app.github.dev",
    "https://ominous-space-winner-x55xg5rp4x553v5w5-8000.app.github.dev",
    "https://github.dev"
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS =['manifest.json',]

# settings.py

# settings.py

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,

    'handlers': {
        'info_file': {  # INFO 로그를 기록하는 핸들러
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'log/info.log',  # 로그 파일 경로
            'encoding': 'utf-8',
        },
        'error_file': {  # WARNING 이상 로그를 기록하는 핸들러
            'level': 'WARNING',  # WARNING 이상 로그를 기록
            'class': 'logging.FileHandler',
            'filename': 'log/error.log',  # 로그 파일 경로
            'encoding': 'utf-8',
        },
        'console': {  # 콘솔 출력 핸들러 (선택 사항)
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'info_file', 'error_file'],  # 로그를 콘솔과 파일에 기록
            'level': 'INFO',
            'propagate': True,
        },
        'common': {
            'handlers': ['console', 'info_file', 'error_file'],  # 로그를 콘솔과 파일에 기록
            'level': 'INFO',
            'propagate': False,
        },
        
    },
}


