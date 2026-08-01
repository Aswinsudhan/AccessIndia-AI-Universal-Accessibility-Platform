@echo off
echo ====================================================
echo Pushing AccessIndia AI to GitHub Repository...
echo ====================================================

git init
git add .
git commit -m "Initial commit: AccessIndia AI Universal Accessibility & Smart Facility Discovery Platform"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Aswinsudhan/AccessIndia-AI-Universal-Accessibility-Platform.git
git push -u origin main

echo ====================================================
echo Push script finished!
echo ====================================================
pause
