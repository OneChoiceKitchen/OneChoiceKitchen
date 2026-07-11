# PWA Guide

## What is a PWA?

A Progressive Web App (PWA) is a website that can be "installed" on a mobile device's home screen and behaves like a native app — offline support, push notifications, and full-screen display.

## OneChoiceKitchen PWAs

| App | Port | URL |
|-----|------|-----|
| Customer Mobile | 4210 | http://localhost:4210 |
| Partner App | 4211 | http://localhost:4211 |
| Rider App | 4212 | http://localhost:4212 |

## PWA vs Native App

| Feature | PWA | Native (Capacitor) |
|---------|-----|-------------------|
| App Store listing | ✗ (Play Store via TWA) | ✅ |
| Offline support | ✅ | ✅ |
| Push notifications | ✅ (web push) | ✅ (FCM/APNs) |
| Camera access | Limited | ✅ |
| GPS | ✅ | ✅ |
| Storage | 50 MB | Unlimited |
| Update speed | Instant | App store review |
| Installation | Browser prompt | App Store download |

## Setting Up next-pwa

```bash
pnpm add next-pwa
```

`next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.onechoicekitchen\.com\/api/,
      handler: 'NetworkFirst',
      options: { cacheName: 'api-cache', expiration: { maxAgeSeconds: 300 } }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: { cacheName: 'image-cache', expiration: { maxEntries: 100, maxAgeSeconds: 604800 } }
    }
  ]
});

module.exports = withPWA({ /* your next config */ });
```

## Required Files

### public/manifest.json
```json
{
  "name": "OneChoiceKitchen",
  "short_name": "OCK",
  "description": "Order food, subscribe to tiffin",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-512x512.png",  "sizes": "512x512",  "type": "image/png", "purpose": "any maskable" }
  ]
}
```

## Install Prompt

```tsx
// components/InstallPrompt.tsx
export function InstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt) return null;

  return (
    <button onClick={async () => {
      prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
    }}>
      📲 Install App
    </button>
  );
}
```

## Testing PWA

1. Build: `pnpm nx build customer-mobile --prod`
2. Serve production build: `pnpm nx serve customer-mobile`
3. Open Chrome DevTools → Application → Manifest
4. Check: Service Workers, Offline mode, Install button appears

## Lighthouse PWA Audit

```bash
npx lighthouse http://localhost:4210 --only-categories=pwa --view
```

Target score: ≥ 90 in PWA category
