Write-Host "Starting AlphaHunter Multiplayer Server..." -ForegroundColor Green
Write-Host ""

# Change to server directory
Set-Location -Path "server"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Start the server
Write-Host "Starting server on port 3001..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm start