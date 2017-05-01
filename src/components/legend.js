import {addListener} from './selector';

export default function (elem) {
  elem.attr('class', 'legend');

  const svg = elem.append('svg')
    .attr('width', 600)
    .attr('height', 120);

  let g = null;

  function draw(metric) {
    if (g) {
      g.remove();
    }
    g = svg.append('g')
      .attr('class', 'legendLinear')
      .attr('transform', 'translate(20, 20)');

    const legend = metric.getLegend()
      .orient('horizontal')
      .shapeWidth(50)
      .shapeHeight(40)
      .shapePadding(60);

    g.call(legend);
  }

  addListener(draw);
}
