# Startup Profiles

> Use profiles to control which services start. Choose based on your task to conserve CPU.

## Profile: `core` (Recommended for API + Web work)

**Command**: `.\setup.ps1 start -Profile core`

**Services Started**:
- `api` (port 3000)
- `web` (port 4208)
- Maildev (ports 1025/1080)

**Use when**: Working on customer web frontend, API endpoints, or backend features.

**CPU**: Low — best for day-to-day development.

---

## Profile: `all` (Full stack — heavy)

**Command**: `.\setup.ps1 start -Profile all` (or just `.\setup.ps1 start`)

**Services Started**:
- `api` (port 3000)
- `admin-portal` (port 4205)
- `partner-portal` (port 4206)
- `rider-portal` (port 4207)
- `web` (port 4208)
- `customer-mobile` (port 4210)
- `mobile-app` (port 4211)
- `rider-mobile` (port 4212)
- Maildev (ports 1025/1080)

**Use when**: Integration testing across all portals, demo environments, or full-system testing.

**CPU**: Heavy — requires 16GB+ RAM.

---

## Profile: `mobile` (API + Mobile apps)

**Command**: `.\setup.ps1 start -Profile mobile`

**Services Started**:
- `api` (port 3000)
- `customer-mobile` (port 4210)
- `mobile-app` (port 4211)
- `rider-mobile` (port 4212)
- Maildev (ports 1025/1080)

**Use when**: Working on mobile app features.

**CPU**: Medium.

---

## Adding a New Profile

To add a new profile:

1. Add a new `elseif` branch in `setup.ps1` `Start-Services` function:
   ```powershell
   } elseif ($Profile -eq "new-profile-name") {
       $frontendServices = @("app1", "app2")
       Write-Host "Running NEW-PROFILE profile."
   }
   ```
2. Add `Wait-Port` calls for the profile's services
3. Add browser launch `Start-Process` calls for the profile
4. Update this file with the new profile's description

