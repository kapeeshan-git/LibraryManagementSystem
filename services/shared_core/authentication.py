from rest_framework.authentication import BaseAuthentication

class DummyUser:
    def __init__(self, user_id, username, role, is_staff, is_superuser, full_name='', reg_number='', department=''):
        self.id = user_id
        self.pk = user_id
        self.username = username
        self.role = role
        self.is_staff = is_staff
        self.is_superuser = is_superuser
        self.full_name = full_name
        self.reg_number = reg_number
        self.department = department
        self.is_authenticated = True
        self.is_active = True

    def get_full_name(self):
        return self.full_name or self.username

    @property
    def is_anonymous(self):
        return False

class MicroserviceHeaderAuthentication(BaseAuthentication):
    def authenticate(self, request):
        user_id = request.headers.get('X-User-Id')
        if not user_id:
            return None
        
        try:
            user = DummyUser(
                user_id=int(user_id),
                username=request.headers.get('X-User-Username', ''),
                role=request.headers.get('X-User-Role', ''),
                is_staff=request.headers.get('X-User-IsStaff') == 'true',
                is_superuser=request.headers.get('X-User-IsAdmin') == 'true',
                full_name=request.headers.get('X-User-FullName', ''),
                reg_number=request.headers.get('X-User-RegNumber', ''),
                department=request.headers.get('X-User-Department', '')
            )
            return (user, None)
        except ValueError:
            return None
