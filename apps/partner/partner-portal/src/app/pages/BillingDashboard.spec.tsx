import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BillingDashboard from './BillingDashboard';

// Mock child components
jest.mock('./SubscriptionManager', () => () => <div data-testid="subscription-manager">Subscription Manager Content</div>);
jest.mock('./InvoiceHistory', () => () => <div data-testid="invoice-history">Invoice History Content</div>);

describe('BillingDashboard', () => {
  it('renders header and initial tab correctly', () => {
    render(<BillingDashboard />);
    expect(screen.getByText('Billing & Subscriptions')).toBeInTheDocument();
    expect(screen.getByTestId('subscription-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('invoice-history')).not.toBeInTheDocument();
  });

  it('switches tabs when clicked', () => {
    render(<BillingDashboard />);
    
    const invoiceTabButton = screen.getByText('Invoice History');
    fireEvent.click(invoiceTabButton);

    expect(screen.getByTestId('invoice-history')).toBeInTheDocument();
    expect(screen.queryByTestId('subscription-manager')).not.toBeInTheDocument();

    const subscriptionTabButton = screen.getByText('Subscription Plans');
    fireEvent.click(subscriptionTabButton);

    expect(screen.getByTestId('subscription-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('invoice-history')).not.toBeInTheDocument();
  });
});
