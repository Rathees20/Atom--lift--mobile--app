# Atom App

A React Native mobile application built with Expo for managing complaints, customers, AMC, and various business operations.

## Features

- **Authentication**: Mobile OTP-based login system
- **Complaint Management**: Add and manage customer complaints
- **Customer Management**: Add and view customer information
- **AMC Management**: Create and manage Annual Maintenance Contracts
- **Attendance Tracking**: Mark and view attendance records
- **Leave Management**: Apply and track leave requests
- **Travel Management**: Manage travel requests
- **Material Requisition**: Handle material requisition requests
- **Routine Services**: Manage routine maintenance services

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd atom
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Run on your preferred platform:
```bash
# For Android
npm run android
# or
yarn android

# For iOS
npm run ios
# or
yarn ios

# For Web
npm run web
# or
yarn web
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── CustomDrawer.tsx
│   └── TipsModal.tsx
├── screens/            # Screen components
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── AddComplaintScreen.tsx
│   └── ... (other screens)
├── styles/             # Global styles
│   └── globalStyles.ts
└── assets/             # Images and other assets
    └── filter 1.png
```

## Technologies Used

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation library
- **Expo Vector Icons**: Icon library

## Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

### Building for Production

1. **Android APK**:
```bash
expo build:android
```

2. **iOS IPA**:
```bash
expo build:ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
