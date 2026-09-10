Add-Type -AssemblyName System.Drawing
$currentDir = Get-Location
$sourceJpg = Join-Path $currentDir "public\icon.png"

if (-not (Test-Path $sourceJpg)) {
    Write-Error "Source image not found: $sourceJpg"
    exit 1
}

$img = [System.Drawing.Image]::FromFile($sourceJpg)
$sizes = @(256, 128, 64, 48, 32, 16)

$assetsDir = Join-Path $currentDir "electron\assets"
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null
}

foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($s, $s)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $s, $s)
    $g.Dispose()

    $outPath = Join-Path $assetsDir "icon_$s.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

    if ($s -eq 256) {
        $bmp.Save((Join-Path $currentDir "public\icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save((Join-Path $currentDir "build\icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save((Join-Path $assetsDir "icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $bmp.Dispose()
}

$img.Dispose()
Write-Host "Real PNG files created successfully for all sizes!"
