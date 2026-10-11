# Catalog Service

The Catalog Service manages the library's physical inventory and Bibliographic records (OPAC). It runs on **Port 8001** and uses the lms_catalog MySQL database.

## Core Responsibilities

1. **Bibliographic Metadata:** Manages Books, Authors, and Categories.
2. **Physical Holdings:** Tracks individual physical copies using unique accession barcodes.
3. **Query Optimization:** Utilizes advanced Django ORM caching (prefetch_related and in-memory length checks) to eliminate N+1 query bugs, ensuring the public OPAC loads instantaneously even with thousands of records.
4. **Stateless Authorization:** Uses the MicroserviceHeaderAuthentication class from shared_core to read X-User-* headers injected by the API Gateway to authorize librarian actions.

## Running the Service
`ash
python manage.py runserver 8001
`
