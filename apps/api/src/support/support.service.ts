import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  // FAQs
  async getActiveFaqs() {
    return this.prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllFaqsAdmin() {
    return this.prisma.fAQ.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createFaq(data: any) {
    return this.prisma.fAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category || 'General',
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });
  }

  async updateFaq(id: string, data: any) {
    return this.prisma.fAQ.update({
      where: { id },
      data
    });
  }

  async deleteFaq(id: string) {
    return this.prisma.fAQ.delete({
      where: { id }
    });
  }

  // Tickets
  async createTicket(data: any) {
    return this.prisma.supportTicket.create({
      data: {
        email: data.email,
        subject: data.subject,
        message: data.message,
        userId: data.userId,
        status: 'OPEN'
      }
    });
  }

  async getUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllTicketsAdmin() {
    return this.prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateTicketStatus(id: string, status: string) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status }
    });
  }
}
