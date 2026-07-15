import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WebhookAuditLog } from './WebhookAuditLog';

describe('WebhookAuditLog', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    ) as jest.Mock;
    Storage.prototype.getItem = jest.fn(() => 'test-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    render(<WebhookAuditLog />);
    expect(screen.getByText('Loading audit logs...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Webhook Audit Log')).toBeInTheDocument();
    });
    
    expect(screen.getByText('No logs found.')).toBeInTheDocument();
  });

  it('fetches and displays logs', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 'log1',
            webhookId: 'hook1',
            event: 'ORDER_CREATED',
            payload: {},
            responseStatus: 200,
            responseBody: 'OK',
            success: true,
            createdAt: new Date().toISOString()
          }
        ]),
      })
    );

    render(<WebhookAuditLog />);
    
    await waitFor(() => {
      expect(screen.getByText('ORDER_CREATED')).toBeInTheDocument();
    });
    
    expect(screen.getAllByText('Success').length).toBeGreaterThan(0);
  });
});
