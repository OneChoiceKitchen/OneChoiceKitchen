import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUserContext } from './user-context.types';

export const UserContext = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUserContext>();
    const userContext = request.userContext;

    if (!userContext) {
      // Fallback for cases where UserContextGuard didn't populate userContext
      // but we still need the user ID from the JWT token
      if (data === 'userId' && request.user?.userId) {
        return request.user.userId;
      }
      return null;
    }

    return data ? (userContext as any)[data] : userContext;
  },
);
