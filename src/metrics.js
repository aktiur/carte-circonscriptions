import {scaleSequential, scaleOrdinal, scaleThreshold} from 'd3-scale';
import {extent} from 'd3-array';
import {
  interpolateReds, interpolatePurples, interpolateOranges, interpolateGreys, schemeReds, schemeSet1
} from 'd3-scale-chromatic';

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

  init(data) {
    const domain = extent(data.map(d => this._getValue(d)));
    this.scale.domain(domain);
  }

  getColor(d) {
    return this.scale(this._getValue(d));
  }

  setUpLegend(elem) {

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
    key: 'rang',
    label: 'Rang de Mélenchon',
    scale: scaleOrdinal(schemeReds[5]).domain([5, 4, 3, 2, 1]),
    init() {
    },
    getColor(d) {
      return this.scale(orderOf(d.properties.votes, 'MÉLENCHON'));
    },
    setupLegend(elem) {
    }
  },
  {
    key: 'qualifie',
    label: '> 12,5 % des inscrits',
    scale: scaleOrdinal(["#ff5943", "#e2e2e2"]).domain(true, false),
    init() {
    },
    getColor(d) {
      const voteMelenchon = d.properties.votes['MÉLENCHON'];
      const inscrits = d.properties.totaux.inscrits;

      return this.scale((voteMelenchon / inscrits) >= .125);
    },
    setUpLegend() {

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
    }
  },
  {
    key: 'candidature',
    label: 'Candidatures FI',
    scale: scaleOrdinal(schemeSet1).domain('M', 'F', ''),
    init() {

    },
    getColor(d) {
      return this.scale(d.properties.candidature.genre);
    }
  }
];

export default votesMetrics.concat(simpleMetrics);
