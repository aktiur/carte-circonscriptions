import {ReplaySubject} from 'rxjs/ReplaySubject';

import {transition} from 'd3-transition';
import {zoom, zoomIdentity} from 'd3-zoom';
import {event} from 'd3-selection';
import {geoPath} from 'd3-geo';

import {feature, mesh} from 'topojson';


import './map.css';

const width = 1000, height = 900;
const circosStrokeWidth = 0.5;
const departementsStrokeWidth = 1.5;

export default function (topology, metric$) {

  const data = feature(topology, topology.objects.circonscriptions).features;

  function map (elem) {
    elem.attr('class', 'map');

    const svg = elem.append('svg')
      .attr('width', width)
      .attr('height', height);

    const zoomableGroup = svg.append('g');
    const circosGroup = zoomableGroup.append('g');

    let circos = circosGroup.selectAll('.circonscription')
      .data(data);

    const path = geoPath().projection(null);

    circos = circos.enter().append('path')
      .attr('class', 'circonscription')
      .attr('d', path)
      .attr('stroke', 'black')
      .attr('stroke-width', circosStrokeWidth)
      .on('click', d => circonscription$.next(d.properties))
      .merge(circos);

    function changeFill(metric) {
      metric.init(data);
      const t = transition('circonscriptions').duration(1000);

      circos.transition(t)
        .attr('fill', d => metric.getColor(d));
    }

    const departements = zoomableGroup.append('path')
      .datum(mesh(topology, topology.objects.circonscriptions, function(a, b) {
        return a === b || a.properties.departement !== b.properties.departement;
      }))
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
      .scaleExtent([1, 10])
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
