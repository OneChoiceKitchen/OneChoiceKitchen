import { BadRequestException } from '@nestjs/common';

import { WorkingDayService } from './working-day.service';

describe('WorkingDayService', () => {
  const service = new WorkingDayService();

  it('adds three weekdays while preserving the India-local time', () => {
    const tuesdayAtTenIst = new Date('2026-07-14T04:30:00.000Z');

    expect(service.addWorkingDays(tuesdayAtTenIst, 3)).toEqual(
      new Date('2026-07-17T04:30:00.000Z'),
    );
  });

  it('skips weekends', () => {
    const fridayAtTenIst = new Date('2026-07-17T04:30:00.000Z');

    expect(service.addWorkingDays(fridayAtTenIst, 3)).toEqual(
      new Date('2026-07-22T04:30:00.000Z'),
    );
  });

  it('skips configured holidays', () => {
    const fridayAtTenIst = new Date('2026-07-17T04:30:00.000Z');

    expect(service.addWorkingDays(fridayAtTenIst, 1, new Set(['2026-07-20']))).toEqual(
      new Date('2026-07-21T04:30:00.000Z'),
    );
  });

  it('rejects invalid offsets', () => {
    expect(() => service.addWorkingDays(new Date(), -1)).toThrow(BadRequestException);
  });
});
