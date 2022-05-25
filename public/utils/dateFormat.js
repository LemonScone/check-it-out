const { intervalToDuration, formatDuration } = require('date-fns');
const formatDistanceStrict = require('date-fns/formatDistanceStrict');

module.exports.getDistanceDate = (startDate, finishedDate) => {
  const formatDistanceLocale = {
    xSeconds: (count) => `${count}sec`,
    xMinutes: (count) => `${count}min`,
    xHours: (count) => `${count}hour`,
  };

  const shortLocale = {
    formatDistance: (token, count) => formatDistanceLocale[token](count),
  };

  const seconds = parseInt(
    formatDistanceStrict(new Date(startDate), new Date(finishedDate), {
      unit: 'second',
    }),
  );
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  const distance = formatDuration(duration, {
    format: ['hours', 'minutes', 'seconds'],
    locale: shortLocale,
  });

  return distance;
};
