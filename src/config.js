import {formatLocale} from 'd3-format';
import {scaleSequential} from 'd3-scale';
import {
  schemeReds,
  schemePurples,
  schemeOranges,
  schemeGreys,
  schemeBlues,
  schemeGreens
} from 'd3-scale-chromatic';

export const locale = formatLocale({
  decimal: ',',
  thousands: ' ',
  grouping: [3],
  currency: ['', '\u202f€'],
  percent: '\u202f%'
});

export const percentFormat = locale.format('.1%');
export const intFormat = locale.format(',d');

export const NaNColor = 'rgb(200,200,200)';

export const scrutins = [
  {label: 'Légis. 1', selector: 'legislatives-1'},
  {label: 'Légis. 2', selector: 'legislatives-2'},
  {label: 'Prés. 1', selector: 'presidentielle-1'},
  {label: 'Prés. 2', selector: 'presidentielle-2'}
];

export const nuanceMetrics = [
  {
    nuances: ['FI'],
    label: 'FI',
    colors: schemeReds[5]
  },
  {
    nuances: ['REM', 'MDM'],
    label: 'EM',
    colors: schemeOranges[5],
  },
  {
    nuances: ['FN'],
    label: 'FN',
    colors: schemeGreys[5]
  },
  {
    nuances: ['LR', 'UDI'],
    label: 'LR',
    colors: schemePurples[5]
  },
  {
    nuances: ['SOC'],
    label: 'PS',
    colors: schemeReds[5]
  },
  {
    nuances: ['ECO'],
    label: 'EELV',
    colors: schemeGreens[5]
  }
];

export const abstentionMetricParameters = {
  colors: schemeBlues[5],
  label: 'Abs.'
};

export const nuanceColors = {
  'EXG': "#c41114",
  'COM': "#ff3f00",
  'FI': "#ff3f19",
  'SOC': "#f88573",
  'RDG': '#ffb494',
  'DVG': '#e8b68c',
  'ECO': '#19ac31',
  'DIV': "#e5d9a1",
  'REG': '#ff5df9',
  'REM': '#ffc600',
  'MDM': '#ffa144',
  'UDI': "#65aeb9",
  'LR': "#23408f",
  'DVD': "#057c85",
  'DLF': "#6f6f9c",
  'FN': "#2f3e4b",
  'EXD': '#000',
  'Abstention': '#120958'
};
