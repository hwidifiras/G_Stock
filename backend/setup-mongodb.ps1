# MongoDB Setup Script for Windows
# Run this script in PowerShell as Administrator

# Check if MongoDB is running
Write-Host "Checking MongoDB service..." -ForegroundColor Green
Get-Service -Name MongoDB -ErrorAction SilentlyContinue

# Start MongoDB service if not running
Write-Host "Starting MongoDB service..." -ForegroundColor Green
net start MongoDB

# Check if mongosh is available
Write-Host "Checking MongoDB Shell..." -ForegroundColor Green
mongosh --version

# If mongosh is not available, install it:
# 1. Download from: https://www.mongodb.com/try/download/shell
# 2. Extract and add to PATH
# 3. Or use MongoDB Compass GUI instead

Write-Host "MongoDB setup complete!" -ForegroundColor Green
Write-Host "Use MongoDB Compass or mongosh to connect to: mongodb://localhost:27017" -ForegroundColor Yellow
