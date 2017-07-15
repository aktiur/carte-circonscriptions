import {scaleOrdinal, scaleLinear, scaleQuantile, scaleBand} from 'd3-scale';
import {axisBottom} from 'd3-axis';
import {extent} from 'd3-array';

import {nuanceMetrics, nuanceColors, abstentionMetricParameters, NaNColor, intFormat} from './config';

/* une métrique définit :
 *
 * - une méthode init qui prend la liste des données et initialise le domaine des échelles, par exemple
 * - une propriété label qui renvoie le nom à afficher sur le bouton
 * - une méthode getColor qui prend un point de donnée et renvoie la couleur à afficher
 * - une méthode setUpLegend qui affiche la légende au bon endroit
 */

const legendWidth = 480;


class Metric {
  constructor({scale}) {
    this.scale = scale;
  }

  init() {
  }

  getColor(d) {
    const v = this._getValue(d);
    return Number.isNaN(v) ? NaNColor : this.scale(v);
  }
}

class QuantileMetric extends Metric {
  constructor({colors}) {
    super({
      scale: scaleQuantile().range(colors)
    });
  }

  init(data) {
    const values = data.map(d => this._getValue(d));
    const [min, max] = extent(values);
    this.scale.domain(values);
    this.x = scaleLinear()
      .domain([min, max])
      .range([-legendWidth / 2, legendWidth / 2]);

    const tickValues = [min, ...this.scale.quantiles(), max];

    this.axis = axisBottom(this.x)
      .tickSize(13)
      .tickValues(tickValues)
      .tickFormat(d => intFormat(100 * d));
  }

  legend(elem) {
    elem.call(this.axis);
    elem.select('.domain').remove();
    elem.selectAll('rect')
      .data(this.scale.range().map(color => {
        const d = this.scale.invertExtent(color);
        if (d[0] === null) d[0] = this.x.domain()[0];
        if (d[1] === null) d[1] = this.x.domain()[1];
        return d;
      }))
      .enter().insert('rect', '.tick')
      .attr('height', 8)
      .attr('x', d => this.x(d[0]))
      .attr('width', d => (this.x(d[1]) - this.x(d[0])))
      .attr('fill', d => this.scale(d[0]));

    elem.append("text")
      .attr('fill', 'black')
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .attr("x", -legendWidth / 2)
      .attr("y", -6)
      .text(this.description);
  }
}

class VoteMetric extends QuantileMetric {
  constructor({colors, nuances, label}) {
    super({colors});
    this.nuances = nuances;
    this.label = label;
    this.description = `Part des voix exprimés aux candidats ${label}`;
  }

  _getValue(d) {
    const candidat = d.candidats.find(c => this.nuances.includes(c.nuance));
    return candidat ? candidat.voix / d.exprimes : NaN;
  }
}

export const votesMetrics = nuanceMetrics.map(descr => new VoteMetric(descr));

const abstentionMetric = Object.assign(
  new QuantileMetric({colors: abstentionMetricParameters.colors}),
  {
    label: abstentionMetricParameters.label,
    _getValue(d) {
      return (d.inscrits - d.votants) / d.inscrits;
    },
    description: "Part des inscrits s'étant abstenus"
  }
);

const nuances = Object.keys(nuanceColors).slice(0, -1);

const premierScale = scaleOrdinal()
  .domain(nuances)
  .range(nuances.map(n => nuanceColors[n]));

const premierMetric = Object.assign(
  new Metric({scale: premierScale, dotScale: null}),
  {
    label: '1er',
    description: 'Nuance du candidat avec le plus grand nombre de voix',
    _getValue(d) {
      return d.candidats[0].nuance;
    },
    legend(elem) {
      elem.attr('font-size', 10)
        .attr('font-family', 'sans-serif');

      const x = scaleBand()
        .domain(nuances)
        .range([-300, 300])
        .paddingInner(0.2);

      elem.selectAll('rect').data(nuances)
        .enter()
        .append('rect')
        .attr('height', 8)
        .attr('y', 0)
        .attr('x', x)
        .attr('width', x.bandwidth())
        .attr('fill', d => nuanceColors[d]);

      elem.selectAll('text').data(nuances)
        .enter()
        .append('text')
        .attr('fill', 'black')
        .attr("text-anchor", "middle")
        .attr("x", d => (x(d) + x.bandwidth() / 2))
        .attr("y", 16)
        .attr("dy", "0.71em")
        .text(d => d);

      elem.append("text")
        .attr('fill', 'black')
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("x", -300)
        .attr("y", -6)
        .text(this.description);

    }
  }
);

export default [premierMetric, abstentionMetric, ...votesMetrics];
