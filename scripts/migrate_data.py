"""
Data Migration Script: Monolith -> Microservices
Exports data from the monolith SQLite database and imports into each service's database.
Run from the LMS root directory: python scripts/migrate_data.py
"""
import sqlite3
import os
import sys

# Paths
LMS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MONOLITH_DB = os.path.join(LMS_ROOT, 'backend', 'db.sqlite3')
CATALOG_DB = os.path.join(LMS_ROOT, 'services', 'catalog_service', 'catalog_db.sqlite3')
LIBRARY_DB = os.path.join(LMS_ROOT, 'services', 'library_service', 'library_db.sqlite3')
REPOSITORY_DB = os.path.join(LMS_ROOT, 'services', 'repository_service', 'repository_db.sqlite3')


def get_connection(db_path):
    if not os.path.exists(db_path):
        print(f"  ERROR: Database not found: {db_path}")
        return None
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def migrate_catalog():
    """Migrate catalog data: categories, authors, books, book-author M2M, and copies."""
    print("\n=== Migrating CATALOG data ===")
    src = get_connection(MONOLITH_DB)
    dst = get_connection(CATALOG_DB)
    if not src or not dst:
        return

    try:
        # Categories
        rows = src.execute("SELECT * FROM catalog_category").fetchall()
        for r in rows:
            dst.execute(
                "INSERT OR IGNORE INTO catalog_category (id, name, code, description) VALUES (?, ?, ?, ?)",
                (r['id'], r['name'], r['code'], r['description'])
            )
        print(f"  Categories: {len(rows)}")

        # Authors
        rows = src.execute("SELECT * FROM catalog_author").fetchall()
        for r in rows:
            dst.execute(
                "INSERT OR IGNORE INTO catalog_author (id, name, biography) VALUES (?, ?, ?)",
                (r['id'], r['name'], r['biography'])
            )
        print(f"  Authors: {len(rows)}")

        # Books
        rows = src.execute("SELECT * FROM catalog_book").fetchall()
        for r in rows:
            dst.execute("""
                INSERT OR IGNORE INTO catalog_book 
                (id, title, isbn, category_id, publisher, publication_year, edition,
                 shelf_location, call_number, description, cover_image,
                 search_count, borrow_count, hold_count, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (r['id'], r['title'], r['isbn'], r['category_id'], r['publisher'],
                  r['publication_year'], r['edition'], r['shelf_location'], r['call_number'],
                  r['description'], r['cover_image'], r['search_count'], r['borrow_count'],
                  r['hold_count'], r['created_at'], r['updated_at']))
        print(f"  Books: {len(rows)}")

        # Book-Author M2M
        rows = src.execute("SELECT * FROM catalog_book_authors").fetchall()
        for r in rows:
            dst.execute(
                "INSERT OR IGNORE INTO catalog_book_authors (id, book_id, author_id) VALUES (?, ?, ?)",
                (r['id'], r['book_id'], r['author_id'])
            )
        print(f"  Book-Author links: {len(rows)}")

        # BookCopy
        rows = src.execute("SELECT * FROM catalog_bookcopy").fetchall()
        for r in rows:
            dst.execute("""
                INSERT OR IGNORE INTO catalog_bookcopy
                (id, book_id, accession_number, item_type, status, condition, acquisition_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (r['id'], r['book_id'], r['accession_number'], r['item_type'],
                  r['status'], r['condition'], r['acquisition_date'], r['notes']))
        print(f"  BookCopies: {len(rows)}")

        dst.commit()
        print("  Catalog migration COMPLETE!")

    finally:
        src.close()
        dst.close()


def migrate_library():
    """Migrate library data: departments, users, borrow records, circulation rules,
    reservations, fines, payment receipts, notifications."""
    print("\n=== Migrating LIBRARY FUNCTIONS data ===")
    src = get_connection(MONOLITH_DB)
    dst = get_connection(LIBRARY_DB)
    if not src or not dst:
        return

    try:
        # Departments
        rows = src.execute("SELECT * FROM authentication_department").fetchall()
        for r in rows:
            dst.execute(
                "INSERT OR IGNORE INTO authentication_department (id, name, faculty, created_at) VALUES (?, ?, ?, ?)",
                (r['id'], r['name'], r['faculty'], r['created_at'])
            )
        print(f"  Departments: {len(rows)}")

        # Users (custom user model)
        rows = src.execute("SELECT * FROM authentication_user").fetchall()
        cols = [desc[0] for desc in src.execute("SELECT * FROM authentication_user LIMIT 1").description]
        for r in rows:
            # Build columns for the library service user table
            dst.execute(f"""
                INSERT OR IGNORE INTO authentication_user 
                ({', '.join(cols)})
                VALUES ({', '.join(['?' for _ in cols])})
            """, tuple(r[c] for c in cols))
        print(f"  Users: {len(rows)}")

        # BorrowRecords - need to denormalize book info
        rows = src.execute("""
            SELECT br.*, bc.accession_number, bc.item_type, bc.id as copy_id,
                   b.id as bid, b.title as btitle, b.isbn as bisbn
            FROM circulation_borrowrecord br
            JOIN catalog_bookcopy bc ON br.book_copy_id = bc.id
            JOIN catalog_book b ON bc.book_id = b.id
        """).fetchall()
        for r in rows:
            dst.execute("""
                INSERT OR IGNORE INTO circulation_borrowrecord
                (id, user_id, book_copy_id, accession_number, book_id, book_title, book_isbn,
                 item_type, issued_by_id, issue_date, due_date, return_date,
                 renewal_count, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (r['id'], r['user_id'], r['copy_id'], r['accession_number'],
                  r['bid'], r['btitle'], r['bisbn'], r['item_type'],
                  r['issued_by_id'], r['issue_date'], r['due_date'], r['return_date'],
                  r['renewal_count'], r['status'], r['notes']))
        print(f"  BorrowRecords: {len(rows)}")

        # CirculationRules
        try:
            rows = src.execute("SELECT * FROM circulation_circulationrule").fetchall()
            cols = [desc[0] for desc in src.execute("SELECT * FROM circulation_circulationrule LIMIT 1").description]
            for r in rows:
                dst.execute(f"""
                    INSERT OR IGNORE INTO circulation_circulationrule
                    ({', '.join(cols)}) VALUES ({', '.join(['?' for _ in cols])})
                """, tuple(r[c] for c in cols))
            print(f"  CirculationRules: {len(rows)}")
        except Exception as e:
            print(f"  CirculationRules: skipped ({e})")

        # Reservations - denormalize book info
        try:
            rows = src.execute("""
                SELECT r.*, b.title as btitle, b.isbn as bisbn,
                       bc.accession_number as copy_accession
                FROM reservations_reservation r
                JOIN catalog_book b ON r.book_id = b.id
                LEFT JOIN catalog_bookcopy bc ON r.allocated_copy_id = bc.id
            """).fetchall()
            for r in rows:
                dst.execute("""
                    INSERT OR IGNORE INTO reservations_reservation
                    (id, user_id, book_id, book_title, book_isbn,
                     allocated_copy_id, allocated_copy_accession,
                     queue_position, status, reserved_at, hold_expires_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (r['id'], r['user_id'], r['book_id'], r['btitle'], r['bisbn'],
                      r['allocated_copy_id'], r['copy_accession'] or '',
                      r['queue_position'], r['status'], r['reserved_at'], r['hold_expires_at']))
            print(f"  Reservations: {len(rows)}")
        except Exception as e:
            print(f"  Reservations: skipped ({e})")

        # Fines
        try:
            rows = src.execute("SELECT * FROM fines_fine").fetchall()
            cols = [desc[0] for desc in src.execute("SELECT * FROM fines_fine LIMIT 1").description]
            for r in rows:
                dst.execute(f"""
                    INSERT OR IGNORE INTO fines_fine
                    ({', '.join(cols)}) VALUES ({', '.join(['?' for _ in cols])})
                """, tuple(r[c] for c in cols))
            print(f"  Fines: {len(rows)}")
        except Exception as e:
            print(f"  Fines: skipped ({e})")

        # PaymentReceipts
        try:
            rows = src.execute("SELECT * FROM fines_paymentreceipt").fetchall()
            cols = [desc[0] for desc in src.execute("SELECT * FROM fines_paymentreceipt LIMIT 1").description]
            for r in rows:
                dst.execute(f"""
                    INSERT OR IGNORE INTO fines_paymentreceipt
                    ({', '.join(cols)}) VALUES ({', '.join(['?' for _ in cols])})
                """, tuple(r[c] for c in cols))
            print(f"  PaymentReceipts: {len(rows)}")
        except Exception as e:
            print(f"  PaymentReceipts: skipped ({e})")

        # Notifications
        try:
            rows = src.execute("SELECT * FROM notifications_notification").fetchall()
            cols = [desc[0] for desc in src.execute("SELECT * FROM notifications_notification LIMIT 1").description]
            for r in rows:
                dst.execute(f"""
                    INSERT OR IGNORE INTO notifications_notification
                    ({', '.join(cols)}) VALUES ({', '.join(['?' for _ in cols])})
                """, tuple(r[c] for c in cols))
            print(f"  Notifications: {len(rows)}")
        except Exception as e:
            print(f"  Notifications: skipped ({e})")

        dst.commit()
        print("  Library Functions migration COMPLETE!")

    finally:
        src.close()
        dst.close()


def migrate_repository():
    """Migrate repository data: research papers with denormalized user info."""
    print("\n=== Migrating REPOSITORY data ===")
    src = get_connection(MONOLITH_DB)
    dst = get_connection(REPOSITORY_DB)
    if not src or not dst:
        return

    try:
        rows = src.execute("""
            SELECT rp.*, 
                   u.id as uid, u.first_name, u.last_name, u.username, u.reg_number as ureg,
                   d.name as dept_name,
                   rv.first_name as rv_fname, rv.last_name as rv_lname
            FROM repository_researchpaper rp
            JOIN authentication_user u ON rp.lecturer_id = u.id
            LEFT JOIN authentication_department d ON u.department_id = d.id
            LEFT JOIN authentication_user rv ON rp.reviewed_by_id = rv.id
        """).fetchall()
        for r in rows:
            lecturer_name = f"{r['first_name']} {r['last_name']}".strip() or r['username']
            reviewed_by_name = ''
            if r['rv_fname'] or r['rv_lname']:
                reviewed_by_name = f"{r['rv_fname'] or ''} {r['rv_lname'] or ''}".strip()

            dst.execute("""
                INSERT OR IGNORE INTO repository_researchpaper
                (id, lecturer_id, lecturer_name, lecturer_reg_number, lecturer_department,
                 title, authors_display, abstract, keywords, doi,
                 journal_or_conference, publication_date, file, access_type,
                 status, reviewed_by_id, reviewed_by_name, review_comments,
                 download_count, submitted_at, reviewed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (r['id'], r['uid'], lecturer_name, r['ureg'], r['dept_name'] or '',
                  r['title'], r['authors_display'], r['abstract'], r['keywords'], r['doi'],
                  r['journal_or_conference'], r['publication_date'], r['file'], r['access_type'],
                  r['status'], r['reviewed_by_id'], reviewed_by_name, r['review_comments'],
                  r['download_count'], r['submitted_at'], r['reviewed_at']))
        print(f"  ResearchPapers: {len(rows)}")

        dst.commit()
        print("  Repository migration COMPLETE!")

    except Exception as e:
        print(f"  Repository migration error: {e}")

    finally:
        src.close()
        dst.close()


if __name__ == '__main__':
    print("=" * 60)
    print("UoV Library Management System - Data Migration")
    print("Monolith -> Microservices")
    print("=" * 60)

    if not os.path.exists(MONOLITH_DB):
        print(f"\nERROR: Monolith database not found at {MONOLITH_DB}")
        sys.exit(1)

    migrate_catalog()
    migrate_library()
    migrate_repository()

    print("\n" + "=" * 60)
    print("Data migration complete!")
    print("=" * 60)
