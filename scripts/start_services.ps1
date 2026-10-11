# UoV Library Management System - Microservices Startup Script
# Usage: .\start_services.ps1
# Starts all 4 services + the frontend dev server

$LMS_ROOT = Split-Path -Parent $PSScriptRoot
if (-not $LMS_ROOT) { $LMS_ROOT = "c:\Users\kapee\Documents\LMS" }

$VENV_PYTHON = "$LMS_ROOT\.venv\Scripts\python"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " UoV LMS - Microservice Architecture" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Start Catalog Service (Port 8001)
Write-Host "[1/5] Starting Catalog Service on port 8001..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath $VENV_PYTHON -ArgumentList "manage.py runserver 8001" -WorkingDirectory "$LMS_ROOT\services\catalog_service" -RedirectStandardOutput "$LMS_ROOT\logs\catalog.log" -RedirectStandardError "$LMS_ROOT\logs\catalog_err.log"

# Start Repository Service (Port 8002)
Write-Host "[2/5] Starting Repository Service on port 8002..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath $VENV_PYTHON -ArgumentList "manage.py runserver 8002" -WorkingDirectory "$LMS_ROOT\services\repository_service" -RedirectStandardOutput "$LMS_ROOT\logs\repository.log" -RedirectStandardError "$LMS_ROOT\logs\repository_err.log"

# Start Library Functions Service (Port 8003)
Write-Host "[3/5] Starting Library Functions Service on port 8003..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath $VENV_PYTHON -ArgumentList "manage.py runserver 8003" -WorkingDirectory "$LMS_ROOT\services\library_service" -RedirectStandardOutput "$LMS_ROOT\logs\library.log" -RedirectStandardError "$LMS_ROOT\logs\library_err.log"

# Start API Gateway (Port 8000)
Write-Host "[4/5] Starting API Gateway on port 8000..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath $VENV_PYTHON -ArgumentList "manage.py runserver 8000" -WorkingDirectory "$LMS_ROOT\gateway" -RedirectStandardOutput "$LMS_ROOT\logs\gateway.log" -RedirectStandardError "$LMS_ROOT\logs\gateway_err.log"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " All backend services started!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Gateway:    http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  Catalog:    http://127.0.0.1:8001" -ForegroundColor White
Write-Host "  Repository: http://127.0.0.1:8002" -ForegroundColor White
Write-Host "  Library:    http://127.0.0.1:8003" -ForegroundColor White
Write-Host ""
