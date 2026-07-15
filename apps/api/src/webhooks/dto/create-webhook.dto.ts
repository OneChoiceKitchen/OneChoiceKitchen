import { IsString, IsEnum, IsUrl } from 'class-validator';

export enum WebhookEventTrigger {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
}

export class CreateWebhookDto {
  @IsEnum(WebhookEventTrigger)
  eventTrigger: WebhookEventTrigger;

  @IsUrl()
  targetUrl: string;
}
