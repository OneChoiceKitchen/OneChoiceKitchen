import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async getUserReferrals(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        referralsMade: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      if (userId === 'demo-user-id') {
        return {
          referralCode: 'DEMO123',
          referrals: [],
          totalEarned: 0,
          totalCount: 0
        };
      }
      throw new NotFoundException('User not found');
    }

    const totalEarned = user.referralsMade
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.rewardPoints, 0);

    return {
      referralCode: user.referralCode,
      referrals: user.referralsMade,
      totalEarned,
      totalCount: user.referralsMade.length
    };
  }

  async getAllReferralsAdmin() {
    return this.prisma.referral.findMany({
      include: {
        referrer: { select: { name: true, email: true } },
        referredUser: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createReferral(referrerId: string, referredEmail: string) {
    return this.prisma.referral.create({
      data: {
        referrerId,
        referredEmail,
        status: 'PENDING',
        rewardPoints: 500
      }
    });
  }

  // Simulate a signup using a code
  async processReferralCode(referralCode: string, newUserEmail: string) {
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode }
    });
    if (!referrer) throw new NotFoundException('Invalid referral code');

    if (referrer.email === newUserEmail) throw new BadRequestException('Cannot refer yourself');

    // Create the PENDING referral record, it would be completed when the user actually signs up/buys
    return this.prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredEmail: newUserEmail,
        status: 'PENDING',
        rewardPoints: 500
      }
    });
  }
}
