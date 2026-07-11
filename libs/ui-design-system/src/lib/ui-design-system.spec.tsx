import { render } from '@testing-library/react';

import UiDesignSystem from './ui-design-system';

describe('UiDesignSystem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiDesignSystem />);
    expect(baseElement).toBeTruthy();
  });
});
