# Android & Google Play Store Deployment Guide

## Overview

OneChoiceKitchen mobile apps (Customer :4210, Partner :4211, Rider :4212) are **Next.js Progressive Web Apps (PWA)**. They can be deployed to the Play Store via:

1. **Option A — PWA (Recommended)**: Install directly from browser, no store needed
2. **Option B — TWA (Trusted Web Activity)**: Lightweight Android wrapper, Play Store listing
3. **Option C — Capacitor**: Full native wrapper, deepest device integration

---

## Option A: PWA Setup

### 1. Add Web App Manifest

Create/update `public/manifest.json` in each mobile app:

```json
{
  "name": "OneChoiceKitchen",
  "short_name": "OCK",
  "description": "Order food, subscribe to tiffin, earn rewards",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icons/icon-72x72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96x96.png",   "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### 2. Link manifest in `<head>`

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#2563EB" />
<meta name="mobile-web-app-capable" content="yes" />
```

### 3. Add Service Worker

Create `public/sw.js` for offline support (use `next-pwa` library):

```bash
pnpm add next-pwa
```

---

## Option B: TWA (Trusted Web Activity) — Play Store

TWA wraps your PWA in a thin Android shell for Play Store listing.

### Prerequisites
- Android Studio installed
- Google Play Developer account ($25 one-time fee)
- Your web app deployed with HTTPS and a valid manifest
- Digital Asset Links file (`/.well-known/assetlinks.json`)

### Steps

#### 1. Install Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
```

#### 2. Initialize TWA project
```bash
mkdir ock-android && cd ock-android
bubblewrap init --manifest https://customer.onechoicekitchen.com/manifest.json
```

Follow prompts:
- Package name: `com.onechoicekitchen` (Customer) / `.partner` / `.rider`
- App name: `OneChoiceKitchen`
- Display mode: `standalone`
- Start URL: `/`

#### 3. Build debug APK
```bash
bubblewrap build
```

#### 4. Create Keystore (signing key — keep this FOREVER)
```bash
keytool -genkey -v \
  -keystore onechoicekitchen.keystore \
  -alias onechoicekitchen \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

> ⚠️ **CRITICAL**: Store the keystore file and passwords in a secure vault (e.g., AWS Secrets Manager, 1Password). Loss = cannot update the app ever again.

#### 5. Build signed AAB for Play Store
```bash
bubblewrap build --skipPwaValidation
# Then sign:
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore onechoicekitchen.keystore \
  app-release.aab onechoicekitchen
```

#### 6. Set up Digital Asset Links
Create `/.well-known/assetlinks.json` on your web server:
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

Get fingerprint:
```bash
keytool -list -v -keystore onechoicekitchen.keystore -alias onechoicekitchen
```

---

## Option C: Capacitor (Full Native)

### 1. Install Capacitor
```bash
pnpm add @capacitor/core @capacitor/cli @capacitor/android
pnpm dlx cap init
```

### 2. Build Next.js app first
```bash
pnpm nx build customer-mobile --prod
```

### 3. Add Android platform
```bash
pnpm dlx cap add android
pnpm dlx cap copy android
pnpm dlx cap open android
```

### 4. Build APK in Android Studio
- Open Android Studio
- Build → Generate Signed Bundle/APK
- Select APK or AAB
- Use your keystore file

---

## Play Store Submission Checklist

### Account Setup
- [ ] Google Play Developer account ($25 one-time)
- [ ] Payment profile configured
- [ ] Two-factor authentication enabled

### App Signing
- [ ] Keystore created and backed up securely
- [ ] SHA256 fingerprint documented
- [ ] `assetlinks.json` hosted at `/.well-known/assetlinks.json`

### Store Listing Assets
- [ ] App icon: 512×512 PNG (no alpha)
- [ ] Feature graphic: 1024×500 PNG or JPEG
- [ ] Screenshots: min 2, max 8 per device type
  - Phone: 320-3840px (16:9 or 9:16 recommended)
  - Tablet (optional but recommended)
- [ ] Short description: max 80 characters
- [ ] Full description: max 4000 characters

### Technical Requirements
- [ ] Target API level ≥ 33 (Android 13) for new apps
- [ ] Min SDK: 26 (Android 8.0)
- [ ] 64-bit support enabled
- [ ] Privacy policy URL
- [ ] App category selected

### Release Process
1. **Internal testing** → team only, instant rollout
2. **Closed testing (Alpha)** → up to 200 testers
3. **Open testing (Beta)** → public opt-in
4. **Production** → staged rollout (5% → 20% → 100%)

### App Bundle Sizes
- Target: < 100 MB AAB
- Use Android App Bundle (AAB) instead of APK for Play Store
- Play Store splits and delivers only required resources

---

## Version Management

In `android/app/build.gradle`:
```gradle
android {
  defaultConfig {
    versionCode 1       // Increment by 1 for each release
    versionName "2.5.0" // Semantic version shown to users
  }
}
```

### Version Naming Convention
- `versionName`: `MAJOR.MINOR.PATCH` (e.g., `2.5.0`)
- `versionCode`: Integer, must always increase (e.g., 25, 26, 27)

---

## Notifications (FCM)

```bash
pnpm add @capacitor/push-notifications
```

Configure in `capacitor.config.ts`:
```typescript
plugins: {
  PushNotifications: {
    presentationOptions: ["badge", "sound", "alert"]
  }
}
```

Add `google-services.json` from Firebase Console to `android/app/`.

---

## Release Notes Template

```
What's New in v2.5.0:
• Real-time order tracking on live map
• Tiffin subscription pause/resume feature
• Improved loyalty points dashboard
• Bug fixes and performance improvements
```
