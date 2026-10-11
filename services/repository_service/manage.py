import os
import sys
import django.db.backends.base.base
django.db.backends.base.base.BaseDatabaseWrapper.check_database_version_supported = lambda self: None

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'repository_core.settings')
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()

