# OneChoiceKitchen — Mobile Deployment Guide

> **Version:** 3.0 | **Updated:** 2026-07-10  
> Covers: PWA, TWA (Android), Capacitor (iOS/Android), App Signing, Store Submission, Push Notifications

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [PWA Configuration](#2-pwa-configuration)
3. [Android TWA and Capacitor](#3-android-twa-and-capacitor)
4. [iOS Capacitor Native Wrapper](#4-ios-capacitor-native-wrapper)
5. [App Signing and Credentials](#5-app-signing-and-credentials)
6. [Google Play Store Submission](#6-google-play-store-submission)
7. [Apple App Store Submission](#7-apple-app-store-submission)
8. [Push Notifications FCM and APNs](#8-push-notifications-fcm-and-apns)
9. [Deep Linking and Universal Links](#9-deep-linking-and-universal-links)
10. [App Icons and Splash Screens](#10-app-icons-and-splash-screens)
11. [Version Management](#11-version-management)
12. [CI/CD for Mobile](#12-cicd-for-mobile)

---

## 1. Architecture Overview

| App | Technology | Bundle ID | Platform |
|-----|-----------|-----------|----------|
| Customer App | Next.js PWA + TWA (Android) + Capacitor (iOS) | com.onechoicekitchen | Android & iOS |
| Partner App  | React PWA + TWA (Android) + Capacitor (iOS)  | com.onechoicekitchen.partner | Android & iOS |
| Rider App    | React PWA + TWA (Android) + Capacitor (iOS)  | com.onechoicekitchen.rider | Android & iOS |
| Admin App    | React PWA + TWA (Android) + Capacitor (iOS)  | com.onechoicekitchen.admin | Android & iOS |

**Port mapping (local dev):**

| Service | Port |
|---------|------|
| Customer Web | 4208 |
| Customer PWA | 4211 |
| Rider Mobile | 4212 |
| Partner Portal | 4206 |
| Admin Portal | 4205 |

---

## 2. PWA Configuration

Each portal includes a manifest.json and service worker.

### manifest.json template

```json
{
  "name": "OneChoiceKitchen",
  "short_name": "OCK",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f3f4f8",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable any" }
  ]
}
```

### iOS-specific meta tags

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="OCK" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

---

## 3. Android TWA and Capacitor

### Option A: Trusted Web Activity (TWA)

assetlinks.json at /.well-known/assetlinks.json:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.onechoicekitchen",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://onechoicekitchen.com/manifest.json
bubblewrap build
```

### Option B: Capacitor (Recommended)

```bash
pnpm add @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
pnpm exec cap init "OneChoiceKitchen" "com.onechoicekitchen"
pnpm exec cap add android
pnpm exec cap add ios
pnpm nx build customer-mobile
pnpm exec cap sync android
pnpm exec cap open android
```

---

## 4. iOS Capacitor Native Wrapper

Requirements: macOS with Xcode 15+, Apple Developer Account ($99/year)

```bash
pnpm nx build customer-mobile --configuration=production
pnpm exec cap sync ios
pnpm exec cap open ios
```

In Xcode: Set Bundle Identifier, configure Signing, enable Push Notifications capability, then Archive > Validate > Distribute.

---

## 5. App Signing and Credentials

### Android Keystore

```bash
keytool -genkey -v -keystore ock-release.keystore -alias ock-release -keyalg RSA -keysize 2048 -validity 10000
```

Environment variables:
- ANDROID_KEYSTORE_PATH
- ANDROID_KEY_ALIAS
- ANDROID_STORE_PASSWORD
- ANDROID_KEY_PASSWORD

### iOS Certificates

1. Create App ID with bundle com.onechoicekitchen in Apple Developer portal
2. Create Distribution Certificate
3. Create App Store Provisioning Profile
4. Export .p12 and store securely in secrets manager

---

## 6. Google Play Store Submission

```bash
cd android && ./gradlew bundleRelease
```

AAB located at: android/app/build/outputs/bundle/release/app-release.aab

### Submission Checklist
- App bundle uploaded to Play Console
- Screenshots: Phone (min 2), Feature graphic 1024x500
- Short description (max 80 chars)
- Full description (max 4000 chars)
- Content rating survey completed
- Privacy Policy URL: https://onechoicekitchen.com/privacy
- Data safety section filled
- Minimum SDK: API 26 (Android 8.0)
- Target SDK: API 34+

---

## 7. Apple App Store Submission

Build: Xcode > Product > Archive > Distribute App > App Store Connect > Upload

### Submission Checklist
- Bundle identifier matches provisioning profile
- Version and build number incremented
- Screenshots: 6.7 inch (required), 6.5 inch, 5.5 inch
- App description (max 4000 chars)
- Privacy Policy URL
- Age rating configured

---

## 8. Push Notifications FCM and APNs

```bash
pnpm add @capacitor/push-notifications
```

NestJS service:

```typescript
import * as admin from 'firebase-admin';

async sendPush(token: string, title: string, body: string) {
  await admin.messaging().send({
    token,
    notification: { title, body },
    android: { priority: 'high' },
  });
}
```

Environment variables:
- FIREBASE_PROJECT_ID=onechoicekitchen
- FIREBASE_PRIVATE_KEY
- FIREBASE_CLIENT_EMAIL

---

## 9. Deep Linking and Universal Links

### Android App Links

AndroidManifest.xml:
```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="onechoicekitchen.com" />
</intent-filter>
```

### iOS Universal Links

apple-app-site-association at https://onechoicekitchen.com/.well-known/apple-app-site-association

---

## 10. App Icons and Splash Screens

```bash
pnpm add -D @capacitor/assets
# Place resources/icon.png (1024x1024) and resources/splash.png (2732x2732)
pnpm exec capacitor-assets generate
```

---

## 11. Version Management

| Version type | When to use |
|---|---|
| PATCH (x.x.1) | Bug fixes |
| MINOR (x.1.0) | New features |
| MAJOR (2.0.0) | Breaking changes |

Android versionCode must increment for every Play Store upload.

---

## 12. CI/CD for Mobile

GitHub Actions workflow for Android AAB build and Fastlane for iOS are documented in .github/workflows/mobile-android.yml and ios/fastlane/Fastfile respectively.

---

## Quick Reference Store URLs

| App | Play Store ID | App Store |
|-----|---|---|
| Customer | com.onechoicekitchen | /in/app/onechoicekitchen |
| Partner | com.onechoicekitchen.partner | /in/app/onechoicekitchen-partner |
| Rider | com.onechoicekitchen.rider | /in/app/onechoicekitchen-rider |
| Admin | com.onechoicekitchen.admin | /in/app/onechoicekitchen-admin |

> SECURITY: Admin App store links must NOT be shared publicly. Access is restricted to authorized administrators only.
