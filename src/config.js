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

export const mapCredit = "Contours des circonscriptions par l'Atelier de cartographie de Sciences Po et Toxicode";

export const percentFormat = locale.format('.1%');
export const simplePercentFormat = locale.format('.0%');
export const intFormat = locale.format(',d');

export const NaNColor = 'rgb(200,200,200)';

export const maxZoom = 12;

export const elections = [
  {label: 'Présidentielle', selector: 'presidentielle', qualifier: "de l'élection présidentielle"},
  {label: 'Législatives', selector: 'legislatives', qualifier: "des élections législatives"}
];

export const tours = [
  {label: '1<sup>er</sup> tour', i: 1},
  {label: '2<sup>e</sup> tour', i: 2}
];

export const nuanceDescriptions = [
  {
    codes: ['COM'],
    label: 'COM',
    qualifier: ['communiste', 'communistes'],
    description: "Cela regroupe les candidats présentés par le Parti Communiste Français.",
    colorFamily: schemeReds
  },
  {
    codes: ['FI'],
    label: 'FI',
    qualifier: 'de la France insoumise',
    description: "Cela regroupe les candidats investis par la France insoumise. Cela inclut des candidats par" +
    "la suite élus qui n'ont pas rejoints le groupe politique formé par les députés de la France insoumise.",
    colorFamily: schemeReds
  },
  {
    codes: ['ECO'],
    label: 'ECO',
    qualifier: ['écologiste', 'écologistes'],
    description: "Il s'agit des candidats identifiés comme écologistes par le ministère de l'intérieur." +
    " Cela inclut notamment les candidats d'Europe Ecologie/Les Verts, mais aussi ceux d'autres formations" +
    " écologistes, le ministère de l'intérieur n'ayant pas choisi de comptabiliser EELV séparément cette année.",
    colorFamily: schemeGreens
  },
  {
    codes: ['SOC', 'RDG'],
    label: 'PS',
    qualifier: ['socialiste ou radical de gauche', 'socialistes et radicaux de gauche'],
    description: "Cela regroupe les candidats se présentant sous les étiquettes Parti Socialiste et Radicaux de Gauche.",
    colorFamily: schemeReds
  },
  {
    codes: ['REM', 'MDM'],
    label: 'EM',
    qualifier: 'En Marche! ou MoDem',
    description: "Cela regroupe les candidats se présentant sous les étiquettes La République en Marche et Modem.",
    colorFamily: schemeOranges,
  },
  {
    codes: ['LR', 'UDI'],
    label: 'LR',
    qualifier: ['républicain ou UDI', 'républicains et UDI'],
    description: "Cela regroupe les candidats se présentant sous les étiquettes Les Républicains et Union des Démocrates" +
    " Indépendants (UDI).",
    colorFamily: schemePurples
  },
  {
    codes: ['FN'],
    label: 'FN',
    qualifier: 'du Front National',
    description: "Il s'agit des candidats investis par le Front National.",
    colorFamily: schemeGreys
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
