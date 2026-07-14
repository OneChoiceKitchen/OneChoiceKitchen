import { BadRequestException } from '@nestjs/common';

export type ServiceType =
  | 'FOOD_ORDERING'
  | 'TIFFIN'
  | 'DINING'
  | 'HALL_BOOKING'
  | 'CAKE_ORDERING'
  | 'PHOTOGRAPHY'
  | 'DECORATION';

export interface TenantCartItem {
  serviceType: ServiceType;
  tenantId: string;
  branchId: string | null;
}

export interface TenantCart {
  items: readonly TenantCartItem[];
}

export function assertAllFoodItemsBelongToSameTenantAndBranch(
  cart: TenantCart,
  incomingItem: TenantCartItem,
): void {
  const conflictingItem = cart.items.find(
    (item) =>
      item.serviceType === 'FOOD_ORDERING' &&
      (item.tenantId !== incomingItem.tenantId || item.branchId !== incomingItem.branchId),
  );

  if (conflictingItem) {
    throw new BadRequestException({
      code: 'FOOD_CART_TENANT_BRANCH_CONFLICT',
      message: 'Food items in one cart must belong to the same restaurant and branch',
    });
  }
}

export function validateCartItemInvariant(cart: TenantCart, incomingItem: TenantCartItem): void {
  if (incomingItem.serviceType === 'FOOD_ORDERING') {
    assertAllFoodItemsBelongToSameTenantAndBranch(cart, incomingItem);
  }
}
