# Library Service

The Library Service handles all human-centric library operations and runs on **Port 8003**. It utilizes the lms_library MySQL database.

## Core Responsibilities

1. **Authentication & Users:** Manages Patrons, Staff, and System Administrators. Generates the JWTs containing user roles and department information.
2. **Circulation Engine:** Handles issuing, renewing, and returning physical books. Implements complex circulation rules (grace periods, maximum checkouts, fine calculations).
3. **Dynamic Custom Fields:** Powers the Google Forms-style metadata engine, allowing administrators to define custom JSON properties for users and books.
4. **Asynchronous Messaging:** Utilizes django-q2 to dispatch background tasks (The Outbox Pattern). Instead of hanging on slow HTTP requests to the Catalog service when a book is checked out, events are queued and processed asynchronously.

## Running the Service
`ash
# Start the API server
python manage.py runserver 8003

# Start the Django-Q background worker (in a separate terminal)
python manage.py qcluster
`
