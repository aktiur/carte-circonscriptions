import {ReplaySubject} from 'rxjs/ReplaySubject';

import {transition} from 'd3-transition';
import {zoom, zoomIdentity} from 'd3-zoom';
import {select, selectAll, event} from 'd3-selection';
import {geoPath} from 'd3-geo';

import {feature, mesh} from 'topojson';

import {maxZoom} from '../config';

import './map.css';

const width = 1000, height = 900;
const circosStrokeWidth = 0.5;
const departementsStrokeWidth = 2;

export default function (circonscriptions, boundaries, metric$) {

  function map (elem) {
    elem.attr('class', 'map');

    const svg = elem.append('svg')
      .attr('width', width)
      .attr('height', height);

    setupFilter(svg);

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
      .on('click', clicked)
      .merge(circos);

    function clicked(d, i, nodes) {
      selectAll('.selected').classed('selected', false);
      select(this).classed('selected', true).raise();
      circonscription$.next(d.properties);
    }

    function changeFill(metric) {
      const t = transition('circonscriptions').duration(1000);

      circos.transition(t)
        .attr('fill', metric);

      if(legend) {
        legend.remove();
      }

      legend = svg.append('g')
        .attr('transform', `translate(${width/2},850)`)
        .call(metric.legend);
    }

    const departements = zoomableGroup.append('path')
      .datum(boundaries)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', departementsStrokeWidth)
      .attr('d', path);

    metric$.subscribe(changeFill);

    function zoomed() {
      zoomableGroup.attr('transform', event.transform);
      circos.attr('stroke-width', circosStrokeWidth / event.transform.k);
      departements.attr('stroke-width', departementsStrokeWidth / event.transform.k);
    }

    const mapZoom = zoom()
      .scaleExtent([1, maxZoom])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    svg.call(mapZoom);

    const t = transition().duration(250);

    elem.append('button')
      .attr('class', 'reset-button fa fa-refresh')
      .on('click', () => svg.transition(t).call(mapZoom.transform, zoomIdentity));
  }

  const circonscription$ = map.circonscription$ = new ReplaySubject(1);

  return map;
}


const filterContent = `
<feMorphology operator="dilate" radius="4" in="SourceAlpha" result="thicken" />

<!-- Use a gaussian blur to create the soft blurriness of the glow -->
<feGaussianBlur in="thicken" stdDeviation="7" result="blurred" />

<!-- Change the colour -->
<!--<feFlood flood-color="rgb(200,200,200)" result="glowColor" />-->

<!-- Color in the glows -->
<!--<feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />-->

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
    .attr('height', '200')
    .attr('width', '200')
    .attr('x', '-80')
    .attr('y', '-80')
    .html(filterContent);
}
