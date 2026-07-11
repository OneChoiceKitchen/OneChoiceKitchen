import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async getRewards() {
    return this.prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointsRequired: 'asc' }
    });
  }

  async getAllRewardsAdmin() {
    return this.prisma.reward.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createReward(data: any) {
    return this.prisma.reward.create({
      data: {
        name: data.name,
        description: data.description,
        pointsRequired: data.pointsRequired,
        rewardType: data.rewardType || 'DISCOUNT',
        code: data.code,
        imageUrl: data.imageUrl,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });
  }

  async updateReward(id: string, data: any) {
    return this.prisma.reward.update({
      where: { id },
      data
    });
  }

  async deleteReward(id: string) {
    return this.prisma.reward.delete({
      where: { id }
    });
  }

  async getPointHistory(userId: string) {
    return this.prisma.pointHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getUserLoyaltyData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true }
    });
    const history = await this.getPointHistory(userId);
    return { points: user?.loyaltyPoints || 0, history };
  }

  async redeemReward(userId: string, rewardId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward) throw new NotFoundException('Reward not found');

    if (!reward.isActive) throw new BadRequestException('Reward is not active');
    if (user.loyaltyPoints < reward.pointsRequired) {
      throw new BadRequestException('Not enough points');
    }

    // Transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Deduct points
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { decrement: reward.pointsRequired } }
      });

      // 2. Record redemption
      await tx.rewardRedemption.create({
        data: {
          userId,
          rewardId,
          points: reward.pointsRequired
        }
      });

      // 3. Add to history
      await tx.pointHistory.create({
        data: {
          userId,
          action: `Redeemed ${reward.name}`,
          points: reward.pointsRequired,
          type: 'redeem'
        }
      });

      return { success: true, newBalance: updatedUser.loyaltyPoints, reward: reward };
    });
  }
}
