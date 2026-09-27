import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ulms_core.settings')
django.setup()

from apps.authentication.models import User, Department
from apps.catalog.models import Category, Author, Book, BookCopy
from apps.repository.models import ResearchPaper

def seed():
    print("[*] Seeding University of Vavuniya Library data...")

    # 1. Departments
    dept_ps, _ = Department.objects.get_or_create(
        name="Department of Physical Science",
        defaults={'faculty': 'Faculty of Applied Science'}
    )
    dept_bs, _ = Department.objects.get_or_create(
        name="Department of Bio-Science",
        defaults={'faculty': 'Faculty of Applied Science'}
    )
    dept_mgt, _ = Department.objects.get_or_create(
        name="Department of Management Studies",
        defaults={'faculty': 'Faculty of Business Studies'}
    )
    print("[+] Departments created")

    # 2. Users
    # Admin
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@vau.ac.lk',
            password='Admin@123',
            reg_number='ADMIN/001',
            first_name='System',
            last_name='Administrator',
            role=User.Role.ADMIN,
            department=dept_ps
        )
        print("[+] Admin user created (admin / Admin@123)")

    # Librarian
    if not User.objects.filter(username='librarian').exists():
        lib = User.objects.create_user(
            username='librarian',
            email='librarian@vau.ac.lk',
            password='Librarian@123',
            reg_number='LIB/001',
            first_name='Head',
            last_name='Librarian',
            role=User.Role.LIBRARIAN,
            department=dept_ps
        )
        print("[+] Librarian user created (librarian / Librarian@123)")

    # Lecturer
    if not User.objects.filter(username='lecturer').exists():
        lec = User.objects.create_user(
            username='lecturer',
            email='lecturer@vau.ac.lk',
            password='Lecturer@123',
            reg_number='EMP/2026/01',
            first_name='Dr. Kanapathipillai',
            last_name='Sivasoruby',
            role=User.Role.LECTURER,
            department=dept_ps
        )
        print("[+] Lecturer user created (lecturer / Lecturer@123)")

    # Students (Group 12 Members)
    students_data = [
        ('2022/ICT/125', 'V.', 'Kapeeshan', 'kapeeshan@vau.ac.lk'),
        ('2022/ICT/47', 'P. K. A.', 'Harshajith', 'harshajith@vau.ac.lk'),
        ('2022/ICT/89', 'G. Y.', 'Sharindi', 'sharindi@vau.ac.lk'),
        ('2022/ICT/101', 'M. M. A.', 'Amazir', 'amazir@vau.ac.lk'),
        ('2022/ICT/112', 'A.', 'Nivetha', 'nivetha@vau.ac.lk'),
        ('2022/ICT/122', 'R.', 'Thushani', 'thushani@vau.ac.lk'),
    ]

    for reg_no, f_name, l_name, email in students_data:
        if not User.objects.filter(reg_number=reg_no).exists():
            User.objects.create_user(
                username=reg_no,
                reg_number=reg_no,
                first_name=f_name,
                last_name=l_name,
                email=email,
                password='Password@123',
                role=User.Role.STUDENT,
                department=dept_ps
            )
    print("[+] Group 12 student accounts created (Password: Password@123)")

    # 3. Categories
    cat_cs, _ = Category.objects.get_or_create(
        name="Computer Science & IT",
        defaults={'code': 'DDC 004', 'description': 'Computing, Software Engineering, and AI'}
    )
    cat_math, _ = Category.objects.get_or_create(
        name="Mathematics & Statistics",
        defaults={'code': 'DDC 510', 'description': 'Pure and Applied Mathematics'}
    )
    cat_phys, _ = Category.objects.get_or_create(
        name="Physics & Applied Sciences",
        defaults={'code': 'DDC 530', 'description': 'Physical sciences and instrumentation'}
    )

    # 4. Authors
    auth_tanenbaum, _ = Author.objects.get_or_create(name="Andrew S. Tanenbaum")
    auth_silber, _ = Author.objects.get_or_create(name="Abraham Silberschatz")
    auth_russell, _ = Author.objects.get_or_create(name="Stuart Russell")

    # 5. Books & Copies
    book1, created = Book.objects.get_or_create(
        isbn="978-0133591620",
        defaults={
            'title': 'Modern Operating Systems (4th Edition)',
            'category': cat_cs,
            'publisher': 'Pearson',
            'publication_year': 2014,
            'shelf_location': 'Rack CS-02, Shelf 1',
            'description': 'Comprehensive foundation of operating system concepts and architecture.'
        }
    )
    if created:
        book1.authors.add(auth_tanenbaum)
        BookCopy.objects.create(book=book1, accession_number="BC-MOS-001", status=BookCopy.Status.AVAILABLE)
        BookCopy.objects.create(book=book1, accession_number="BC-MOS-002", status=BookCopy.Status.AVAILABLE)

    book2, created = Book.objects.get_or_create(
        isbn="978-0078022159",
        defaults={
            'title': 'Database System Concepts (7th Edition)',
            'category': cat_cs,
            'publisher': 'McGraw-Hill',
            'publication_year': 2019,
            'shelf_location': 'Rack CS-04, Shelf 3',
            'description': 'Fundamental database design, relational models, and query processing.'
        }
    )
    if created:
        book2.authors.add(auth_silber)
        BookCopy.objects.create(book=book2, accession_number="BC-DBS-001", status=BookCopy.Status.AVAILABLE)
        BookCopy.objects.create(book=book2, accession_number="BC-DBS-002", status=BookCopy.Status.AVAILABLE)

    book3, created = Book.objects.get_or_create(
        isbn="978-0134610993",
        defaults={
            'title': 'Artificial Intelligence: A Modern Approach (4th Edition)',
            'category': cat_cs,
            'publisher': 'Pearson',
            'publication_year': 2020,
            'shelf_location': 'Rack AI-01, Shelf 2',
            'description': 'The standard textbook in artificial intelligence.'
        }
    )
    if created:
        book3.authors.add(auth_russell)
        BookCopy.objects.create(book=book3, accession_number="BC-AIM-001", status=BookCopy.Status.AVAILABLE)

    print("[+] Catalog books and physical copies seeded")
    print("[SUCCESS] Database setup and seed completed successfully!")

if __name__ == '__main__':
    seed()
