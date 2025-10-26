# Known Issues & Fixes

## react-native-sqlite-storage jcenter() Issue

### Problem
The `react-native-sqlite-storage` package (version 6.0.1) uses the deprecated `jcenter()` repository in its Android build configuration. Since JCenter was shut down, this causes build failures with the error:

```
Could not find method jcenter() for arguments [] on repository container
```

### Root Cause
File: `node_modules/react-native-sqlite-storage/platforms/android/build.gradle` line 4 contains:
```gradle
repositories {
    google()
    jcenter()  // This is the problem
}
```

### Fix Applied
Replace `jcenter()` with `mavenCentral()`:
```gradle
repositories {
    google()
    mavenCentral()  // Fixed
}
```

### Automation Attempts
1. **patch-package**: Failed due to Windows path length limitations
2. **postinstall script**: Created but not working reliably
3. **Manual fix**: Currently the most reliable solution

### Current Solution
Manual command after each `npm install`:

**Windows:**
```powershell
(Get-Content 'node_modules\react-native-sqlite-storage\platforms\android\build.gradle') -replace 'jcenter\(\)', 'mavenCentral()' | Set-Content 'node_modules\react-native-sqlite-storage\platforms\android\build.gradle'
```

**macOS/Linux:**
```bash
sed -i.bak 's/jcenter()/mavenCentral()/g' node_modules/react-native-sqlite-storage/platforms/android/build.gradle
```

### Alternative Solutions
1. **Upgrade to newer SQLite package**: Consider migrating to `react-native-sqlite-2` or `@op-engineering/op-sqlite`
2. **Fork and fix**: Fork the package and fix the build.gradle
3. **Wait for official fix**: Monitor for updates to `react-native-sqlite-storage`

### Files Created for Automation
- `scripts/fix-sqlite-build.js` - Node.js script (not working)
- `scripts/fix-sqlite-build.bat` - Batch script (not working) 
- `scripts/fix-sqlite-build.ps1` - PowerShell script (not working)

All scripts have issues with execution in Windows environment. Manual fix remains the most reliable approach.