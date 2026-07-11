---
name: mobile-deployment
description: >
  OneChoiceKitchen mobile app deployment to Google Play Store and Apple App Store.
  Covers PWA setup, TWA (Trusted Web Activity), Capacitor native wrapper, signing,
  store submission checklists, push notifications (FCM/APNs), and version management.
  Trigger when: deploying mobile apps, setting up PWA, generating APK/AAB/IPA,
  Play Store / App Store submission, app signing, TestFlight, Capacitor setup,
  push notification config, deep linking, or app icons/splash screens.
---

# Mobile Deployment Skill

## App Architecture

OneChoiceKitchen mobile apps are **Next.js PWA** apps:
- `customer-mobile` → Port 4210 → Customer App
- `mobile-app` → Port 4211 → Partner App  
- `rider-mobile` → Port 4212 → Rider App

## Three Deployment Paths

### Path 1: PWA (Fastest — no store review)
- Manifest.json + service worker + HTTPS
- Users install from browser (Android: Chrome, iOS: Safari)
- No developer account needed
- Limitations: limited on iOS (no background sync pre iOS 16.4)

### Path 2: TWA — Google Play Store
```bash
npm install -g @bubblewrap/cli
mkdir ock-android && cd ock-android
bubblewrap init --manifest https://yourapp.com/manifest.json
bubblewrap build
```
- Requires: Digital Asset Links at `/.well-known/assetlinks.json`
- Requires: Google Play Developer account ($25)

### Path 3: Capacitor — Full Native
```bash
# In app directory
pnpm add @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
pnpm nx build customer-mobile --prod
pnpm dlx cap add android
pnpm dlx cap add ios
pnpm dlx cap open android  # opens Android Studio
pnpm dlx cap open ios      # opens Xcode (macOS only)
```

## Keystore (Android Signing)
```bash
# Create ONCE — keep forever, back up securely
keytool -genkey -v \
  -keystore onechoicekitchen.keystore \
  -alias onechoicekitchen \
  -keyalg RSA -keysize 2048 -validity 10000
```
⚠️ Loss of keystore = cannot update app ever again

## App Bundle IDs
| App | Android | iOS |
|-----|---------|-----|
| Customer | `com.onechoicekitchen` | `com.onechoicekitchen` |
| Partner | `com.onechoicekitchen.partner` | `com.onechoicekitchen.partner` |
| Rider | `com.onechoicekitchen.rider` | `com.onechoicekitchen.rider` |
| Admin | `com.onechoicekitchen.admin` | `com.onechoicekitchen.admin` |

## Play Store Submission Checklist
- [ ] Google Play Developer account ($25)
- [ ] Signed AAB generated
- [ ] App icon 512×512 PNG
- [ ] Feature graphic 1024×500
- [ ] Min 2 screenshots per device type
- [ ] Privacy policy URL
- [ ] assetlinks.json hosted
- Release tracks: Internal → Alpha → Beta → Production (staged rollout)

## App Store Submission Checklist
- [ ] Apple Developer account ($99/year)
- [ ] Xcode archive built on macOS
- [ ] Certificates + Provisioning profiles
- [ ] Info.plist permissions (camera, location)
- [ ] Privacy policy URL
- [ ] Min required screenshots (6.5" + 5.5" iPhone)
- Review: 1-3 business days

## Version Naming
- versionName: `2.5.0` (semantic)
- versionCode: `25` (integer, always increasing for Android)
- CFBundleVersion: `25` (same integer for iOS)

## Full Documentation
- [Android Guide](../../docs/deployment/mobile-android.md)
- [iOS Guide](../../docs/deployment/mobile-ios.md)
- [PWA Guide](../../docs/deployment/pwa-guide.md)
