import get from 'lodash';
import {scaleSequential, scaleOrdinal} from 'd3-scale';
import {
  interpolateReds, interpolatePurples, interpolateOranges, interpolateGreys, interpol
} from 'd3-scale-chromatic';

const metrics = [
  {
    key: 'votes.MÉLENCHON',
    label: 'Mélenchon',
    colorScale: scaleSequential(interpolateReds)
  },
  {
    key: 'votes.MACRON',
    label: 'Macron',
    colorScale: scaleSequential(interpolateOranges),
  },
  {
    key: 'votes.LE PEN',
    label: 'Le Pen',
    colorScale: scaleSequential(interpolateGreys)
  },
  {
    key: 'votes.FILLON',
    label: 'Fillon',
    colorScale: scaleSequential(interpolatePurples)
  },
  {
    key: 'votes.HAMON',
    label: 'Hamon',
    colorScale: scaleSequential(interpolateReds)
  },
  {
    key: 'rang',
    label: 'Rang de Mélenchon',
    colorScale: scaleOrdinal()

  },
  {
    key: 'qualifie',
    label: '> 12,5 % des inscrits pour Mélenchon'
  },
  {
    key: 'force',
    label: 'Score de Mélenchon (en dizaines de %)'
  },
];
