# Wallpaper Feature

Chức năng hình nền đẹp với Unsplash API integration.

## Chức năng chính

### 🔍 Khám phá

- Duyệt hình nền theo danh mục
- Tìm kiếm hình nền
- Infinite scroll loading
- Pull to refresh

### ❤️ Yêu thích

- Thêm/xóa hình nền yêu thích
- Lưu trữ local với AsyncStorage
- Xem danh sách yêu thích

### 📱 Chi tiết & Tương tác

- Xem thông tin tác giả
- Thống kê lượt tải/thích
- Chia sẻ hình nền
- Tải hình nền về máy
- Xem ảnh full screen

## Kiến trúc

### Services

- `wallpaperService.js`: Tích hợp Unsplash API, quản lý cache và favorites

### Components

- `WallpaperScreen.jsx`: Main screen với tabs và navigation
- `WallpaperCard.jsx`: Grid item component
- `CategorySelector.jsx`: Category filter
- `SearchBar.jsx`: Search input
- `WallpaperDetailModal.jsx`: Fullscreen modal với actions

### APIs

- **Unsplash API**: Free 50 requests/hour
- **Categories**: Nature, Architecture, Technology, Animals, etc.
- **Search**: Full text search với pagination
- **Photo details**: High resolution URLs, author info, stats

## Localization

Toàn bộ UI đã được Việt hóa:

- "Hình Nền Đẹp"
- "Khám Phá" / "Yêu Thích"
- "Tìm kiếm hình nền..."
- Error messages và notifications

## Dependencies

```json
{
  "react-native-share": "^10.x.x",
  "react-native-file-access": "^3.x.x",
  "react-native-image-crop-picker": "^0.40.x"
}
```

## API Configuration

```javascript
// src/config/env.js
WALLPAPER_API_KEY: 'YOUR_UNSPLASH_ACCESS_KEY',
WALLPAPER_API_URL: 'https://api.unsplash.com'
```

## Sử dụng

1. Mở tab "Hình Nền Đẹp"
2. Chọn danh mục hoặc tìm kiếm
3. Nhấn vào hình để xem chi tiết
4. Sử dụng các nút: Yêu thích, Chia sẻ, Tải về
5. Chuyển sang tab "Yêu thích" để xem collection

## Performance

- Image caching với React Native Image
- Lazy loading với FlatList
- Debounced search
- Offline favorites storage
- Optimized re-renders với useCallback
