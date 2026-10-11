# Institutional Repository Service

The Repository Service handles digital assets, e-books, and academic research papers. It runs on **Port 8002** and uses the lms_repository MySQL database.

## Core Responsibilities

1. **Digital Submissions:** Allows Lecturers and Academic Staff to submit research papers and theses.
2. **Review Workflow:** Librarians can review, request edits, or approve submissions for public access.
3. **Service Layer Pattern:** Heavy business logic (like handling state transitions and auditing) is abstracted out of the iews.py into a dedicated ResearchPaperService.
4. **Secure File Serving:** Protects sensitive campus-only documents by validating Gateway authorization headers before streaming PDF files via FileResponse.

## Running the Service
`ash
# Start the API server
python manage.py runserver 8002

# Start the Django-Q background worker (in a separate terminal)
python manage.py qcluster
`
