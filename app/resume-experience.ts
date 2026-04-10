// File: app/resume-experience.ts
const EXPERIENCE_START_DATE = {
  year: 2025,
  monthIndex: 3,
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
    return "0 months";
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysWorked = (endDate - startDate) / millisecondsPerDay;
  const yearsWorked = daysWorked / 365.25;

  if (yearsWorked < 1) {
    const monthsWorked = Math.floor(daysWorked / 30.44);
    const unit = monthsWorked === 1 ? "month" : "months";
    return `${monthsWorked} ${unit}`;
  }
  const rounded = Number(yearsWorked.toFixed(1));
  const displayValue =
    rounded % 1 === 0 ? Math.floor(rounded) : rounded;

  const unit = displayValue === 1 ? "year" : "years";

  return `${displayValue} ${unit}`;
};

export const getDynamicExperienceDescription = (currentDate = new Date()) =>
  `Bringing ${getExperienceDurationText(currentDate)} of hands-on full-stack development experience across internship and full-time work`;
