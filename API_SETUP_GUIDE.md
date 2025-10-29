# 🔧 Cài đặt Unsplash API Key

## Để sử dụng hình nền thật từ Unsplash thay vì demo data:

### 1. Tạo tài khoản Unsplash Developer

1. Truy cập [Unsplash Developers](https://unsplash.com/developers)
2. Đăng ký tài khoản hoặc đăng nhập
3. Tạo một ứng dụng mới
4. Lấy **Access Key** từ dashboard

### 2. Cập nhật API Key

Mở file `src/config/env.js` và thay thế:

```javascript
// Thay thế dòng này:
WALLPAPER_API_KEY: 'unsplash_demo_key_replace_with_your_key',

// Bằng API key thật của bạn:
WALLPAPER_API_KEY: 'YOUR_ACTUAL_UNSPLASH_ACCESS_KEY',
```

### 3. Restart app

```bash
# Stop app hiện tại (Ctrl+C trong terminal)
# Sau đó restart:
npx react-native start --reset-cache
npx react-native run-android
```

### 4. Tính năng có sẵn với API key thật:

- ✅ 50+ danh mục hình nền
- ✅ Hàng triệu hình nền chất lượng cao
- ✅ Tìm kiếm nâng cao
- ✅ Thông tin tác giả chi tiết
- ✅ Thống kê lượt thích/tải
- ✅ Hình nền độ phân giải 4K+

### 5. Rate Limits:

- **Demo mode**: 50 requests/hour
- **Production**: 5000 requests/hour

### ⚠️ Lưu ý:

Không commit API key thật vào Git. Sử dụng environment variables cho production.

### 🎯 Hiện tại:

App đang chạy với **mock data** để demo tính năng. Tất cả functions hoạt động bình thường với dữ liệu giả lập.
