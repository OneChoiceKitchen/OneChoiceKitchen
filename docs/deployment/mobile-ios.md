# iOS & Apple App Store Deployment Guide

## Overview

OneChoiceKitchen mobile apps can be deployed to the Apple App Store via:

1. **Option A — iOS PWA**: Install from Safari (limited but no App Store fee)
2. **Option B — Capacitor**: Full native iOS app wrapper (recommended for App Store)

> **Requirements**: macOS is required to build iOS apps (Xcode only runs on macOS).

---

## Prerequisites

- macOS 13+ (Ventura or later)
- Xcode 15+ (free from Mac App Store)
- Apple Developer account ($99/year) — https://developer.apple.com
- CocoaPods: `sudo gem install cocoapods`
- Node.js 20+ and pnpm

---

## Option A: PWA for iOS

iOS PWAs have limited capabilities compared to Android:
- No push notifications (as of iOS 16.4, web push is supported on iOS 16.4+)
- No background sync
- Limited offline support
- Storage limited to 50 MB

### Setup

Add to each mobile app's `<head>`:
```html
<!-- iOS PWA meta tags -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="OneChoiceKitchen" />

<!-- Icons for iOS home screen -->
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
<link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />

<!-- Splash screens -->
<link rel="apple-touch-startup-image" href="/splash/iphone-splash.png" />
```

---

## Option B: Capacitor iOS (Recommended)

### 1. Install Capacitor

```bash
pnpm add @capacitor/core @capacitor/cli @capacitor/ios
pnpm add @capacitor/push-notifications @capacitor/camera @capacitor/geolocation
```

### 2. Initialize Capacitor

```bash
# In apps/customer-mobile (repeat for mobile-app and rider-mobile)
pnpm dlx cap init "OneChoiceKitchen" "com.onechoicekitchen" \
  --web-dir=".next"
```

Create `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onechoicekitchen',
  appName: 'OneChoiceKitchen',
  webDir: '.next',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2563EB',
      showSpinner: false
    }
  }
};

export default config;
```

### 3. Build Next.js App

```bash
pnpm nx build customer-mobile --prod
pnpm dlx cap add ios
pnpm dlx cap copy ios
```

### 4. Open in Xcode

```bash
pnpm dlx cap open ios
```

---

## Apple Developer Setup

### 1. Create App ID

1. Go to https://developer.apple.com → Identifiers
2. Click **+** → App IDs
3. Bundle ID: `com.onechoicekitchen` (or `.partner`, `.rider`)
4. Capabilities: Push Notifications, Associated Domains, Sign In with Apple

### 2. Create Certificates

**Development Certificate:**
1. Xcode → Preferences → Accounts → Manage Certificates
2. Click **+** → Apple Development
3. Xcode handles this automatically with automatic signing

**Distribution Certificate:**
1. Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
2. Upload CSR to https://developer.apple.com → Certificates
3. Download and double-click to install

### 3. Create Provisioning Profiles

**Development:**
1. developer.apple.com → Profiles → **+**
2. iOS App Development
3. Select App ID + Certificate + Test Devices
4. Download and install

**Distribution (App Store):**
1. App Store distribution profile
2. Select App ID + Distribution Certificate
3. Download and install

---

## Xcode Configuration

### Info.plist — Required permissions

Add these entries to `ios/App/App/Info.plist`:

```xml
<!-- Camera (for food photos, profile picture) -->
<key>NSCameraUsageDescription</key>
<string>OneChoiceKitchen needs camera access for profile photos and food images</string>

<!-- Location (for delivery tracking, restaurant discovery) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>OneChoiceKitchen uses your location to find nearby restaurants and track delivery</string>

<!-- Push Notifications -->
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### Bundle ID and Version

In Xcode → Target → General:
- Bundle Identifier: `com.onechoicekitchen`
- Version: `2.5.0` (shown in App Store)
- Build: `25` (integer, must increase each upload)

---

## App Icons for iOS

Required icon sizes:

| Device | Size |
|--------|------|
| iPhone Notification | 20pt @1x, 2x, 3x |
| iPhone Settings | 29pt @1x, 2x, 3x |
| iPhone Spotlight | 40pt @2x, 3x |
| iPhone App | 60pt @2x, 3x |
| iPad Notifications | 20pt @1x, 2x |
| iPad Settings | 29pt @1x, 2x |
| iPad Spotlight | 40pt @1x, 2x |
| iPad App | 76pt @1x, 2x |
| iPad Pro App | 83.5pt @2x |
| App Store | 1024×1024 @1x |

Use https://appicon.co or https://makeappicon.com to generate all sizes from one 1024×1024 source.

---

## Build & Upload to TestFlight

### 1. Build Archive in Xcode

1. Set scheme to **Release**
2. Product → Archive
3. Xcode Organizer opens
4. Click **Distribute App** → App Store Connect → Upload
5. Wait for processing (5-30 minutes)

### 2. Or use Xcode command line

```bash
xcodebuild -scheme App \
  -configuration Release \
  -archivePath ./build/OCK.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath ./build/OCK.xcarchive \
  -exportPath ./build/OCK.ipa \
  -exportOptionsPlist ExportOptions.plist
```

### ExportOptions.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store</string>
  <key>teamID</key>
  <string>YOUR_TEAM_ID</string>
</dict>
</plist>
```

---

## TestFlight Testing

1. Go to https://appstoreconnect.apple.com
2. Select your app → **TestFlight**
3. Add internal testers (team members, up to 100)
4. Add external testers (up to 10,000 — requires beta review ~24-48h)
5. Testers receive email link to install TestFlight app

---

## App Store Connect Submission

### Store Listing Requirements

- **App Name**: max 30 characters
- **Subtitle**: max 30 characters
- **Description**: max 4000 characters
- **Keywords**: max 100 characters, comma-separated
- **Support URL**: required
- **Privacy Policy URL**: required (no exceptions)
- **Marketing URL**: optional

### Screenshots Required

| Device | Size |
|--------|------|
| iPhone 6.5" (Xs Max) | 1242×2688 or 2688×1242 |
| iPhone 5.5" (8 Plus) | 1242×2208 or 2208×1242 |
| iPad Pro 12.9" | 2048×2732 or 2732×2048 |

Upload 1-10 screenshots per device.

### App Review Guidelines Checklist

- [ ] Privacy policy accessible from within app
- [ ] Account deletion option (required since iOS 17)
- [ ] No misleading screenshots
- [ ] Functionality works without errors
- [ ] In-app purchases configured in App Store Connect (if any)
- [ ] No references to competitor platforms
- [ ] Content rating set appropriately

---

## APNs (Push Notifications) Setup

1. developer.apple.com → Certificates → **+**
2. Apple Push Notification service (APNs) Auth Key (recommended over certificates)
3. Download `.p8` file
4. Note: Key ID and Team ID

Configure in NestJS API:
```typescript
// apps/api/src/notifications/apns.config.ts
export const apnsConfig = {
  token: {
    key: './AuthKey_XXXXXX.p8',
    keyId: 'YOUR_KEY_ID',
    teamId: 'YOUR_TEAM_ID',
  },
  production: process.env.NODE_ENV === 'production',
};
```

---

## Release Process

1. **Internal build** → TestFlight internal testers
2. **Beta review** → TestFlight external testers  
3. **App Store Review** (1-3 business days typically)
4. **Phased Release** → 1% → 2% → 5% → 10% → 20% → 50% → 100% over 7 days

---

## Associated Domains (Deep Linking)

In `ios/App/App.entitlements`:
```xml
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:onechoicekitchen.com</string>
  <string>applinks:customer.onechoicekitchen.com</string>
</array>
```

Host `/.well-known/apple-app-site-association` on your web server:
```json
{
  "applinks": {
    "details": [{
      "appIDs": ["TEAMID.com.onechoicekitchen"],
      "components": [
        { "/": "/orders/*" },
        { "/": "/restaurant/*" }
      ]
    }]
  }
}
```
