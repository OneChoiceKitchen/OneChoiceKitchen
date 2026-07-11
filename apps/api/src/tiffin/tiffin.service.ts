import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TiffinService {
  constructor(private prisma: PrismaService) {}

  async findAll(restaurantId?: string, branchId?: string, userLat?: number, userLng?: number) {
    const where: any = {};
    if (restaurantId) where.restaurantId = restaurantId;
    
    if (branchId) {
      where.OR = [
        { branchId },
        { branchId: null }
      ];
    }

    if (userLat !== undefined && userLng !== undefined && !Number.isNaN(userLat) && !Number.isNaN(userLng)) {
      const deliverySetting = await this.prisma.deliverySetting.findFirst();
      const margin = deliverySetting?.enableDistanceMargin ? (deliverySetting.distanceMarginValue || 0) : 0;
      
      const branches = await this.prisma.restaurantBranch.findMany({
        where: { lat: { not: null }, lng: { not: null } }
      });
      
      const MAX_RADIUS_KM = 5; // Tiffins are 5km
      
      const closeBranchIds = branches.filter(branch => {
        if (!branch.lat || !branch.lng) return false;
        const dist = this.calculateDistance(userLat, userLng, branch.lat, branch.lng);
        const inflatedDist = dist + margin;
        return inflatedDist <= MAX_RADIUS_KM;
      }).map(b => b.id);
      
      if (closeBranchIds.length === 0) {
        return [];
      }
      
      const locationOrClause = [
        { branchId: { in: closeBranchIds } },
        { branchId: null }
      ];
      
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: locationOrClause }
        ];
        delete where.OR;
      } else {
        where.OR = locationOrClause;
      }
    }

    return this.prisma.tiffinMenu.findMany({
      where: { ...where, isDeleted: false },
      orderBy: [
        { dayOfWeek: 'asc' },
        { mealType: 'asc' }
      ]
    });
  }

  async findByDate(date: string) {
    const targetDate = new Date(date);
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);
    return this.prisma.tiffinMenu.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { mealType: 'asc' },
    });
  }

  async findOne(id: string) {
    const menu = await this.prisma.tiffinMenu.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new NotFoundException(`Tiffin menu with id ${id} not found`);
    }
    return menu;
  }

  async create(data: any) {
    const existing = await this.prisma.tiffinMenu.findFirst({
      where: {
        restaurantId: data.restaurantId || null,
        branchId: data.branchId || null,
        dayOfWeek: data.dayOfWeek,
        mealType: data.mealType,
        dietType: data.dietType,
        isDeleted: false
      }
    });
    if (existing) {
      throw new BadRequestException(`A ${data.dietType} menu is already added for ${data.mealType} on ${data.dayOfWeek}.`);
    }

    return this.prisma.tiffinMenu.create({
      data: {
        name: data.name,
        description: data.description,
        mealType: data.mealType,
        dietType: data.dietType,
        dayOfWeek: data.dayOfWeek,
        image: data.image,
        youtubeUrl: data.youtubeUrl,
        price: data.price || 0,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        restaurantId: data.restaurantId,
        branchId: data.branchId
      },
    });
  }

  async update(id: string, data: any) {
    if (data.dayOfWeek && data.mealType && data.dietType) {
      const existing = await this.prisma.tiffinMenu.findFirst({
        where: {
          restaurantId: data.restaurantId || null,
          branchId: data.branchId || null,
          dayOfWeek: data.dayOfWeek,
          mealType: data.mealType,
          dietType: data.dietType,
          isDeleted: false,
          id: { not: id }
        }
      });
      if (existing) {
        throw new BadRequestException(`A ${data.dietType} menu is already added for ${data.mealType} on ${data.dayOfWeek}.`);
      }
    }

    return this.prisma.tiffinMenu.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        mealType: data.mealType,
        dietType: data.dietType,
        dayOfWeek: data.dayOfWeek,
        image: data.image,
        youtubeUrl: data.youtubeUrl,
        price: data.price,
        isAvailable: data.isAvailable,
        restaurantId: data.restaurantId,
        branchId: data.branchId
      },
    });
  }

  async getRecycledMenus(restaurantId?: string, branchId?: string) {
    const where: any = { isDeleted: true };
    if (restaurantId) where.restaurantId = restaurantId;
    if (branchId) {
      where.OR = [
        { branchId },
        { branchId: null }
      ];
    }
    return this.prisma.tiffinMenu.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }]
    });
  }

  async remove(id: string) {
    return this.prisma.tiffinMenu.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  async restoreMenu(id: string) {
    return this.prisma.tiffinMenu.update({
      where: { id },
      data: { isDeleted: false }
    });
  }

  async hardDeleteMenu(id: string) {
    return this.prisma.tiffinMenu.delete({
      where: { id },
    });
  }

  // --- TIFFIN FLYERS ---

  async getFlyers() {
    return this.prisma.tiffinFlyer.findMany({
      orderBy: { type: 'asc' }
    });
  }

  async updateFlyer(type: string, data: any) {
    return this.prisma.tiffinFlyer.upsert({
      where: { type },
      update: {
        title: data.title,
        imageUrl: data.imageUrl,
        isActive: data.isActive
      },
      create: {
        type: type,
        title: data.title || type,
        imageUrl: data.imageUrl,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });
  }

  // --- TIFFIN SUBSCRIPTION PLANS ---

  async getPlans(restaurantId?: string, branchId?: string) {
    const where: any = {};
    if (restaurantId) where.restaurantId = restaurantId;
    if (branchId) where.branchId = branchId;
    where.isDeleted = false;

    return this.prisma.tiffinPlan.findMany({
      where,
      orderBy: [
        { dietType: 'asc' },
        { monthlyPrice: 'desc' }
      ]
    });
  }

  async updatePlan(id: string, data: any) {
    return this.prisma.tiffinPlan.update({
      where: { id },
      data: {
        name: data.name,
        dietType: data.dietType,
        mealsPerDay: data.mealsPerDay,
        totalMeals: data.totalMeals,
        monthlyPrice: data.monthlyPrice,
        pricePerMeal: data.pricePerMeal,
        isBestValue: data.isBestValue,
        isActive: data.isActive,
        restaurantId: data.restaurantId,
        branchId: data.branchId
      }
    });
  }

  async createPlan(data: any) {
    return this.prisma.tiffinPlan.create({
      data: {
        name: data.name,
        dietType: data.dietType,
        mealsPerDay: data.mealsPerDay || 1,
        totalMeals: data.totalMeals || 30,
        monthlyPrice: data.monthlyPrice,
        pricePerMeal: data.pricePerMeal || 0,
        isBestValue: data.isBestValue || false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        restaurantId: data.restaurantId,
        branchId: data.branchId
      }
    });
  }

  async getRecycledPlans(restaurantId?: string, branchId?: string) {
    const where: any = { isDeleted: true };
    if (restaurantId) where.restaurantId = restaurantId;
    if (branchId) where.branchId = branchId;
    return this.prisma.tiffinPlan.findMany({
      where,
      orderBy: [{ dietType: 'asc' }, { monthlyPrice: 'desc' }]
    });
  }

  async deletePlan(id: string) {
    return this.prisma.tiffinPlan.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  async restorePlan(id: string) {
    return this.prisma.tiffinPlan.update({
      where: { id },
      data: { isDeleted: false }
    });
  }

  async hardDeletePlan(id: string) {
    return this.prisma.tiffinPlan.delete({
      where: { id }
    });
  }

  // --- TIFFIN TERMS ---

  async getTerms(restaurantId?: string, branchId?: string) {
    const where: any = { isActive: true, isDeleted: false };
    if (restaurantId) where.restaurantId = restaurantId;
    if (branchId) where.branchId = branchId;
    return this.prisma.tiffinTerm.findMany({
      where,
      orderBy: { order: 'asc' }
    });
  }

  async createTerm(data: any) {
    return this.prisma.tiffinTerm.create({
      data: {
        title: data.title,
        contentEn: data.contentEn,
        contentHi: data.contentHi,
        order: data.order || 0,
        restaurantId: data.restaurantId,
        branchId: data.branchId
      }
    });
  }

  async updateTerm(id: string, data: any) {
    return this.prisma.tiffinTerm.update({
      where: { id },
      data: {
        title: data.title,
        contentEn: data.contentEn,
        contentHi: data.contentHi,
        order: data.order,
        isActive: data.isActive,
        restaurantId: data.restaurantId,
        branchId: data.branchId
      }
    });
  }

  async getRecycledTerms(restaurantId?: string, branchId?: string) {
    const where: any = { isDeleted: true };
    if (restaurantId) where.restaurantId = restaurantId;
    if (branchId) where.branchId = branchId;
    return this.prisma.tiffinTerm.findMany({
      where,
      orderBy: { order: 'asc' }
    });
  }

  async deleteTerm(id: string) {
    return this.prisma.tiffinTerm.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  async restoreTerm(id: string) {
    return this.prisma.tiffinTerm.update({
      where: { id },
      data: { isDeleted: false }
    });
  }

  async hardDeleteTerm(id: string) {
    return this.prisma.tiffinTerm.delete({
      where: { id }
    });
  }

  // --- TIFFIN GLOBAL SETTINGS ---

  async getGlobalSettings(restaurantId?: string, branchId?: string) {
    const where: any = {};
    if (restaurantId) where.restaurantId = restaurantId;
    else where.restaurantId = null;

    if (branchId) where.branchId = branchId;
    else where.branchId = null;

    let settings = await this.prisma.tiffinGlobalSetting.findFirst({
      where
    });
    if (!settings) {
      settings = await this.prisma.tiffinGlobalSetting.create({
        data: { restaurantId: where.restaurantId, branchId: where.branchId }
      });
    }
    return settings;
  }

  async updateGlobalSettings(data: any) {
    const where: any = {};
    if (data.restaurantId) where.restaurantId = data.restaurantId;
    else where.restaurantId = null;

    if (data.branchId) where.branchId = data.branchId;
    else where.branchId = null;

    const existing = await this.prisma.tiffinGlobalSetting.findFirst({ where });

    if (existing) {
      return this.prisma.tiffinGlobalSetting.update({
        where: { id: existing.id },
        data: {
          deliveryIncludedKm: data.deliveryIncludedKm,
          extraKmCharge: data.extraKmCharge,
          shopPickupDiscountPct: data.shopPickupDiscountPct,
          notesText: data.notesText,
          qrCodeUrl: data.qrCodeUrl,
          breakfastTime: data.breakfastTime,
          breakfastYoutubeUrl: data.breakfastYoutubeUrl,
          lunchTime: data.lunchTime,
          lunchYoutubeUrl: data.lunchYoutubeUrl,
          dinnerTime: data.dinnerTime,
          dinnerYoutubeUrl: data.dinnerYoutubeUrl,
          trialDeliveryFee: data.trialDeliveryFee,
          trialPackagingFee: data.trialPackagingFee,
          minPauseDays: data.minPauseDays,
          upiId: data.upiId,
          paymentInstructions: data.paymentInstructions,
          advancePaymentRequired: data.advancePaymentRequired,
          businessName: data.businessName,
          businessAddress: data.businessAddress,
          contactNumbers: data.contactNumbers,
          restaurantId: data.restaurantId,
          branchId: data.branchId,
        }
      });
    } else {
      return this.prisma.tiffinGlobalSetting.create({
        data: {
          deliveryIncludedKm: data.deliveryIncludedKm ?? 3,
          extraKmCharge: data.extraKmCharge ?? 8,
          shopPickupDiscountPct: data.shopPickupDiscountPct ?? 5,
          notesText: data.notesText,
          qrCodeUrl: data.qrCodeUrl,
          breakfastTime: data.breakfastTime ?? '7 - 10 AM',
          breakfastYoutubeUrl: data.breakfastYoutubeUrl,
          lunchTime: data.lunchTime ?? '12 - 3 PM',
          lunchYoutubeUrl: data.lunchYoutubeUrl,
          dinnerTime: data.dinnerTime ?? '7 - 10 PM',
          dinnerYoutubeUrl: data.dinnerYoutubeUrl,
          trialDeliveryFee: data.trialDeliveryFee ?? 40,
          trialPackagingFee: data.trialPackagingFee ?? 15,
          minPauseDays: data.minPauseDays ?? 5,
          upiId: data.upiId,
          paymentInstructions: data.paymentInstructions,
          advancePaymentRequired: data.advancePaymentRequired ?? true,
          businessName: data.businessName ?? 'ONE CHOICE KITCHEN',
          businessAddress: data.businessAddress ?? 'MADHUBAN COLONY, NEAR ABHIYANTA NAGAR, PATNA - 27',
          contactNumbers: data.contactNumbers ?? '6299230165 / 7004838102',
          restaurantId: data.restaurantId,
          branchId: data.branchId,
        }
      });
    }
  }

  // --- TIFFIN HOLIDAYS ---

  async getHolidays(restaurantId?: string, branchId?: string) {
    const where: any = { isDeleted: false };
    if (restaurantId) where.restaurantId = restaurantId;
    if (branchId) where.branchId = branchId;
    return this.prisma.tiffinHoliday.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });
  }

  async createHoliday(data: any) {
    return this.prisma.tiffinHoliday.create({
      data: {
        title: data.title,
        date: data.date ? new Date(data.date) : null,
        isRecurring: data.isRecurring ?? false,
        recurringRule: data.recurringRule,
        isActive: data.isActive ?? true,
        restaurantId: data.restaurantId,
        branchId: data.branchId
      }
    });
  }

  async updateHoliday(id: string, data: any) {
    return this.prisma.tiffinHoliday.update({
      where: { id },
      data: {
        title: data.title,
        date: data.date ? new Date(data.date) : null,
        isRecurring: data.isRecurring,
        recurringRule: data.recurringRule,
        isActive: data.isActive,
        restaurantId: data.restaurantId,
        branchId: data.branchId
      }
    });
  }

  async getRecycledHolidays(restaurantId?: string, branchId?: string) {
    const where: any = { isDeleted: true };
    if (restaurantId) where.restaurantId = restaurantId;
    if (branchId) where.branchId = branchId;
    return this.prisma.tiffinHoliday.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });
  }

  async deleteHoliday(id: string) {
    return this.prisma.tiffinHoliday.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  async restoreHoliday(id: string) {
    return this.prisma.tiffinHoliday.update({
      where: { id },
      data: { isDeleted: false }
    });
  }

  async hardDeleteHoliday(id: string) {
    return this.prisma.tiffinHoliday.delete({
      where: { id }
    });
  }

  // --- TIFFIN OFFERS ---

  async getOffers() {
    return this.prisma.tiffinOffer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getAllOffers() {
    return this.prisma.tiffinOffer.findMany({
      orderBy: { createdAt: 'asc' }
    });
  }

  async createOffer(data: any) {
    return this.prisma.tiffinOffer.create({
      data: {
        title: data.title,
        description: data.description,
        discountPct: data.discountPct ?? 0,
        minBookings: data.minBookings ?? 0,
        imageUrl: data.imageUrl,
        appliesToTiffin: data.appliesToTiffin ?? true,
        appliesToMenu: data.appliesToMenu ?? false,
        appliesToHome: data.appliesToHome ?? false,
        isHero: data.isHero ?? false,
        isActive: data.isActive ?? true,
      }
    });
  }

  async updateOffer(id: string, data: any) {
    return this.prisma.tiffinOffer.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        discountPct: data.discountPct,
        minBookings: data.minBookings,
        imageUrl: data.imageUrl,
        appliesToTiffin: data.appliesToTiffin,
        appliesToMenu: data.appliesToMenu,
        appliesToHome: data.appliesToHome,
        isHero: data.isHero,
        isActive: data.isActive,
      }
    });
  }

  async deleteOffer(id: string) {
    return this.prisma.tiffinOffer.delete({
      where: { id }
    });
  }

  async seedPlans() {
    const plans = [
      { name: '3 TIMES DAILY', dietType: 'VEG', mealsPerDay: 3, totalMeals: 90, monthlyPrice: 5500, pricePerMeal: 61, isBestValue: false },
      { name: '2 TIMES DAILY', dietType: 'VEG', mealsPerDay: 2, totalMeals: 60, monthlyPrice: 4000, pricePerMeal: 67, isBestValue: true },
      { name: 'BREAKFAST ONLY', dietType: 'VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 1500, pricePerMeal: 50, isBestValue: false },
      { name: 'LUNCH ONLY', dietType: 'VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 2500, pricePerMeal: 83, isBestValue: false },
      { name: 'DINNER ONLY', dietType: 'VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 2500, pricePerMeal: 83, isBestValue: false },
      { name: '3 TIMES DAILY', dietType: 'NON_VEG', mealsPerDay: 3, totalMeals: 90, monthlyPrice: 7000, pricePerMeal: 78, isBestValue: false },
      { name: '2 TIMES DAILY', dietType: 'NON_VEG', mealsPerDay: 2, totalMeals: 60, monthlyPrice: 5000, pricePerMeal: 83, isBestValue: true },
      { name: 'BREAKFAST ONLY', dietType: 'NON_VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 1600, pricePerMeal: 53, isBestValue: false },
      { name: 'LUNCH ONLY', dietType: 'NON_VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 3000, pricePerMeal: 100, isBestValue: false },
      { name: 'DINNER ONLY', dietType: 'NON_VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 3000, pricePerMeal: 100, isBestValue: false },
    ];

    await this.prisma.tiffinPlan.deleteMany();
    return this.prisma.tiffinPlan.createMany({ data: plans });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}
