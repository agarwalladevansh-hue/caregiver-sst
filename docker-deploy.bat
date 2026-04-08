@echo off

REM CareMatch RL - Docker Build and Deployment Script for Windows

setlocal enabledelayedexpansion

REM Color codes
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Check Docker installation
echo %BLUE%================================%NC%
echo %BLUE%Checking Docker Installation%NC%
echo %BLUE%================================%NC%

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%ERROR: Docker is not installed%NC%
    echo Please install Docker from: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%ERROR: Docker Compose is not installed%NC%
    echo Please install Docker Compose from: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo %GREEN%✓ Docker is installed%NC%
docker --version
docker-compose --version

REM Show menu
:menu
echo.
echo CareMatch RL - Docker Management
echo ================================
echo 1) Full Setup ^(Build + Run^)
echo 2) Build Images Only
echo 3) Start Services
echo 4) Stop Services
echo 5) View Logs
echo 6) Rebuild from Scratch
echo 7) Exit
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto full_setup
if "%choice%"=="2" goto build_images
if "%choice%"=="3" goto start_services
if "%choice%"=="4" goto stop_services
if "%choice%"=="5" goto view_logs
if "%choice%"=="6" goto rebuild
if "%choice%"=="7" goto exit_script
goto menu

:full_setup
echo %BLUE%================================%NC%
echo %BLUE%Starting Full Setup%NC%
echo %BLUE%================================%NC%
if exist carematch_ppo.zip (
    echo %GREEN%✓ Found trained model: carematch_ppo.zip%NC%
) else (
    echo %YELLOW%⚠ Model file not found. Backend will use fallback heuristic.%NC%
)
echo.
goto build_images

:build_images
echo %BLUE%================================%NC%
echo %BLUE%Building Docker Images%NC%
echo %BLUE%================================%NC%
echo Building backend image...
docker build -t carematch-backend:latest ./backend
echo %GREEN%✓ Backend image built%NC%
echo.
echo Building frontend image...
docker build -t carematch-frontend:latest ./frontend
echo %GREEN%✓ Frontend image built%NC%
echo.
goto start_services

:start_services
echo %BLUE%================================%NC%
echo %BLUE%Starting Services%NC%
echo %BLUE%================================%NC%
echo Using docker-compose to start all services...
docker-compose up -d
echo.
echo Waiting for services to be healthy...
timeout /t 5 /nobreak
echo.
docker-compose ps
echo %GREEN%✓ Services started successfully!%NC%
echo.
echo %GREEN%Access Your Application:%NC%
echo   Frontend:  http://localhost
echo   Backend:   http://localhost/api
echo.
echo %GREEN%Useful Commands:%NC%
echo   View logs:      docker-compose logs -f
echo   Stop services:  docker-compose down
echo   Rebuild:        docker-compose up --build
echo.
goto menu

:stop_services
echo %BLUE%================================%NC%
echo %BLUE%Stopping Services%NC%
echo %BLUE%================================%NC%
docker-compose down
echo %GREEN%✓ Services stopped%NC%
goto menu

:view_logs
docker-compose logs -f
goto menu

:rebuild
echo %BLUE%================================%NC%
echo %BLUE%Full Rebuild%NC%
echo %BLUE%================================%NC%
docker-compose down
docker system prune -f
goto build_images

:exit_script
echo %GREEN%✓ Goodbye!%NC%
exit /b 0
