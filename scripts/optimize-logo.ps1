# Keep the original circular logo intact. Do not crop, flood-fill, or clip.
$srcPath = (Resolve-Path "public\images\js-agro-shop-logo.png").Path
$outPath = Join-Path (Get-Location) "public\images\logo-mark.png"
Copy-Item -LiteralPath $srcPath -Destination $outPath -Force
Write-Output "copied full logo to $outPath"
