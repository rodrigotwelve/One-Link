@echo off
echo 🚀 Setting up One-Link Social Bio Solution...
echo.

echo 📦 Setting up Backend...
cd one-link-backend
echo Installing backend dependencies...
call npm install
echo ✅ Backend dependencies installed!
echo.

echo 📦 Setting up Frontend...
cd ..\one-link-frontend
echo Installing frontend dependencies...
call npm install
echo ✅ Frontend dependencies installed!
echo.

echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Start backend: cd one-link-backend ^& npm run dev
echo 2. Start frontend: cd one-link-frontend ^& npm start
echo.
echo 🌐 Backend will run on: http://localhost:5000
echo 🌐 Frontend will run on: http://localhost:3000
echo.
pause
