# ZenHub – Notes, Focus & Fun

A React Native all-in-one utility & fun hub app featuring notes, quotes, weather, wallpapers, news, dictionary, and math game modules.

## ✨ Features

### Core Modules

- 🗒️ **Notes & To-Do** - CRUD operations with offline storage, tags, search, and export
- 💬 **Quotes** - Daily inspirational quotes (Coming Soon)
- ☀️ **Weather** - Current conditions and forecasts (Coming Soon)
- 🖼️ **Wallpapers** - Browse and download beautiful images (Coming Soon)
- 📰 **News** - Latest articles by category (Coming Soon)
- 📚 **Dictionary** - Word definitions and favorites (Coming Soon)
- 🧮 **Math Game** - Progressive difficulty brain training (Coming Soon)

### Design & UX

- 🎨 Warm brown/beige color palette
- 📱 Soft rounded cards (18-20px radius)
- ✨ Smooth 60fps animations
- 📱 Offline-first functionality
- 🎯 Clean, modern UI with Tailwind CSS

### Monetization

- 📺 Banner ads (non-intrusive)
- 🚫 Interstitial ads (with cooldown)
- 🎁 Optional rewarded ads
- 💳 In-app purchase to remove ads

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.19.4
- React Native development environment
- Android Studio / Xcode

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ZenHub.git
   cd ZenHub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **⚠️ CRITICAL: Fix react-native-sqlite-storage**

   Due to the deprecated `jcenter()` repository, you must run this fix after every `npm install`:

   **Windows PowerShell:**

   ```powershell
   (Get-Content 'node_modules\react-native-sqlite-storage\platforms\android\build.gradle') -replace 'jcenter\(\)', 'mavenCentral()' | Set-Content 'node_modules\react-native-sqlite-storage\platforms\android\build.gradle'
   ```

   **macOS/Linux:**

   ```bash
   sed -i.bak 's/jcenter()/mavenCentral()/g' node_modules/react-native-sqlite-storage/platforms/android/build.gradle
   ```

4. **Configure environment variables**

   Edit the `.env` file in the project root and replace placeholder values:

   ```env
   # API Keys (replace with your actual keys)
   WEATHER_API_KEY=your_openweather_api_key
   NEWS_API_KEY=your_news_api_key
   WALLPAPER_API_KEY=your_unsplash_access_key

   # AdMob IDs (replace with your production ad unit IDs)
   ADMOB_BANNER_ANDROID=your_banner_ad_unit_id
   ADMOB_BANNER_IOS=your_banner_ad_unit_id
   # ... more ad unit IDs
   ```

5. **iOS setup** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

#### Android

```bash
npm run android
```

#### iOS

```bash
npm run ios
```

#### Development Server

```bash
npm start
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── UI.jsx          # Common components (Card, Button, Badge, etc.)
├── config/             # Configuration files
│   ├── theme.js        # Theme configuration
│   └── constants.js    # App constants
├── navigation/         # Navigation setup
│   └── AppNavigator.jsx
├── screens/            # App screens
│   ├── HomeScreen.jsx
│   ├── NotesScreen.jsx
│   ├── NoteDetailScreen.jsx
│   └── ...
├── services/           # Business logic & API calls
│   ├── storageService.js
│   ├── notesService.js
│   └── adsService.js
├── utils/             # Helper functions
│   └── helpers.js
└── hooks/             # Custom React hooks
```

## 🔧 Configuration

### API Keys Required

1. **OpenWeatherMap** (Weather module)

   - Sign up at https://openweathermap.org/api
   - Get your free API key
   - Add to `.env` as `WEATHER_API_KEY`

2. **News API** (News module)

   - Sign up at https://newsapi.org
   - Get your free API key
   - Add to `.env` as `NEWS_API_KEY`

3. **Unsplash** (Wallpapers module)
   - Sign up at https://unsplash.com/developers
   - Create an app and get access key
   - Add to `.env` as `WALLPAPER_API_KEY`

### AdMob Setup

1. **Create AdMob account** at https://admob.google.com
2. **Create ad units** for your app
3. **Replace test ad unit IDs** in `.env` with your production IDs
4. **For development**, current test IDs will work fine

## 📋 Features Status

- ✅ **Home Module** - Complete
- ✅ **Notes & To-Do** - Complete with CRUD, tags, search
- 🚧 **Quotes** - API integration pending
- 🚧 **Weather** - API integration pending
- 🚧 **Wallpapers** - API integration pending
- 🚧 **News** - API integration pending
- 🚧 **Dictionary** - API integration pending
- 🚧 **Math Game** - Game logic pending

---

**Made with ❤️ using React Native & Tailwind CSS**

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

## Common Issues

### React Native SQLite Storage jcenter() Error
If you see `Could not find method jcenter()` error:
- The postinstall script should fix this automatically
- If not, run the manual fix command from step 3 in installation

### Metro Bundler Dependency Resolution
If you see module resolution errors like `event-target-shim`:
```bash
# Reset Metro cache
npm run start:fresh

# Or clean and restart
npm run clean
```

### Build Issues
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Reset Metro cache
npx react-native start --reset-cache
```

For more issues, see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)

---

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
