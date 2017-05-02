import {scaleSequential, scaleOrdinal, scaleThreshold} from 'd3-scale';
import {extent} from 'd3-array';
import {
  interpolateReds, interpolatePurples, interpolateOranges, interpolateGreys, interpolateBlues, schemeReds, schemeSet1
} from 'd3-scale-chromatic';
import {legendColor} from 'd3-svg-legend';

import {percentFormat} from './config';

/* une métrique définit :
 *
 * - une méthode init qui prend la liste des données et initialise le domaine des échelles, par exemple
 * - une propriété label qui renvoie le nom à afficher sur le bouton
 * - une méthode getColor qui prend un point de donnée et renvoie la couleur à afficher
 * - une méthode setUpLegend qui affiche la légende au bon endroit
 */

class VoteMetric {
  constructor({key, label, scale}) {
    this.key = key;
    this.label = label;
    this.scale = scale;
  }

  _getValue(d) {
    return d.properties.votes[this.key] / d.properties.totaux.exprimes;
  }

  get description() {
    return `Part des votes exprimés pour ${this.label}`;
  }

  init(data) {
    const domain = extent(data.map(d => this._getValue(d)));
    this.scale.domain(domain);
  }

  getColor(d) {
    return this.scale(this._getValue(d));
  }

  getLegend() {
    return legendColor()
      .scale(this.scale)
      .title(this.description)
      .labelFormat(percentFormat);
  }
}

const votesDescr = [
  {
    key: 'MÉLENCHON',
    label: 'Mélenchon',
    scale: scaleSequential(interpolateReds)
  },
  {
    key: 'MACRON',
    label: 'Macron',
    scale: scaleSequential(interpolateOranges),
  },
  {
    key: 'LE PEN',
    label: 'Le Pen',
    scale: scaleSequential(interpolateGreys)
  },
  {
    key: 'FILLON',
    label: 'Fillon',
    scale: scaleSequential(interpolatePurples)
  },
  {
    key: 'HAMON',
    label: 'Hamon',
    scale: scaleSequential(interpolateReds)
  },
];

export const votesMetrics = votesDescr.map(descr => new VoteMetric(descr));

function orderOf(data, key) {
  const score = data[key];
  return Object.keys(data).reduce((sum, candidat) => sum + (data[candidat] > score), 1);
}


export const simpleMetrics = [
  {
    key: 'abstention',
    label: 'Abstention',
    scale: scaleSequential(interpolateBlues),
    _getValue(d) {
      return d.properties.totaux.abstentions / d.properties.totaux.inscrits;
    },
    init(data) {
      const domain = extent(data.map(d => this._getValue(d)));
      this.scale.domain(domain);
    },
    getColor(d) {
      return this.scale(this._getValue(d));
    },
    getLegend() {
      return legendColor()
        .scale(this.scale)
        .title('Abstenstion (en part des inscrits)')
        .labelFormat(percentFormat);
    }
  },
  {
    key: 'rang',
    label: 'Rang de Mélenchon',
    scale: scaleOrdinal(schemeReds[5]).domain([5, 4, 3, 2, 1]),
    init() {
    },
    getColor(d) {
      return this.scale(orderOf(d.properties.votes, 'MÉLENCHON'));
    },
    getLegend() {
      return legendColor()
        .scale(this.scale)
        .title(this.label);
    }
  },
  {
    key: 'qualifie',
    label: '> 12,5 % des inscrits',
    scale: scaleOrdinal().range(["#ff5943", "#e2e2e2"]).domain('O', 'N'),
    init() {
    },
    getColor(d) {
      const voteMelenchon = d.properties.votes['MÉLENCHON'];
      const inscrits = d.properties.totaux.inscrits;

      return this.scale((voteMelenchon / inscrits) >= .125 ? 'O' : 'N');
    },
    getLegend() {
      return legendColor()
        .scale(this.scale)
        .title('La barre des 12,5 % des inscrits a-t-elle été dépassée ?');
    }
  },
  {
    key: 'force',
    label: 'Catégories de score',
    scale: scaleThreshold().range(schemeReds[4]).domain([.1, .2, .3]),
    init() {
    },
    getColor(d)
    {
      return this.scale(d.properties.votes['MÉLENCHON'] / d.properties.totaux.exprimes);
    },
    getLegend() {
      return legendColor()
        .scale(this.scale)
        .title('Score de Mélenchon (en part des exprimés)')
        .labels(['- de 10 %', '10 - 20 %', '20 - 30 %', '+ de 30 %']);
    }
  },
  {
    key: 'candidature',
    label: 'Candidatures FI',
    scale: scaleOrdinal().range(schemeSet1.slice(0, 3)).domain(['M', 'F', '']),
    init() {

    },
    getColor(d) {
      return this.scale(d.properties.candidature.genre);
    },
    getLegend() {
      return legendColor()
        .scale(this.scale)
        .title('Présence et genre du titulaire')
        .labels(['Masculin', 'Féminin', 'Sans candidat']);
    }
  }
];

export default votesMetrics.concat(simpleMetrics);
