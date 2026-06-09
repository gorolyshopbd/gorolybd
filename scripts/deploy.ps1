param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost = "2.25.182.96",
    [Parameter(Mandatory=$true)]
    [string]$Password,
    [string]$RemotePath = "/opt/shopio"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host "=== Building Docker images locally ===" -ForegroundColor Green

Set-Location -LiteralPath $ProjectRoot

Write-Host "Building backend..." -ForegroundColor Cyan
docker compose build backend

Write-Host "Building frontend..." -ForegroundColor Cyan
docker compose build frontend

Write-Host "=== Saving images to tar files ===" -ForegroundColor Green
docker save shopio-backend -o shopio-backend.tar
docker save shopio-frontend -o shopio-frontend.tar

Write-Host "=== Installing sshpass via chocolatey if needed ===" -ForegroundColor Green
if (-not (Get-Command sshpass -ErrorAction SilentlyContinue)) {
    Write-Host "Installing sshpass via choco..." -ForegroundColor Yellow
    choco install sshpass -y
}

Write-Host "=== Copying project files to VPS ===" -ForegroundColor Green
sshpass -p "$Password" scp -o StrictHostKeyChecking=no `
    "$ProjectRoot\docker-compose.yml" `
    "root@${VpsHost}:${RemotePath}/"

sshpass -p "$Password" scp -o StrictHostKeyChecking=no `
    "$ProjectRoot\shopio-backend.tar" `
    "root@${VpsHost}:${RemotePath}/"

sshpass -p "$Password" scp -o StrictHostKeyChecking=no `
    "$ProjectRoot\shopio-frontend.tar" `
    "root@${VpsHost}:${RemotePath}/"

sshpass -p "$Password" scp -o StrictHostKeyChecking=no `
    -r "$ProjectRoot\nginx" `
    "root@${VpsHost}:${RemotePath}/"

sshpass -p "$Password" scp -o StrictHostKeyChecking=no `
    "$ProjectRoot\backend\.env.production" `
    "root@${VpsHost}:${RemotePath}/backend/.env.production"

Copy-Item "$ProjectRoot\frontend\.env.production" -Destination "$ProjectRoot\frontend\.env.production.tmp"
sshpass -p "$Password" scp -o StrictHostKeyChecking=no `
    -r "$ProjectRoot\scripts" `
    "root@${VpsHost}:${RemotePath}/"

Write-Host "=== Loading images and starting containers on VPS ===" -ForegroundColor Green

$remoteCommands = @"
set -e
cd $RemotePath

echo 'Loading Docker images...'
docker load -i shopio-backend.tar
docker load -i shopio-frontend.tar

echo 'Removing tar files...'
rm -f shopio-backend.tar shopio-frontend.tar

echo 'Starting all services...'
docker compose up -d

echo '=== Deployment complete! ==='
echo 'Services:'
docker compose ps
"@

sshpass -p "$Password" ssh -o StrictHostKeyChecking=no "root@${VpsHost}" "$remoteCommands"

Write-Host "=== Cleaning up local tar files ===" -ForegroundColor Green
Remove-Item "$ProjectRoot\shopio-backend.tar" -Force
Remove-Item "$ProjectRoot\shopio-frontend.tar" -Force

Write-Host "=== Deployment finished! ===" -ForegroundColor Green
Write-Host "Site: https://gorolyshop.com (or http://2.25.182.96)" -ForegroundColor Cyan
