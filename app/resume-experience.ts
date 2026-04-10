const EXPERIENCE_START_DATE = {
  year: 2025,
  monthIndex: 2,
  day: 1,
};

export const getExperienceDurationText = (currentDate = new Date()) => {
  const startDate = Date.UTC(
    EXPERIENCE_START_DATE.year,
    EXPERIENCE_START_DATE.monthIndex,
    EXPERIENCE_START_DATE.day,
  );
  const endDate = Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate(),
  );

  if (endDate <= startDate) {
    return "0.0 year";
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysWorked = (endDate - startDate) / millisecondsPerDay;
  const yearsWorked = daysWorked / 365.25;

  return `${yearsWorked.toFixed(1)} year`;
};

export const getDynamicExperienceDescription = (currentDate = new Date()) =>
  `Bringing ${getExperienceDurationText(currentDate)} of hands-on full-stack development experience across internship and full-time work`;
