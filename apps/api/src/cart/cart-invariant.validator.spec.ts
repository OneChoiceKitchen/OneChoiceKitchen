import { BadRequestException } from '@nestjs/common';

import {
  assertAllFoodItemsBelongToSameTenantAndBranch,
  validateCartItemInvariant,
  type TenantCart,
  type TenantCartItem,
} from './cart-invariant.validator';

describe('cart tenant and branch invariant', () => {
  const foodItem: TenantCartItem = {
    serviceType: 'FOOD_ORDERING',
    tenantId: 'tenant-a',
    branchId: 'branch-a',
  };

  it('allows food from the same tenant and branch', () => {
    const cart: TenantCart = { items: [foodItem] };

    expect(() => assertAllFoodItemsBelongToSameTenantAndBranch(cart, foodItem)).not.toThrow();
  });

  it.each([
    [{ ...foodItem, tenantId: 'tenant-b' }, 'another tenant'],
    [{ ...foodItem, branchId: 'branch-b' }, 'another branch'],
  ])('rejects food from %s', (incomingItem) => {
    const cart: TenantCart = { items: [foodItem] };

    expect(() => validateCartItemInvariant(cart, incomingItem)).toThrow(BadRequestException);
  });

  it('allows mixed providers for non-food services', () => {
    const cart: TenantCart = { items: [foodItem] };
    const hallBooking: TenantCartItem = {
      serviceType: 'HALL_BOOKING',
      tenantId: 'tenant-b',
      branchId: null,
    };

    expect(() => validateCartItemInvariant(cart, hallBooking)).not.toThrow();
  });
});
