# ZenHub - React Native App

## Installation & Setup

### Bước 1: Clone repository

```bash
git clone https://github.com/nguyenkhoa882k-tech/ZenHub.git
cd ZenHub
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Fix lỗi react-native-sqlite-storage (BẮT BUỘC)

Do package `react-native-sqlite-storage` sử dụng repository `jcenter()` đã deprecated, cần fix như sau:

**Windows PowerShell:**

```powershell
(Get-Content 'node_modules\react-native-sqlite-storage\platforms\android\build.gradle') -replace 'jcenter\(\)', 'mavenCentral()' | Set-Content 'node_modules\react-native-sqlite-storage\platforms\android\build.gradle'
```

**macOS/Linux:**

```bash
sed -i.bak 's/jcenter()/mavenCentral()/g' node_modules/react-native-sqlite-storage/platforms/android/build.gradle
```

### Bước 4: Chạy ứng dụng

```bash
# Android
npm run android

# iOS (chỉ trên macOS)
npm run ios
```

## Lưu ý quan trọng

- **Phải chạy lệnh fix ở Bước 3 mỗi khi `npm install` hoặc `yarn install`**
- Lỗi này xảy ra do package `react-native-sqlite-storage` chưa được cập nhật để sử dụng `mavenCentral()` thay vì `jcenter()`
- JCenter repository đã bị shutdown nên không thể tải dependencies

## Build cho Production

### Android

```bash
cd android
./gradlew assembleRelease
```

### iOS

```bash
cd ios
xcodebuild -workspace ZenHub.xcworkspace -scheme ZenHub archive
```

## Troubleshooting

### Lỗi "Could not find method jcenter()"

Chạy lại lệnh fix ở Bước 3 của phần Installation.

### Clean build

```bash
# Android
cd android && ./gradlew clean && cd ..

# iOS
cd ios && xcodebuild clean && cd ..

# React Native
npx react-native start --reset-cache
```
