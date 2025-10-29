import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../config/env';

// Storage keys
const STORAGE_KEYS = {
  FAVORITES: '@zenhub_wallpaper_favorites',
  CACHE: '@zenhub_wallpaper_cache',
  DOWNLOAD_HISTORY: '@zenhub_wallpaper_downloads',
};

// Unsplash API endpoints
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';
const ACCESS_KEY = env.WALLPAPER_API_KEY;

// Mock data for demo purposes (when API is not available)
const MOCK_WALLPAPERS = [
  {
    id: 'mock-1',
    urls: {
      regular:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080',
      small:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920',
    },
    user: { name: 'Demo Author', username: 'demo' },
    likes: 156,
    downloads: 2341,
    description: 'Beautiful mountain landscape',
    alt_description: 'Mountain landscape wallpaper',
    width: 1920,
    height: 1080,
    color: '#2D5A27',
  },
  {
    id: 'mock-2',
    urls: {
      regular:
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1080',
      small:
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400',
      full: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920',
    },
    user: { name: 'Nature Photographer', username: 'naturepro' },
    likes: 89,
    downloads: 1542,
    description: 'Ocean waves at sunset',
    alt_description: 'Ocean sunset wallpaper',
    width: 1920,
    height: 1080,
    color: '#FF6B35',
  },
  {
    id: 'mock-3',
    urls: {
      regular:
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080',
      small:
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
      full: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920',
    },
    user: { name: 'Forest Explorer', username: 'forestlover' },
    likes: 234,
    downloads: 3456,
    description: 'Dense forest path',
    alt_description: 'Forest path wallpaper',
    width: 1920,
    height: 1080,
    color: '#1A4A1A',
  },
  {
    id: 'mock-4',
    urls: {
      regular:
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1080',
      small:
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
      full: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920',
    },
    user: { name: 'City Photographer', username: 'citypro' },
    likes: 445,
    downloads: 5234,
    description: 'Modern city skyline',
    alt_description: 'City skyline wallpaper',
    width: 1920,
    height: 1080,
    color: '#1E3A8A',
  },
  {
    id: 'mock-5',
    urls: {
      regular:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080',
      small:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920',
    },
    user: { name: 'Space Explorer', username: 'spacelover' },
    likes: 678,
    downloads: 8901,
    description: 'Starry night sky',
    alt_description: 'Space wallpaper',
    width: 1920,
    height: 1080,
    color: '#000051',
  },
  {
    id: 'mock-6',
    urls: {
      regular:
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080',
      small:
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
      full: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920',
    },
    user: { name: 'Lake Photographer', username: 'lakepro' },
    likes: 123,
    downloads: 1876,
    description: 'Peaceful lake reflection',
    alt_description: 'Lake reflection wallpaper',
    width: 1920,
    height: 1080,
    color: '#4A90E2',
  },
];

// Check if we should use mock data
const USE_MOCK_DATA =
  !ACCESS_KEY || ACCESS_KEY === 'unsplash_demo_key_replace_with_your_key';

// Categories for wallpapers
export const WALLPAPER_CATEGORIES = [
  { id: 'featured', name: 'Nổi Bật', query: 'featured' },
  { id: 'nature', name: 'Thiên Nhiên', query: 'nature' },
  { id: 'landscape', name: 'Phong Cảnh', query: 'landscape' },
  { id: 'city', name: 'Thành Phố', query: 'city' },
  { id: 'abstract', name: 'Trừu Tượng', query: 'abstract' },
  { id: 'minimal', name: 'Tối Giản', query: 'minimal' },
  { id: 'dark', name: 'Tối', query: 'dark' },
  { id: 'colorful', name: 'Đầy Màu Sắc', query: 'colorful' },
  { id: 'ocean', name: 'Đại Dương', query: 'ocean' },
  { id: 'mountains', name: 'Núi Non', query: 'mountains' },
];

// Fetch wallpapers from Unsplash or mock data
export const fetchWallpapers = async (
  category = 'featured',
  page = 1,
  perPage = 30,
) => {
  try {
    // Use mock data if API key is not configured
    if (USE_MOCK_DATA) {
      console.log('Using mock data for wallpapers');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter mock data based on category (simple simulation)
      let filteredData = MOCK_WALLPAPERS;
      if (category === 'nature') {
        filteredData = MOCK_WALLPAPERS.filter(
          w =>
            w.description.includes('mountain') ||
            w.description.includes('forest') ||
            w.description.includes('lake'),
        );
      } else if (category === 'city') {
        filteredData = MOCK_WALLPAPERS.filter(w =>
          w.description.includes('city'),
        );
      } else if (category === 'ocean') {
        filteredData = MOCK_WALLPAPERS.filter(w =>
          w.description.includes('Ocean'),
        );
      }

      // Paginate mock data
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return paginatedData.map(photo => ({
        id: photo.id,
        title: photo.description || photo.alt_description || 'Untitled',
        author: photo.user.name,
        authorProfile: `https://unsplash.com/@${photo.user.username}`,
        urls: {
          thumb: photo.urls.small,
          small: photo.urls.small,
          regular: photo.urls.regular,
          full: photo.urls.full,
          raw: photo.urls.full,
        },
        downloadUrl: photo.urls.full,
        width: photo.width,
        height: photo.height,
        likes: photo.likes,
        downloads: photo.downloads,
        color: photo.color,
        createdAt: new Date().toISOString(),
      }));
    }

    // Real API call
    let url;

    if (category === 'featured') {
      // Get curated photos
      url = `${UNSPLASH_BASE_URL}/photos?page=${page}&per_page=${perPage}&order_by=popular`;
    } else {
      // Search by category
      url = `${UNSPLASH_BASE_URL}/search/photos?query=${category}&page=${page}&per_page=${perPage}&order_by=relevant`;
    }

    console.log('Fetching wallpapers from:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle different response formats
    const photos = category === 'featured' ? data : data.results;

    return photos.map(photo => ({
      id: photo.id,
      title: photo.description || photo.alt_description || 'Untitled',
      author: photo.user.name,
      authorProfile: photo.user.links.html,
      urls: {
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        regular: photo.urls.regular,
        full: photo.urls.full,
        raw: photo.urls.raw,
      },
      downloadUrl: photo.links.download,
      width: photo.width,
      height: photo.height,
      likes: photo.likes,
      downloads: photo.downloads || 0,
      color: photo.color,
      createdAt: photo.created_at,
    }));
  } catch (error) {
    console.error('Error fetching wallpapers:', error);
    throw error;
  }
};

// Search wallpapers
export const searchWallpapers = async (query, page = 1, perPage = 30) => {
  try {
    // Use mock data if API key is not configured
    if (USE_MOCK_DATA) {
      console.log('Using mock data for search:', query);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simple search filter on mock data
      const searchResults = MOCK_WALLPAPERS.filter(
        wallpaper =>
          wallpaper.description.toLowerCase().includes(query.toLowerCase()) ||
          wallpaper.alt_description
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          wallpaper.user.name.toLowerCase().includes(query.toLowerCase()),
      );

      return {
        results: searchResults.map(photo => ({
          id: photo.id,
          title: photo.description || photo.alt_description || 'Untitled',
          author: photo.user.name,
          authorProfile: `https://unsplash.com/@${photo.user.username}`,
          urls: {
            thumb: photo.urls.small,
            small: photo.urls.small,
            regular: photo.urls.regular,
            full: photo.urls.full,
            raw: photo.urls.full,
          },
          downloadUrl: photo.urls.full,
          width: photo.width,
          height: photo.height,
          likes: photo.likes,
          downloads: photo.downloads,
          color: photo.color,
          createdAt: new Date().toISOString(),
          description: photo.description,
        })),
        total: searchResults.length,
        totalPages: Math.ceil(searchResults.length / perPage),
      };
    }

    // Real API call
    const url = `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(
      query,
    )}&page=${page}&per_page=${perPage}&order_by=relevant`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      results: data.results.map(photo => ({
        id: photo.id,
        title: photo.description || photo.alt_description || 'Untitled',
        author: photo.user.name,
        authorProfile: photo.user.links.html,
        urls: {
          thumb: photo.urls.thumb,
          small: photo.urls.small,
          regular: photo.urls.regular,
          full: photo.urls.full,
          raw: photo.urls.raw,
        },
        downloadUrl: photo.links.download,
        width: photo.width,
        height: photo.height,
        likes: photo.likes,
        downloads: photo.downloads || 0,
        color: photo.color,
        createdAt: photo.created_at,
      })),
      total: data.total,
      totalPages: data.total_pages,
    };
  } catch (error) {
    console.error('Error searching wallpapers:', error);
    throw error;
  }
};

// Get photo details
export const getPhotoDetails = async photoId => {
  try {
    // Use mock data if API key is not configured
    if (USE_MOCK_DATA) {
      console.log('Using mock data for photo details:', photoId);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const photo = MOCK_WALLPAPERS.find(w => w.id === photoId);
      if (!photo) {
        throw new Error('Photo not found');
      }

      return {
        id: photo.id,
        title: photo.description || photo.alt_description || 'Untitled',
        description: photo.description,
        author: photo.user.name,
        authorProfile: `https://unsplash.com/@${photo.user.username}`,
        urls: {
          thumb: photo.urls.small,
          small: photo.urls.small,
          regular: photo.urls.regular,
          full: photo.urls.full,
          raw: photo.urls.full,
        },
        downloadUrl: photo.urls.full,
        links: {
          download: photo.urls.full,
          html: `https://unsplash.com/photos/${photo.id}`,
        },
        likes: photo.likes,
        downloads: photo.downloads,
        width: photo.width,
        height: photo.height,
        color: photo.color,
        tags: [
          { title: 'nature' },
          { title: 'landscape' },
          { title: 'beautiful' },
        ],
        location: { name: 'Demo Location' },
        exif: {
          make: 'Demo Camera',
          model: 'Demo Model',
          focal_length: '50mm',
          aperture: 'f/2.8',
          iso: 100,
          exposure_time: '1/125',
        },
        createdAt: new Date().toISOString(),
      };
    }

    // Real API call
    const url = `${UNSPLASH_BASE_URL}/photos/${photoId}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const photo = await response.json();

    return {
      id: photo.id,
      title: photo.description || photo.alt_description || 'Untitled',
      author: photo.user.name,
      authorProfile: photo.user.links.html,
      authorAvatar: photo.user.profile_image.medium,
      urls: {
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        regular: photo.urls.regular,
        full: photo.urls.full,
        raw: photo.urls.raw,
      },
      downloadUrl: photo.links.download,
      width: photo.width,
      height: photo.height,
      likes: photo.likes,
      downloads: photo.downloads || 0,
      color: photo.color,
      createdAt: photo.created_at,
      location: photo.location,
      exif: photo.exif,
      tags: photo.tags ? photo.tags.map(tag => tag.title) : [],
    };
  } catch (error) {
    console.error('Error fetching photo details:', error);
    throw error;
  }
};

// Download tracking (required by Unsplash API)
export const trackDownload = async photoId => {
  try {
    const photo = await getPhotoDetails(photoId);

    // Trigger download tracking on Unsplash
    await fetch(photo.downloadUrl, {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    });

    // Save to download history
    const downloads = await getDownloadHistory();
    const newDownload = {
      id: photoId,
      timestamp: Date.now(),
      url: photo.urls.regular,
    };

    const updatedDownloads = [newDownload, ...downloads.slice(0, 99)]; // Keep last 100
    await AsyncStorage.setItem(
      STORAGE_KEYS.DOWNLOAD_HISTORY,
      JSON.stringify(updatedDownloads),
    );

    return true;
  } catch (error) {
    console.error('Error tracking download:', error);
    return false;
  }
};

// Favorites management
export const getFavorites = async () => {
  try {
    const favorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addToFavorites = async wallpaper => {
  try {
    const favorites = await getFavorites();
    const isAlreadyFavorite = favorites.some(fav => fav.id === wallpaper.id);

    if (!isAlreadyFavorite) {
      const newFavorites = [wallpaper, ...favorites];
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(newFavorites),
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

export const removeFromFavorites = async wallpaperId => {
  try {
    const favorites = await getFavorites();
    const newFavorites = favorites.filter(fav => fav.id !== wallpaperId);
    await AsyncStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify(newFavorites),
    );
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

export const isFavorite = async wallpaperId => {
  try {
    const favorites = await getFavorites();
    return favorites.some(fav => fav.id === wallpaperId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Download history
export const getDownloadHistory = async () => {
  try {
    const history = await AsyncStorage.getItem(STORAGE_KEYS.DOWNLOAD_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting download history:', error);
    return [];
  }
};

// Cache management
export const getCachedWallpapers = async cacheKey => {
  try {
    const cached = await AsyncStorage.getItem(
      `${STORAGE_KEYS.CACHE}_${cacheKey}`,
    );
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const cacheAge = now - timestamp;

      // Cache for 1 hour
      if (cacheAge < 3600000) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cached wallpapers:', error);
    return null;
  }
};

export const setCachedWallpapers = async (cacheKey, data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.CACHE}_${cacheKey}`,
      JSON.stringify(cacheData),
    );
  } catch (error) {
    console.error('Error caching wallpapers:', error);
  }
};

// Clear all wallpaper data
export const clearWallpaperData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.FAVORITES,
      STORAGE_KEYS.CACHE,
      STORAGE_KEYS.DOWNLOAD_HISTORY,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing wallpaper data:', error);
    return false;
  }
};

export default {
  fetchWallpapers,
  searchWallpapers,
  getPhotoDetails,
  trackDownload,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  getDownloadHistory,
  getCachedWallpapers,
  setCachedWallpapers,
  clearWallpaperData,
  WALLPAPER_CATEGORIES,
};
