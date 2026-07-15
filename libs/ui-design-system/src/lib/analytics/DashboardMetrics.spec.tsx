import React from 'react';
import { render } from '@testing-library/react';
import { DashboardMetrics } from './DashboardMetrics';

describe('DashboardMetrics', () => {
  it('should render loading state when loading is true', () => {
    const { getByText } = render(
      <DashboardMetrics
        totalOrders={0}
        totalRevenue={0}
        activeInventoryAlerts={0}
        loading={true}
      />
    );
    expect(getByText('Loading metrics...')).toBeTruthy();
  });

  it('should render all metrics correctly', () => {
    const { getByText } = render(
      <DashboardMetrics
        totalOrders={150}
        totalRevenue={12500.5}
        activeInventoryAlerts={3}
      />
    );
    expect(getByText('150')).toBeTruthy();
    expect(getByText('₹12500.50')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });
});
