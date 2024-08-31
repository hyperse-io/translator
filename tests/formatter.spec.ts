import { createFormatter } from '../src/formatter';

describe('Formatting plain numbers', () => {
  const order = {
    total: 123456 / 100,
    currencyCode: 'USD',
  };
  it('should correct render currency plan number', () => {
    // Renders "$1,234.56"
    const languageCode = 'en';

    const formatter = createFormatter({
      locale: languageCode,
    });

    expect(
      formatter.number(order.total, {
        style: 'currency',
        currency: order.currencyCode,
      })
    ).toBe('$1,234.56');

    expect(
      formatter.number(order.total, {
        style: 'currency',
        currency: 'GBP',
      })
    ).toBe('£1,234.56');
  });
});

describe('Formatting dates and times', () => {
  const languageCode = 'en';

  const formatter = createFormatter({
    locale: languageCode,
  });

  it('should correct render numeric datetime', () => {
    const dateTime = new Date('2020-11-20T10:36:01.516Z');
    expect(
      formatter.dateTime(dateTime, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    ).toBe('Nov 20, 2020');

    expect(
      formatter.dateTime(dateTime, {
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'UTC',
      })
    ).toBe('10:36 AM');
  });

  it('should correct format relative times', () => {
    let dateTime = new Date('2020-11-20T08:30:00.000Z');

    // At 2020-11-20T10:36:00.000Z, this will render "2 hours ago"
    expect(
      formatter.relativeTime(dateTime, new Date('2020-11-20T10:36:00.000Z'))
    ).toBe('2 hours ago');

    dateTime = new Date('2020-03-20T08:30:00.000Z');
    const now = new Date('2020-11-22T10:36:00.000Z');

    // Renders "247 days ago"
    expect(formatter.relativeTime(dateTime, { now, unit: 'day' })).toBe(
      '247 days ago'
    );
  });
});
