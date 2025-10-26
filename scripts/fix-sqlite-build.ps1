Write-Host "Fixing react-native-sqlite-storage build.gradle..."

$buildGradlePath = "node_modules\react-native-sqlite-storage\platforms\android\build.gradle"

if (Test-Path $buildGradlePath) {
    $content = Get-Content $buildGradlePath
    $newContent = $content -replace 'jcenter\(\)', 'mavenCentral()'
    Set-Content $buildGradlePath $newContent
    Write-Host "Fixed: replaced jcenter() with mavenCentral()"
} else {
    Write-Host "File not found, skipping fix."
}