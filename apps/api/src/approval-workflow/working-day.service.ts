import { BadRequestException, Injectable } from '@nestjs/common';

const INDIA_STANDARD_TIME_OFFSET_MS = 330 * 60 * 1000;

@Injectable()
export class WorkingDayService {
  addWorkingDays(start: Date, workingDays: number, holidays: ReadonlySet<string> = new Set()): Date {
    if (!Number.isInteger(workingDays) || workingDays < 0) {
      throw new BadRequestException('Working-day offset must be a non-negative integer');
    }

    const indiaLocalDate = new Date(start.getTime() + INDIA_STANDARD_TIME_OFFSET_MS);
    let addedDays = 0;

    while (addedDays < workingDays) {
      indiaLocalDate.setUTCDate(indiaLocalDate.getUTCDate() + 1);
      if (this.isWorkingDay(indiaLocalDate, holidays)) {
        addedDays += 1;
      }
    }

    return new Date(indiaLocalDate.getTime() - INDIA_STANDARD_TIME_OFFSET_MS);
  }

  private isWorkingDay(indiaLocalDate: Date, holidays: ReadonlySet<string>): boolean {
    const dayOfWeek = indiaLocalDate.getUTCDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.has(this.toDateKey(indiaLocalDate));
  }

  private toDateKey(indiaLocalDate: Date): string {
    const year = indiaLocalDate.getUTCFullYear();
    const month = String(indiaLocalDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(indiaLocalDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
