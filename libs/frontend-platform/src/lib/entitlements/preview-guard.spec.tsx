import { fireEvent, render, screen } from '@testing-library/react';

import { authStore } from '../auth/auth-store';
import { PreviewGuard } from './preview-guard';

describe('PreviewGuard', () => {
  beforeEach(() => authStore.clearSession());

  it('blocks write controls in preview mode and offers subscription CTA', () => {
    const onSave = jest.fn();
    const onSubscribe = jest.fn();
    render(
      <PreviewGuard
        moduleId="HRMS"
        requiredEntitlement="WRITE"
        onSubscribe={onSubscribe}
      >
        <button type="button" onClick={onSave}>
          Save employee
        </button>
      </PreviewGuard>,
    );

    fireEvent.click(screen.getByText('Save employee'));
    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByRole('note', { name: 'HRMS subscription required' }),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: /subscribe to unlock/i }),
    );
    expect(onSubscribe).toHaveBeenCalledWith('HRMS');
  });

  it('allows preview users to render read-only module content', () => {
    render(
      <PreviewGuard moduleId="ANALYTICS" requiredEntitlement="READ">
        <p>Analytics preview</p>
      </PreviewGuard>,
    );

    expect(screen.getByText('Analytics preview')).toBeTruthy();
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('allows controls when the tenant has sufficient entitlement', () => {
    authStore.setEntitlement('CRM', 'MANAGE');
    const onClick = jest.fn();
    render(
      <PreviewGuard moduleId="CRM" requiredEntitlement="WRITE">
        <button type="button" onClick={onClick}>
          Save customer
        </button>
      </PreviewGuard>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save customer' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports hiding restricted controls with a safe fallback', () => {
    render(
      <PreviewGuard
        moduleId="INVENTORY"
        requiredEntitlement="MANAGE"
        mode="hide"
        fallback={<span>Inventory subscription required</span>}
      >
        <button type="button">Delete stock</button>
      </PreviewGuard>,
    );

    expect(screen.getByText('Inventory subscription required')).toBeTruthy();
    expect(screen.queryByText('Delete stock')).toBeNull();
  });
});
