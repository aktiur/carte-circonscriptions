import {scaleOrdinal, scaleQuantile, scaleThreshold} from 'd3-scale';
import {extent, range} from 'd3-array';

import {labeledLegend, thresholdLegend, noDataLegend} from './components/legends';
import {
  nuanceColors,
  abstentionMetricParameters,
  NaNColor,
} from './config';

/* une métrique définit :
 *
 * - une méthode init qui prend la liste des données et initialise le domaine des échelles, par exemple
 * - une propriété label qui renvoie le nom à afficher sur le bouton
 * - une méthode getColor qui prend un point de donnée et renvoie la couleur à afficher
 * - une méthode setUpLegend qui affiche la légende au bon endroit
 */


function quantileMetric(data, accessor, colors, legendTitle) {
  const values = data.map(accessor).filter(v => !Number.isNaN(v));

  if (values.length === 0) {
    const metric = function() {
      return NaNColor;
    };

    metric.legend = noDataLegend({title: legendTitle});
    return metric;
  }

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
    title: legendTitle
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

  metric.title = "Candidats en tête";

  return metric;
}
meilleurCandidatMetrique.label = "Candidat en tête";


function abstentionMetrique({data}) {
  const colors = abstentionMetricParameters.colorFamily[5];

  function accessor(d) {
    return (d.inscrits - d.votants) / d.inscrits;
  }

  const metric =  quantileMetric(data, accessor, colors, "Niveau de l'abstention en part des inscrits");

  metric.title = "Niveau de l'abstention";

  return metric;
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

  const singleQualifier = Array.isArray(nuance.qualifier) ? nuance.qualifier[0] : nuance.qualifier;
  const pluralQualifier = Array.isArray(nuance.qualifier) ? nuance.qualifier[1] : nuance.qualifier;

  const legendTitle = `Part des voix exprimés en faveur du meilleur candidat ${singleQualifier}`;

  function accessor(d) {
    const candidat = d.candidats.find(c => codes.includes(c.nuance));
    return candidat ? candidat.voix / d.exprimes : NaN;
  }

  const metric =  quantileMetric(data, accessor, colors, legendTitle);

  metric.title = `Niveau des candidats ${pluralQualifier}`;

  return metric;
}
partVoixExprimesMetrique.label = "Part voix exprimées";


function rangArriveMetrique({nuance}) {
  const codes = nuance.codes;
  // inverser pour que 1er corresponde à la plus forte saturation
  const colors = nuance.colorFamily[4].slice().reverse();
  const labels = ['1<sup>er</sup>', '2<sup>e</sup>', '3<sup>e</sup>', '4<sup>e</sup>+'];

  const singleQualifier = Array.isArray(nuance.qualifier) ? nuance.qualifier[0] : nuance.qualifier;
  const pluralQualifier = Array.isArray(nuance.qualifier) ? nuance.qualifier[1] : nuance.qualifier;

  const legendTitle = `Position d'arrivée du meilleur candidat ${singleQualifier}`;

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
    labels, colors, width: 200, legendTitle
  });

  metric.title = `Rang des candidats ${pluralQualifier}`;

  return metric;
}
rangArriveMetrique.label = "Rang candidat";


export const generalMetrics = [meilleurCandidatMetrique, abstentionMetrique];
export const specificMetrics = [partVoixExprimesMetrique, rangArriveMetrique];
