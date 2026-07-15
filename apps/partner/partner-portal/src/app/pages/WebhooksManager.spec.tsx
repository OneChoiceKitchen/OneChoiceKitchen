import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WebhooksManager } from './WebhooksManager';

describe('WebhooksManager', () => {
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
    render(<WebhooksManager />);
    expect(screen.getByText('Loading webhooks...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Webhooks Management')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Register New Webhook')).toBeInTheDocument();
    expect(screen.getByText('No webhooks configured.')).toBeInTheDocument();
  });

  it('fetches and displays webhooks', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 'hook1',
            url: 'https://example.com/hook1',
            events: ['ORDER_CREATED'],
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ]),
      })
    );

    render(<WebhooksManager />);
    
    await waitFor(() => {
      expect(screen.getByText('https://example.com/hook1')).toBeInTheDocument();
    });
  });
});
