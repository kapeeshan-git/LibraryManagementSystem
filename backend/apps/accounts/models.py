from django. contrib. auth. models import AbstractUser
from django.db import models

class Department(models.Model):
name = models.CharField(max_length=200, unique=True)
faculty = models.CharField(max_length=200, blank=True)


class Meta:
ordering = ["name"]

def str_(self):
return self. name

class User(AbstractUser) :
class Role(models.TextChoices):
ADMIN = "ADMIN"
LIBRARIAN = "LIBRARIAN"
MEMBER = "MEMBER"

class Category(models. TextChoices) :
STUDENT = "STUDENT"
ACADEMIC_PERMANENT = "ACADEMIC_PERMANENT"
ACADEMIC_TEMPORARY = "ACADEMIC_TEMPORARY"
NON_ACADEMIC = "NON_ACADEMIC"

class Status(models. TextChoices) :
ACTIVE = "ACTIVE"
SUSPENDED = "SUSPENDED"
GRADUATED = "GRADUATED"
INACTIVE = "INACTIVE"

role = models. CharField(
max_length=10, choices=Role.choices, default=Role.MEMBER
)


reg_number = models. CharField(
max_length=50, unique=True, null=True, blank=True
)

full_name = models.CharField(max_length=200)
patron_category = models.CharField(
max_length=30, choices=Category.choices, blank=True

intake_year = models.PositiveSmallIntegerField(null=True, blank=True)
department = models. ForeignKey(
Department, null=True, blank=True, on_delete=models. SET_NULL
)
status = models. CharField(
max_length=10, choices=Status.choices, default=Status. ACTIVE
)
preferred_language = models.CharField(max_length=5, default="en")
created_at = models.DateTimeField(auto_now_add=True)

@property
def is_staff_role(self):
return self.role in (self. Role. LIBRARIAN, self.Role.ADMIN)

def _str_(self):
return f"{self.username} ({self.full_name})"

)

STAFF = (User. Role. LIBRARIAN, User. Role. ADMIN)
ADMIN = (User.Role.ADMIN,)