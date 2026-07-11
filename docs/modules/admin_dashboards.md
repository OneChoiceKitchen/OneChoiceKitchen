# Admin Dashboards Architecture

## Overview
The Admin Dashboards module is the primary landing view for system operators. It follows a highly structured, scalable layout designed exactly according to the Azure Portal-inspired reference design.

## Features
- **Categorized Workspace Navigation**: The admin interface is divided into functional domains (e.g., Restaurant Operations, Dining Management, HRMS).
- **KPI Metrics Cards**: A scrollable row of Top-Level KPIs (Total Revenue, Active Orders, Total Users, Active Subscriptions) dynamically loaded on the top of the interface.
- **Consistent Page Shell**: Every module inherits global styles via `page-defaults.css` using the `.page-container` wrapper.

## Design Aesthetics (v3.0)
- **Colors**: Uses OneChoiceKitchen brand colors: Blue (`#2563EB`) as primary and Red (`#DC2626`) for danger/alerts. The background utilizes Azure-style grey (`#f3f4f8`) instead of pure white to increase contrast for cards.
- **Typography & Structure**: Header height is locked to `88px` and Footer to `80px`. Logos are sized consistently at `64px` in height.
- **KPI Cards**: Icons are aligned to the left of the card content, removing redundant internal borders, utilizing clean `var(--surf)` backgrounds and `var(--bdr)` for single-pixel external borders.

## UI Components
- `WorkspaceHome`: Iterates through the `WORKSPACE` constant to dynamically render all available module cards.
- `StatCard` (KPI): Displays title, numerical value, icon, and a percentage trend pill (up/down/neutral).

## Routing
- Internal React state acts as the client-side router (`currentTab`). The `WorkspaceHome` serves as the root index, and clicking a module card sets the state to render the appropriate Admin Page component (e.g., `AiChatManagementAdmin`, `OverallDashboardAdmin`).
