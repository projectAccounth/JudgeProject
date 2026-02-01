Get-ChildItem -Directory | ForEach-Object {
    $dockerfile = Join-Path $_.FullName "Dockerfile"

    if (Test-Path $dockerfile) {
        Write-Host "Building Docker image for $($_.Name)..."
        Push-Location $_.FullName
        docker build -t $_.Name .
        Pop-Location
    } else {
        Write-Host "Skipping $($_.Name) (no Dockerfile found)"
    }
}
