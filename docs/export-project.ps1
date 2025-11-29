# Project Export Script - Only pack necessary files
# Usage: .\export-project.ps1

Write-Host "Starting project export..." -ForegroundColor Green

# Set output filename with timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputFile = "online-export-$timestamp.zip"

# Define directories and files to exclude
$excludeDirs = @(
    "node_modules",
    ".next",
    ".git",
    "out",
    "build",
    "coverage"
)

$excludeFiles = @(
    "*.db",
    "*.db-journal",
    "*.zip",
    "*.tar.gz",
    "*.rar",
    "npm-debug.log*",
    "yarn-debug.log*",
    ".DS_Store"
)

Write-Host "Creating archive: $outputFile" -ForegroundColor Cyan
Write-Host "Excluding dirs: $($excludeDirs -join ', ')" -ForegroundColor Yellow

# Get all files, excluding unwanted ones
$filesToZip = Get-ChildItem -Path . -Recurse -File | Where-Object {
    $file = $_
    $shouldExclude = $false
    
    # Check if in excluded directory
    foreach ($dir in $excludeDirs) {
        if ($file.FullName -like "*\$dir\*") {
            $shouldExclude = $true
            break
        }
    }
    
    # Check if matches excluded file pattern
    if (-not $shouldExclude) {
        foreach ($pattern in $excludeFiles) {
            if ($file.Name -like $pattern) {
                $shouldExclude = $true
                break
            }
        }
    }
    
    -not $shouldExclude
}

# Calculate file count and total size
$fileCount = $filesToZip.Count
$totalSize = ($filesToZip | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "Will pack $fileCount files (about $([math]::Round($totalSize, 2)) MB)" -ForegroundColor Cyan

# Create temporary directory structure
$tempDir = "temp-export-$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
    # Copy files to temporary directory
    $current = 0
    foreach ($file in $filesToZip) {
        $current++
        $relativePath = $file.FullName.Substring($PWD.Path.Length + 1)
        $targetPath = Join-Path $tempDir $relativePath
        $targetDir = Split-Path $targetPath -Parent
        
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        
        Copy-Item $file.FullName -Destination $targetPath -Force
        
        # Show progress
        if ($current % 50 -eq 0 -or $current -eq $fileCount) {
            $percent = [math]::Round(($current / $fileCount) * 100)
            Write-Progress -Activity "Copying files" -Status "$percent% complete" -PercentComplete $percent
        }
    }
    
    Write-Progress -Activity "Copying files" -Completed
    
    # Create archive
    Write-Host "Compressing..." -ForegroundColor Cyan
    Compress-Archive -Path "$tempDir\*" -DestinationPath $outputFile -Force
    
    $zipSize = (Get-Item $outputFile).Length / 1MB
    
    Write-Host ""
    Write-Host "Export completed!" -ForegroundColor Green
    Write-Host "File: $outputFile" -ForegroundColor Green
    Write-Host "Size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps on new computer:" -ForegroundColor Yellow
    Write-Host "  1. Extract $outputFile" -ForegroundColor White
    Write-Host "  2. Run: npm install" -ForegroundColor White
    Write-Host "  3. Copy .env file if needed" -ForegroundColor White
    Write-Host "  4. Run: npx prisma generate" -ForegroundColor White
    Write-Host "  5. Run: npx prisma db push" -ForegroundColor White
    Write-Host "  6. Run: npm run dev" -ForegroundColor White
    
} finally {
    # Clean up temporary directory
    if (Test-Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force
    }
}
