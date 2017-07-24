import {ReplaySubject} from 'rxjs/ReplaySubject';

import {transition} from 'd3-transition';
import {zoom, zoomIdentity} from 'd3-zoom';
import {select, selectAll, event} from 'd3-selection';
import {geoPath} from 'd3-geo';

import {feature, mesh} from 'topojson';

import {maxZoom, mapCredit} from '../config';

import './map.css';

const width = 1000, height = 870;
const circosStrokeWidth = 0.5;
const departementsStrokeWidth = 2;

export default function (circonscriptions, boundaries, metric$) {

  function map (elem) {
    elem.attr('class', 'map');

    const svg = elem.append('svg')
      .attr('width', width)
      .attr('height', height);

    setupFilter(svg);
    addCredit(svg);

    const zoomableGroup = svg.append('g');
    const circosGroup = zoomableGroup.append('g');

    let circos = circosGroup.selectAll('.circonscription')
      .data(circonscriptions);

    let legend = null;

    const path = geoPath().projection(null);

    circos = circos.enter().append('path')
      .attr('class', 'circonscription')
      .attr('d', path)
      .attr('stroke', 'black')
      .attr('stroke-width', circosStrokeWidth)
      .on('click', selected)
      .merge(circos);

    const departements = zoomableGroup.append('path')
      .datum(boundaries)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', departementsStrokeWidth)
      .attr('d', path);

    metric$.subscribe(metricChanged);

    const mapZoom = zoom()
      .scaleExtent([1, maxZoom])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    svg.call(mapZoom);

    const t = transition().duration(250);

    elem.append('button')
      .attr('class', 'reset-button fa fa-refresh')
      .on('click', resetZoom);


    function metricChanged(metric) {
      const t = transition('circonscriptions').duration(1000);

      circos.transition(t)
        .attr('fill', metric);

      if(legend) {
        legend.remove();
      }

      legend = svg.append('g')
        .attr('transform', `translate(${width/2},${height-50})`)
        .call(metric.legend);
    }

    function selected(d, i, nodes) {
      selectAll('.selected').classed('selected', false);
      select(this).classed('selected', true).raise();
      circonscription$.next(d.properties);
    }

    function zoomed() {
      zoomableGroup.attr('transform', event.transform);
      circos.attr('stroke-width', circosStrokeWidth / event.transform.k);
      departements.attr('stroke-width', departementsStrokeWidth / event.transform.k);
    }

    function resetZoom() {
      svg.transition(t).call(mapZoom.transform, zoomIdentity);
    }


  }

  const circonscription$ = map.circonscription$ = new ReplaySubject(1);

  return map;
}


const filterContent = `
<feMorphology operator="dilate" radius="4" in="SourceAlpha" result="thicken" />

<!-- Use a gaussian blur to create the soft blurriness of the glow -->
<feGaussianBlur in="thicken" stdDeviation="7" result="blurred" />

<!--	Layer the effects together -->
<feMerge>
  <feMergeNode in="blurred"/>
  <feMergeNode in="SourceGraphic"/>
</feMerge>
`;


function setupFilter(svg) {
  const defs = svg.append('defs');
  const filter = defs.append('filter')
    .attr('id', 'glowF')
    .attr('filterUnits', 'userSpaceOnUse')
    .attr('height', height)
    .attr('width', width)
    .attr('x', 0)
    .attr('y', 0)
    .html(filterContent);
}

function addCredit(svg) {
  svg.append('text')
    .attr('x', width-5)
    .attr('y', height-5)
    .attr('text-anchor', 'end')
    .attr('font-size', 10)
    .html(mapCredit);
}