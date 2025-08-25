Write-Host "🚀 Setting up One-Link Social Bio Solution..." -ForegroundColor Green
Write-Host ""

Write-Host "📦 Setting up Backend..." -ForegroundColor Yellow
Set-Location "one-link-backend"
Write-Host "Installing backend dependencies..."
npm install
Write-Host "✅ Backend dependencies installed!" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Setting up Frontend..." -ForegroundColor Yellow
Set-Location "..\one-link-frontend"
Write-Host "Installing frontend dependencies..."
npm install
Write-Host "✅ Frontend dependencies installed!" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: cd one-link-backend; npm run dev"
Write-Host "2. Start frontend: cd one-link-frontend; npm start"
Write-Host ""
Write-Host "🌐 Backend will run on: http://localhost:5000" -ForegroundColor Blue
Write-Host "🌐 Frontend will run on: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Read-Host "Press Enter to continue..."
