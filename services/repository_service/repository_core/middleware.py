from django.contrib.auth.models import AnonymousUser

class DummyUser:
    def __init__(self, user_id, username, role, is_staff, is_superuser):
        self.id = user_id
        self.pk = user_id
        self.username = username
        self.role = role
        self.is_staff = is_staff
        self.is_superuser = is_superuser
        self.is_authenticated = True
        self.is_active = True

    @property
    def is_anonymous(self):
        return False

class MicroserviceAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user_id = request.headers.get('X-User-Id')
        if user_id:
            try:
                request.user = DummyUser(
                    user_id=int(user_id),
                    username=request.headers.get('X-User-Username', ''),
                    role=request.headers.get('X-User-Role', ''),
                    is_staff=request.headers.get('X-User-IsStaff') == 'true',
                    is_superuser=request.headers.get('X-User-IsAdmin') == 'true'
                )
            except ValueError:
                request.user = AnonymousUser()
        else:
            request.user = AnonymousUser()
            
        return self.get_response(request)
