import {transition} from 'd3-transition';
import {geoPath, geoAlbers} from 'd3-geo';
import {zoom, zoomIdentity} from 'd3-zoom';
import {event} from 'd3-selection';
import {ascending} from 'd3-array';

import topology from '../data/topo.json';
import supp from '../data/supp.json';

import {feature, mesh} from 'topojson';

import {addListener} from './selector';
import {showDetails} from './details';
import insetConfig from '../insets';

import './map.css';

const width = 900, height = 900;
const contoursWidth = 1;

export default function (elem) {
  elem.attr('class', 'map');

  const hex_fe = elem.append('div').attr('class', 'hex_fe');

  const svg = hex_fe.append('svg')
    .attr('width', width)
    .attr('height', height);

  const hexagoneElem = svg.append('g').call(hexagone);

  function zoomed() {
    hexagoneElem.attr('transform', event.transform);
    hexagoneElem.select('.contours').selectAll('path').attr('stroke-width', contoursWidth / event.transform.k);
  }

  const mapZoom = zoom()
    .scaleExtent([1, 10])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", zoomed);

  const t = transition().duration(250);

  svg.call(mapZoom);

  elem.append('div').call(addInsets);

  hex_fe.append('div').call(fe);

  elem.append('button')
    .attr('class', 'reset-button fa fa-refresh')
    .on('click', () => svg.transition(t).call(mapZoom.transform, zoomIdentity));

}

function hexagone(elem, t) {

  elem.attr('class', 'hexagone');

  const hexagoneFeatures = feature(topology, topology.objects.hexagone);
  const departementsFeatures = feature(topology, topology.objects.departements);

  const projection = geoAlbers()
    .center([0, 46.57723270181815])
    .rotate([-2, 0])
    .parallels([40, 50])
    .scale(5500)
    .translate([width / 2, height / 2]);

  const path = geoPath()
    .projection(projection);

  const circoLayer = elem.append('g').attr('class', 'circo-layer');

  elem.append('g').attr('class', 'contours')
    .append('path')
    .datum(departementsFeatures)
    .attr('d', path)
    .attr('stroke-width', contoursWidth);

  function draw(metric) {
    const t = transition('hexagone').duration(750);

    let circos = circoLayer.selectAll('.circo').data(hexagoneFeatures.features, function (d) {
      return d.id;
    });

    metric.init(hexagoneFeatures.features);

    circos = circos.enter()
      .append('path')
      .attr('class', 'circo')
      .attr('d', path)
      .merge(circos)
      .on('click', showDetails)
      .transition(t)
      .attr('fill', d => metric.getColor(d));
  }

  addListener(draw);
}

function addInsets(elem) {
  elem.attr('class', 'insets');

  for (let territoire of insetConfig) {
    territoire.feature = feature(topology, topology.objects[territoire.key]);
    territoire.mesh = mesh(topology, topology.objects[territoire.key], (a, b) => a === b);
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

  const circosG = insetSvg.append('g');

  insetSvg.append('path')
    .datum(d => Object.assign({}, d.mesh, {parent: d}))
    .attr('class', 'contours')
    .attr('d', d => d.parent.path(d))
    .attr('stroke-width', contoursWidth);

  function draw(metric) {
    const t = transition('insets').duration(750);

    let paths = circosG.selectAll('.circo')
      .data((d) => d.feature.features.map(f => Object.assign({}, f, {parent: d})), (d) => d.id);

    paths = paths.enter()
      .append('path')
      .attr('class', 'circo')
      .attr('d', (d) => d.parent.path(d))
      .on('click', showDetails)
      .merge(paths)
      .transition(t)
      .attr('fill', d => metric.getColor(d));
  }

  addListener(draw);
}

function fe(elem) {
  const circosFE = supp
    .filter(d => d.departement === 'ZZ')
    .sort((a, b) => ascending(a.circo, b.circo))
    .map(d => ({properties: d}));

  elem.attr('class', 'fe');

  const dimension = 70;

  const feSVGs = elem.selectAll('.fe').data(circosFE)
    .enter()
    .append('div')
    .attr('class', d => `fe fe-${d.properties.circo}`)
    .append('svg')
    .attr('width', dimension)
    .attr('height', dimension);

  const g = feSVGs.append('g')
    .attr('class', 'circo')
    .attr('transform', `translate(${dimension / 2},${dimension / 2})`)
    .on('click', showDetails);

  const circles = g
    .append('circle')
    .attr('stroke-width', contoursWidth)
    .attr('stroke', 'black')
    .attr('r', 0.95 * (dimension / 2));

  g
    .append('text')
    .attr('dy', '.3em')
    .text(d => d.properties.circo.toString());

  function draw(metric) {
    const t = transition('insets').duration(750);

    circles
      .transition(t)
      .attr('fill', d => metric.getColor(d));
  }

  addListener(draw);
}
