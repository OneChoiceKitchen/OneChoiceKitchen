import { render } from '@testing-library/react';
import App from './app';

jest.mock('@org/ui-design-system', () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn(), info: jest.fn(), warning: jest.fn() }),
  GlobalMetadataInjector: () => null,
  BrandFooter: () => null,
}));

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });
});
