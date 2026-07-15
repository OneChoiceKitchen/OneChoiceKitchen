import React from 'react';
import { render } from '@testing-library/react';
import { SalesChart } from './SalesChart';

describe('SalesChart', () => {
  const mockData = [
    { date: '2023-01-01', revenue: 100, orderCount: 5 },
    { date: '2023-01-02', revenue: 200, orderCount: 10 },
  ];

  it('should render loading state when loading is true', () => {
    const { getByText } = render(
      <SalesChart data={mockData} loading={true} />
    );
    expect(getByText('Loading chart...')).toBeTruthy();
  });

  it('should render chart title and data points', () => {
    const { getByText, getByTitle } = render(<SalesChart data={mockData} />);
    expect(getByText('7-Day Sales Trend')).toBeTruthy();
    
    // Check titles for tooltips
    expect(getByTitle('₹100.00 (5 orders)')).toBeTruthy();
    expect(getByTitle('₹200.00 (10 orders)')).toBeTruthy();
  });
});
