import {scaleOrdinal} from 'd3-scale';
import {extent} from 'd3-array';

import {nuanceMetrics, nuanceColors, abstentionMetricParameters, NaNColor} from './config';

/* une métrique définit :
 *
 * - une méthode init qui prend la liste des données et initialise le domaine des échelles, par exemple
 * - une propriété label qui renvoie le nom à afficher sur le bouton
 * - une méthode getColor qui prend un point de donnée et renvoie la couleur à afficher
 * - une méthode setUpLegend qui affiche la légende au bon endroit
 */


class Metric {
  constructor({scale}) {
    this.scale = scale;
  }

  init(data) {
    const domain = extent(data.map(d => this._getValue(d)));
    this.scale.domain(domain);
  }

  getColor(d) {
    const v = this._getValue(d);
    return Number.isNaN(v) ? NaNColor : this.scale(v);
  }
}

class VoteMetric extends Metric {
  constructor({scale, nuances, label}) {
    super({scale});
    this.nuances = nuances;
    this.label = label;
  }

  _getValue(d) {
    const candidat = d.candidats.find(c => this.nuances.includes(c.nuance));
    return candidat ? candidat.voix / d.exprimes : NaN;
  }
}

export const votesMetrics = nuanceMetrics.map(descr => new VoteMetric(descr));

const abstentionMetric = Object.assign(
  new Metric({scale: abstentionMetricParameters.scale}),
  {
    label: abstentionMetricParameters.label,
    _getValue(d) {
      return (d.inscrits - d.votants) / d.inscrits;
    }
  }
);

const nuances = Object.keys(nuanceColors);

const premierScale = scaleOrdinal()
  .domain(nuances)
  .range(nuances.map(n => nuanceColors[n]));

const premierMetric = Object.assign(
  new Metric({scale: premierScale, dotScale: null}),
  {
    label: '1er',
    _getValue(d) {
      return d.candidats[0].nuance;
    },
    init: function() {},
  }
);

export default [premierMetric, abstentionMetric, ...votesMetrics];
