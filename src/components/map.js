import {transition} from 'd3-transition';
import {geoPath, geoAlbers} from 'd3-geo';
import {zoom, zoomIdentity} from 'd3-zoom';
import {event} from 'd3-selection';

import topology from '../data/topo.json';
import {feature} from 'topojson';

import {addListener} from './selector';
import {showDetails} from './details';
import metrics from '../metrics';
import insetConfig from '../insets';

import './map.css';

const width = 900, height = 900;

export default function (elem) {
  elem.attr('class', 'map');

  const svg = elem.append('svg')
    .attr('width', width)
    .attr('height', height);

  const hexagoneElem = svg.append('g').call(hexagone);

  function zoomed() {
    hexagoneElem.attr('transform', event.transform);
  }

  const mapZoom = zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

  const t = transition().duration(250);

  svg.call(mapZoom);

  const insets = elem.append('div').call(addInsets);


  elem.append('button')
    .attr('class', 'reset-button fa fa-refresh')
    .on('click', () => svg.transition(t).call(mapZoom.transform, zoomIdentity));

}

function hexagone(elem, t) {

  elem.attr('class', 'hexagone');

  const hexagoneFeatures = feature(topology, topology.objects.hexagone);
  // const departementsFeatures = feature(topology, topology.objects.departements);

  const projection = geoAlbers()
    .center([0, 46.72])
    .rotate([-2, 0])
    .parallels([40, 50])
    .scale(5500)
    .translate([width / 2, height / 2]);

  const path = geoPath()
    .projection(projection);

  // elem.append('g').attr('class', 'departements')
  //   .append('path')
  //   .datum(departementsFeatures)
  //   .attr('d', path)
  //   .attr('fill', 'none')
  //   .attr('stroke', '#000');

  function draw(metric) {
    const t = transition('hexagone').duration(750);

    let circos = elem.selectAll('.circos').data(hexagoneFeatures.features, function (d) {
      return d.id;
    });

    metric.init(hexagoneFeatures.features);

    circos = circos.enter()
      .append('path')
      .attr('class', 'circos')
      .attr('d', path)
      .merge(circos)
      .on('click', showDetails)
      .transition(t)
      .attr('fill', d => metric.getColor(d));
  }

  draw(metrics[0]);
  addListener(draw);
}

function addInsets(elem) {
  elem.attr('class', 'insets');

  for (let territoire of insetConfig) {
    territoire.feature = feature(topology, topology.objects[territoire.key]);
    territoire.projection = geoAlbers()
      .center([0, territoire.centroid[1]])
      .rotate([-territoire.centroid[0], 0])
      .parallels(territoire.parallels)
      .scale(territoire.scale)
      .translate([territoire.dimensions[0] / 2, territoire.dimensions[1] / 2]);
    territoire.path = geoPath().projection(territoire.projection);
  }

  const insetDiv = elem.selectAll('inset')
    .data(insetConfig);

  const insetSvg = insetDiv.enter()
    .append('div')
    .attr('class', d => `inset inset-${d.key}`)
    .append('svg')
    .attr('width', d => d.dimensions[0])
    .attr('height', d => d.dimensions[1]);


  function draw(metric) {
    const t = transition('insets').duration(750);

    let paths = insetSvg.selectAll('path')
      .data((d) => d.feature.features.map(f => Object.assign({}, f, {parent: d})), (d) => d.id);

    paths = paths.enter()
      .append('path')
      .attr('class', 'circos')
      .attr('d', (d) => d.parent.path(d))
      .merge(paths)
      .on('click', showDetails)
      .transition(t)
      .attr('fill', d => metric.getColor(d));
  }

  draw(metrics[0]);
  addListener(draw);
}