@echo off
echo ========================================
echo   GITHUB + VERCEL DEPLOYMENT
echo ========================================
echo.

echo STEP 1: Create GitHub Repository
echo ========================================
echo.
echo Please follow these steps:
echo 1. Open your browser and go to: https://github.com/new
echo 2. Repository name: Timesheet-App
echo 3. Description: Employee Timesheet Management System
echo 4. Choose: Public
echo 5. DON'T check "Initialize with README"
echo 6. Click "Create repository"
echo.
echo Press any key after you've created the repository...
pause >nul

echo.
echo STEP 2: Push to GitHub
echo ========================================
echo.

git remote add origin https://github.com/lokeswaran22/Timesheet-App.git
git branch -M main
git push -u origin main

echo.
echo ========================================
echo   CODE PUSHED TO GITHUB!
echo ========================================
echo.

echo STEP 3: Deploy to Vercel
echo ========================================
echo.
echo Now deploying to Vercel...
echo.

where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo.
echo Logging into Vercel...
vercel login

echo.
echo Deploying to production...
vercel --prod

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your app is now live!
echo Check the URL above to access it.
echo.
echo GitHub: https://github.com/lokeswaran22/Timesheet-App
echo Vercel: Check the URL printed above
echo.
pause
