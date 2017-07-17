import {scaleOrdinal, scaleLinear, scaleQuantile, scaleBand, scaleThreshold} from 'd3-scale';
import {axisBottom} from 'd3-axis';
import {extent, zip, range} from 'd3-array';

import {
  nuanceColors,
  abstentionMetricParameters,
  NaNColor,
  intFormat,
  simplePercentFormat
} from './config';

/* une métrique définit :
 *
 * - une méthode init qui prend la liste des données et initialise le domaine des échelles, par exemple
 * - une propriété label qui renvoie le nom à afficher sur le bouton
 * - une méthode getColor qui prend un point de donnée et renvoie la couleur à afficher
 * - une méthode setUpLegend qui affiche la légende au bon endroit
 */

const legendWidth = 480;


function thresholdLegend({tickValues, extent, scale, title}) {
  // scale used to draw the legend
  const x = scaleLinear()
    .domain(extent)
    .range([-legendWidth / 2, legendWidth / 2]);

  const axis = axisBottom(x)
    .tickSize(13)
    .tickValues([extent[0], ...tickValues, extent[1]])
    .tickFormat(d => d === extent[1] ? simplePercentFormat(d) : intFormat(100 * d));

  return function legend(elem) {
    elem.call(axis);

    //elem.select('.domain').remove();
    elem.selectAll('rect')
      .data(scale.range().map(color => {
        const d = scale.invertExtent(color);
        if (d[0] === null) d[0] = x.domain()[0];
        if (d[1] === null) d[1] = x.domain()[1];
        return d;
      }))
      .enter().insert('rect', '.tick')
      .attr('height', 8)
      .attr('x', d => x(d[0]))
      .attr('width', d => (x(d[1]) - x(d[0])))
      .attr('fill', d => scale(d[0]));

    elem.append("text")
      .attr('fill', 'black')
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .attr("x", -legendWidth / 2)
      .attr("y", -6)
      .text(title);
  };
}

function labeledLegend({labels, colors, width, title}) {
  const elems = zip(labels, colors);
  const x = scaleBand()
    .domain(colors)
    .range([-width / 2, width / 2])
    .paddingInner(0.2);

  return function legend(elem) {
    elem.attr('font-size', 10)
      .attr('font-family', 'sans-serif');

    elem.selectAll('rect').data(colors)
      .enter()
      .append('rect')
      .attr('height', 8)
      .attr('y', 0)
      .attr('x', x)
      .attr('width', x.bandwidth())
      .attr('fill', d => d);

    elem.selectAll('text').data(elems)
      .enter()
      .append('text')
      .attr('fill', 'black')
      .attr("text-anchor", "middle")
      .attr("x", d => (x(d[1]) + x.bandwidth() / 2))
      .attr("y", 16)
      .attr("dy", "0.71em")
      .html(d => d[0]);

    elem.append("text")
      .attr('fill', 'black')
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .attr("x", -width/2)
      .attr("y", -6)
      .text(title);
  };
}

function quantileMetric(data, accessor, colors, title) {
  const values = data.map(accessor);
  const scale = scaleQuantile()
    .domain(values)
    .range(colors);

  function metric(d) {
    const v = accessor(d);
    return Number.isNaN(v) ? NaNColor : scale(v);
  }

  metric.legend = thresholdLegend({
    tickValues: scale.quantiles(),
    extent: extent(values),
    scale,
    title
  });

  return metric;
}

// métriques générales
function meilleurCandidatMetrique() {
  function accessor(d) {
    return d.candidats[0].nuance;
  }

  function metric(d) {
    return nuanceScale(accessor(d));
  }

  metric.legend = labeledLegend({
    labels: nuances,
    colors: nuanceScale.range(),
    width: 600,
    title: 'Nuance arrivée en tête dans la circonscription'
  });

  return metric;
}
meilleurCandidatMetrique.label = "Candidat en tête";


function abstentionMetrique({data}) {
  const colors = abstentionMetricParameters.colorFamily[5];

  function accessor(d) {
    return (d.inscrits - d.votants) / d.inscrits;
  }

  return quantileMetric(data, accessor, colors, "Niveau de l'abstention en part des inscrits");
}
abstentionMetrique.label = abstentionMetricParameters.label;

const nuances = Object.keys(nuanceColors).slice(0, -1);
const nuanceScale = scaleOrdinal()
  .domain(nuances)
  .range(nuances.map(n => nuanceColors[n]));


// métriques spécifiques

function partVoixExprimesMetrique({nuance, data}) {
  const codes = nuance.codes;
  const colors = nuance.colorFamily[5];
  const title = `Part des voix exprimés en faveur du candidat ${nuance.label}`

  function accessor(d) {
    const candidat = d.candidats.find(c => codes.includes(c.nuance));
    return candidat ? candidat.voix / d.exprimes : NaN;
  }

  return quantileMetric(data, accessor, colors, title);
}
partVoixExprimesMetrique.label = "Part voix exprimées";


function rangArriveMetrique({nuance}) {
  const codes = nuance.codes;
  // inverser pour que 1er corresponde à la plus forte saturation
  const colors = nuance.colorFamily[4].slice().reverse();
  const labels = ['1<sup>er</sup>', '2<sup>e</sup>', '3<sup>e</sup>', '4<sup>e</sup>+'];
  const title = `Position d'arrivée du candidat ${nuance.label}`;

  function accessor(d) {
    const i = d.candidats.findIndex(c => codes.includes(c.nuance));
    return i !== -1 ? i : NaN;
  }

  const scale = scaleThreshold()
    .range(colors)
    .domain(range(1, 5));

  function metric(d) {
    const v = accessor(d);
    return Number.isNaN(v) ? NaNColor : scale(v);
  }

  metric.legend = labeledLegend({
    labels, colors, width: 200, title
  });

  return metric;
}
rangArriveMetrique.label = "Rang candidat";


export const generalMetrics = [meilleurCandidatMetrique, abstentionMetrique];
export const specificMetrics = [partVoixExprimesMetrique, rangArriveMetrique];
