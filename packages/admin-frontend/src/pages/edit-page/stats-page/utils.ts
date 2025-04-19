import { intervalToDuration } from 'date-fns';

export const formatTimeMinAndSec = (timeMs: number) => {
  const duration = intervalToDuration({ start: 0, end: timeMs });

  return duration.minutes && duration.seconds
    ? `${duration.minutes} мин ${duration.seconds} сек`
    : duration.minutes
      ? `${duration.minutes} сек`
      : `${duration.seconds ?? 0} сек`;
};
