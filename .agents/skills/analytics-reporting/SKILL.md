---
name: analytics-reporting
description: >
  Analytics and reporting system for OneChoiceKitchen. Covers revenue dashboards,
  order analytics, customer metrics, partner performance, rider KPIs, and marketing
  analytics. Trigger when: building dashboards, adding metrics, creating reports,
  financial analytics, or data visualization.
---

# Analytics & Reporting Skill

## Dashboard Modules

| Dashboard | Route | Component |
|-----------|-------|-----------|
| Overall | `overall_dashboard` | `OverallDashboardAdmin` |
| Finance | `finance_dashboard` | `FinanceDashboardAdmin` |
| Marketing | `marketing_dashboard` | `MarketingDashboardAdmin` |
| System | `system_dashboard` | `SystemDashboardAdmin` |
| Config | `config_dashboard` | `ConfigDashboardAdmin` |
| Branch | `branch_dashboard` | `BranchDashboardAdmin` |
| Menu | `menu_dashboard` | `MenuDashboardAdmin` |
| Mess/Tiffin | `mess_dashboard` | `MessDashboardAdmin` |

## Key KPI Metrics

### Revenue
- Total Revenue (MTD, YTD)
- AOV (Average Order Value)
- Revenue per Branch
- GMV (Gross Merchandise Value)

### Orders
- Total Orders Count
- Orders by Status
- Order Completion Rate
- Average Preparation Time
- Average Delivery Time

### Customers
- New vs Returning Customers
- Customer Lifetime Value (CLV)
- Churn Rate
- Subscription Renewal Rate (Tiffin)

### Operations
- Active Riders Online
- Average Rider Rating
- Delivery Success Rate
- On-Time Delivery %

## API Endpoints

```
GET /api/analytics/overview        # KPI summary (today, MTD, YTD)
GET /api/analytics/revenue         # Revenue breakdown ?period=30d|90d|1y
GET /api/analytics/orders          # Order analytics ?branchId=xxx
GET /api/analytics/customers       # Customer metrics
GET /api/analytics/riders          # Rider performance
GET /api/analytics/menu            # Popular items, categories
GET /api/analytics/marketing       # Offer/coupon effectiveness
```

## Chart Types Used

- **Line charts**: Revenue trends, order volume over time
- **Bar charts**: Branch comparison, daily orders
- **Pie/Donut charts**: Order status distribution, payment methods
- **KPI cards**: Top-level numbers with % change vs last period

## Partner Analytics

Partner portal shows filtered analytics for their restaurant only:
- File: `apps/partner/partner-portal/src/app/AnalyticsAdmin.tsx`
- Data scoped to `restaurantId` from JWT

## Data Aggregation Pattern

```typescript
// Example: Revenue aggregation
const revenue = await prisma.$queryRaw`
  SELECT 
    DATE_TRUNC('day', "createdAt") as day,
    SUM("totalAmount") as revenue,
    COUNT(*) as orders
  FROM "Order"
  WHERE "status" = 'DELIVERED'
    AND "createdAt" >= ${startDate}
  GROUP BY day
  ORDER BY day ASC
`;
```
