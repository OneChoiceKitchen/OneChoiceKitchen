import { SetMetadata } from '@nestjs/common';
import type { PortalCode } from '@prisma/client';

export const PORTALS_KEY = 'security:portals';

export const Portals = (...portals: PortalCode[]) => SetMetadata(PORTALS_KEY, portals);
