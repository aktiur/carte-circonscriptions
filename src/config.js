import {formatLocale} from 'd3-format';
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
export const simplePercentFormat = locale.format('.0%');
export const intFormat = locale.format(',d');

export const NaNColor = 'rgb(200,200,200)';

export const maxZoom = 12;

export const scrutins = [
  {label: 'Présidentielle', selector: 'presidentielle'},
  {label: 'Législatives', selector: 'legislatives'}
];

export const nuanceDescriptions = [
  {
    codes: ['FI'],
    label: 'FI',
    description: "Les candidats identifiés sous l'étiquette France insoumise. Cela inclut des candidats par la suite" +
    " élus qui n'ont pas rejoints le groupe politique formé par les députés de la France insoumise.",
    colorFamily: schemeReds
  },
  {
    codes: ['REM', 'MDM'],
    label: 'EM',
    description: "Les candidats se présentant sous les étiquettes La République en Marche et Modem.",
    colorFamily: schemeOranges,
  },
  {
    codes: ['FN'],
    label: 'FN',
    description: "Les candidats sous présentant sous l'étiquette Front National.",
    colorFamily: schemeGreys
  },
  {
    codes: ['LR', 'UDI'],
    label: 'LR',
    description: "Les candidats se présentant sous les étiquettes Les Républicains et Union des Démocrates" +
    " Indépendants (UDI).",
    colorFamily: schemePurples
  },
  {
    codes: ['SOC', 'RDG'],
    label: 'PS',
    description: "Les candidats se présentant sous les étiquettes Parti Socialiste et Radicaux de Gauche.",
    colorFamily: schemeReds
  },
  {
    codes: ['ECO'],
    label: 'ECO',
    description: "Les candidats identifiés comme écologistes par le ministère de l'intérieur." +
    " Cela inclut notamment les candidats d'Europe Ecologie/Les Verts, mais aussi ceux d'autres formations" +
    " écologistes, le ministère de l'intérieur n'ayant pas choisi de comptabiliser EELV séparément cette année.",
    colorFamily: schemeGreens
  }
];

export const abstentionMetricParameters = {
  colorFamily: schemeBlues,
  label: 'Abstention'
};

export const nuanceColors = {
  'EXG': "#be1113",
  'COM': "#a90f00",
  'FI': "#f45532",
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
