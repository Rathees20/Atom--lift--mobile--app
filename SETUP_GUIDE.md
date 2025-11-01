# Expo Project Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI installed globally: `npm install -g @expo/cli`
- For mobile development:
  - Android Studio (for Android)
  - Xcode (for iOS - macOS only)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Clear Cache (if needed)
```bash
npx expo start --clear
```

## Running the Project

### For Development Server
```bash
npm start
# or
expo start
```

### For Mobile Platforms

#### Android
```bash
npm run android
# or
expo start --android
```

#### iOS (macOS only)
```bash
npm run ios
# or
expo start --ios
```

### For Web Platform
```bash
npm run web
# or
expo start --web
```

## Development Workflow

### 1. Start Development Server
```bash
expo start
```

### 2. Choose Platform
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web
- Scan QR code with Expo Go app on your mobile device

### 3. Hot Reloading
- Changes to your code will automatically reload
- Press `r` to manually reload
- Press `m` to toggle the menu

## Building for Production

### Web Build
```bash
npm run build:web
# or
expo export --platform web
```

### Android Build
```bash
npm run build:android
# or
expo build:android
```

### iOS Build
```bash
npm run build:ios
# or
expo build:ios
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start --clear`
2. **Dependencies issues**: Delete `node_modules` and run `npm install`
3. **Web not loading**: Ensure `react-native-web` is installed
4. **TypeScript errors**: Check `tsconfig.json` configuration

### Reset Project
```bash
rm -rf node_modules
npm install
expo start --clear
```

## Project Structure
```
atom/
├── src/
│   ├── components/     # Reusable components
│   ├── screens/        # Screen components
│   ├── styles/         # Global styles
│   └── assets/         # Images, fonts, etc.
├── app.json           # Expo configuration
├── babel.config.js    # Babel configuration
├── metro.config.js    # Metro bundler configuration
└── package.json       # Dependencies and scripts
```

## Features
- ✅ Cross-platform (iOS, Android, Web)
- ✅ TypeScript support
- ✅ Hot reloading
- ✅ Navigation (React Navigation)
- ✅ Vector icons
- ✅ Responsive design
- ✅ Modern React Native architecture
