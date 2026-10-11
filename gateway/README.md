# API Gateway Service

The API Gateway is the central entry point for all frontend requests. It runs on **Port 8000** and serves as a stateless reverse proxy for the downstream microservices.

## Core Responsibilities

1. **Request Proxying:** Routes incoming /api/catalog/*, /api/repository/*, and /api/* requests to the appropriate microservice running on ports 8001, 8002, and 8003.
2. **Stateless Authentication (JWT Interception):** 
   - The Gateway intercepts the HTTP Authorization: Bearer <token> header.
   - It decodes the JWT payload using the shared SECRET_KEY.
   - It strips the Authorization header and injects custom headers (X-User-Id, X-User-Role, X-User-FullName, etc.) into the proxied request.
   - This allows downstream microservices to enforce strict Role-Based Access Control (RBAC) without having access to the Library Service's User database.

## Running the Service
`ash
cd gateway
python manage.py runserver 8000
`
