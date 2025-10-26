@echo off
echo Fixing react-native-sqlite-storage build.gradle...

if exist "node_modules\react-native-sqlite-storage\platforms\android\build.gradle" (
    powershell -Command "(Get-Content 'node_modules\react-native-sqlite-storage\platforms\android\build.gradle') -replace 'jcenter\(\)', 'mavenCentral()' | Set-Content 'node_modules\react-native-sqlite-storage\platforms\android\build.gradle'"
    echo Fixed: replaced jcenter() with mavenCentral()
) else (
    echo File not found, skipping fix.
)