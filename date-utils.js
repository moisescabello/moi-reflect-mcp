const DEFAULT_LOCALE = 'en-CA';

const createFormatter = (timeZone, locale = DEFAULT_LOCALE) => new Intl.DateTimeFormat(locale, {
  timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

export function resolveTimeZone(requestedTimeZone, locale = DEFAULT_LOCALE) {
  const fallbackTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  if (!requestedTimeZone) {
    return {
      effectiveTimeZone: fallbackTimeZone,
      requestedTimeZone: undefined,
      fallbackTimeZone,
      isFallback: false,
      locale
    };
  }

  try {
    createFormatter(requestedTimeZone, locale).format(new Date());
    return {
      effectiveTimeZone: requestedTimeZone,
      requestedTimeZone,
      fallbackTimeZone,
      isFallback: false,
      locale
    };
  } catch (error) {
    return {
      effectiveTimeZone: fallbackTimeZone,
      requestedTimeZone,
      fallbackTimeZone,
      isFallback: true,
      locale,
      error
    };
  }
}

export function createDailyNoteFormatter(timeZone, locale = DEFAULT_LOCALE) {
  const formatter = createFormatter(timeZone, locale);

  return function formatDailyNoteDate(date = new Date(), offsetDays = 0) {
    const parts = formatter.formatToParts(date);
    const year = Number(parts.find(part => part.type === 'year')?.value);
    const month = Number(parts.find(part => part.type === 'month')?.value);
    const day = Number(parts.find(part => part.type === 'day')?.value);

    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      throw new Error('Unable to determine calendar date components');
    }

    const calendarDate = new Date(Date.UTC(year, month - 1, day + offsetDays));
    return formatter.format(calendarDate);
  };
}
