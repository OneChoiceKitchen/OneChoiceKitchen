import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(createBookingDto: CreateBookingDto) {
    const { tenantId, serviceType, eventStartDate, eventEndDate } = createBookingDto;
    const start = new Date(eventStartDate);
    const end = new Date(eventEndDate);

    if (start >= end) {
      throw new ConflictException('eventStartDate must be before eventEndDate');
    }

    // Conflict Resolution: Check for overlapping bookings
    const overlappingBooking = await this.prisma.booking.findFirst({
      where: {
        tenantId,
        serviceType,
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
        OR: [
          {
            eventStartDate: {
              lt: end,
            },
            eventEndDate: {
              gt: start,
            },
          },
        ],
      },
    });

    if (overlappingBooking) {
      throw new ConflictException(
        `The selected service is already booked for the specified time slot.`
      );
    }

    return this.prisma.booking.create({
      data: {
        ...createBookingDto,
        eventStartDate: start,
        eventEndDate: end,
      },
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.booking.findMany({
      where: { tenantId },
      orderBy: { eventStartDate: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(id: string, tenantId: string, updateBookingDto: UpdateBookingDto) {
    const existing = await this.findOne(id, tenantId);

    if (updateBookingDto.eventStartDate || updateBookingDto.eventEndDate) {
      const start = updateBookingDto.eventStartDate ? new Date(updateBookingDto.eventStartDate) : existing.eventStartDate;
      const end = updateBookingDto.eventEndDate ? new Date(updateBookingDto.eventEndDate) : existing.eventEndDate;

      if (start >= end) {
        throw new ConflictException('eventStartDate must be before eventEndDate');
      }

      const overlappingBooking = await this.prisma.booking.findFirst({
        where: {
          tenantId,
          serviceType: existing.serviceType,
          id: { not: id },
          status: {
            notIn: ['CANCELLED', 'COMPLETED'],
          },
          OR: [
            {
              eventStartDate: {
                lt: end,
              },
              eventEndDate: {
                gt: start,
              },
            },
          ],
        },
      });

      if (overlappingBooking) {
        throw new ConflictException(
          `The selected service is already booked for the specified time slot.`
        );
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        ...updateBookingDto,
        eventStartDate: updateBookingDto.eventStartDate ? new Date(updateBookingDto.eventStartDate) : undefined,
        eventEndDate: updateBookingDto.eventEndDate ? new Date(updateBookingDto.eventEndDate) : undefined,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.booking.delete({
      where: { id },
    });
  }
}
