import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MenuModule } from '../menu/menu.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { CronModule } from '../cron/cron.module';
import { PaymentModule } from '../payment/payment.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { SupportModule } from '../support/support.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { SeoService } from './services/seo.service';
import { SeoController } from './controllers/seo.controller';
import { MenuService } from './services/menu.service';
import { MenuController } from './controllers/menu.controller';
import { StaticPagesModule } from '../static-pages/static-pages.module';
import { TiffinModule } from '../tiffin/tiffin.module';
import { SlidersModule } from '../sliders/sliders.module';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { PartnersModule } from '../partners/partners.module';
import { RidersModule } from '../riders/riders.module';
import { StorageModule } from './storage/storage.module';
import { SettingsModule } from './settings/settings.module';
import { InventoryModule } from '../inventory/inventory.module';
import { EmployeesModule } from '../employees/employees.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { BranchesModule } from '../branches/branches.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { PayoutsModule } from '../payouts/payouts.module';
import { RefundsModule } from '../refunds/refunds.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { CorporateModule } from '../corporate/corporate.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { MapsModule } from '../maps/maps.module';
import { TablesModule } from '../tables/tables.module';
import { SearchModule } from '../search/search.module';
import { CollectionsModule } from '../collections/collections.module';
import { TasksModule } from '../tasks/tasks.module';
import { VenuesModule } from '../venues/venues.module';
import { EventPackagesModule } from '../event-packages/event-packages.module';
import { HallBookingsModule } from '../hall-bookings/hall-bookings.module';
import { EventCategoriesModule } from '../event-categories/event-categories.module';
import { ChatModule } from '../chat/chat.module';
import { PartnerPermissionsModule } from '../partner-permissions/partner-permissions.module';
import { SecurityContextModule } from './auth/security-context.module';
import { ApprovalWorkflowModule } from '../approval-workflow/approval-workflow.module';
import { BrandingModule } from '../branding/branding.module';

@Module({
  imports: [
    PrismaModule, 
    MenuModule, 
    SubscriptionModule, 
    CronModule,
    PaymentModule,
    NotificationsModule,
    BlogsModule,
    CommentsModule,
    LoyaltyModule,
    ReferralsModule,
    ReviewsModule,
    SupportModule,
    DeliveryModule,
    AuthModule,
    StaticPagesModule,
    TiffinModule,
    SlidersModule,
    UsersModule,
    OrdersModule,
    PartnersModule,
    RidersModule,
    StorageModule,
    SettingsModule,
    InventoryModule,
    EmployeesModule,
    FavoritesModule,
    BranchesModule,
    ReservationsModule,
    WaitlistModule,
    PayoutsModule,
    RefundsModule,
    ComplianceModule,
    CorporateModule,
    WhatsappModule,
    MapsModule,
    TablesModule,
    SearchModule,
    CollectionsModule,
    TasksModule,
    VenuesModule,
    EventCategoriesModule,
    EventPackagesModule,
    HallBookingsModule,
    ChatModule,
    PartnerPermissionsModule,
    SecurityContextModule,
    ApprovalWorkflowModule,
    BrandingModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController, SeoController, MenuController],
  providers: [AppService, SeoService, MenuService],
})
export class AppModule {}

// trigger webpack
