@echo off
echo 🚰 Starting Water Treatment Designer...

REM Check if we're in the right directory
if not exist "render.yaml" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

REM Start backend
echo 🔧 Starting backend API server...
cd backend
pip install -r requirements.txt >nul 2>&1
start "Backend API" python main.py
cd ..

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend development server...
cd frontend
npm install >nul 2>&1
start "Frontend Dev" npm run dev
cd ..

echo.
echo ✅ Water Treatment Designer is running!
echo 🌐 Frontend: http://localhost:5173
echo 🔌 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause >nul