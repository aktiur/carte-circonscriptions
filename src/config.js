import {formatLocale} from 'd3-format';

export const locale = formatLocale({
  decimal: ',',
  thousands: ' ',
  grouping: [3],
  currency: ['', '€'],
});

export const percentFormat = locale.format('.1%');
