# Audit Fixes

This repository includes the blocking store-readiness fixes requested after the
initial audit.

## Applied

- Added `expo-crypto` for Supabase Auth compatibility on iOS.
- Updated Expo packages from SDK 51-era versions to SDK 55-era versions.
- Added store-ready visual assets:
  - `assets/icon.png`
  - `assets/adaptive-icon.png`
  - `assets/splash-icon.png`
  - `assets/notification-icon.png`
- Updated `app.json` with app icon, iOS icon, Android adaptive icon, splash
  screen, notification icon, and `expo-splash-screen` plugin configuration.
- Added `eas.json` with development, preview, production, and submit profiles.

## Still To Run Locally

The current terminal does not expose `node`, `npm`, or `npx`, so these commands
must be run from a local Node.js environment:

```bash
npm install
npx expo install --fix
npx expo-doctor@latest
npm run typecheck
```
