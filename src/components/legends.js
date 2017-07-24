import {scaleLinear, scaleBand} from 'd3-scale';
import {axisBottom} from 'd3-axis';
import {zip} from 'd3-array';

import {NaNColor, intFormat, simplePercentFormat} from '../config';

const legendRectHeight = 8;
const thresholdLegendWidth = 480;

export function thresholdLegend({tickValues, extent, scale, title}) {
  // scale used to draw the legend
  const x = scaleLinear()
    .domain(extent)
    .range([-thresholdLegendWidth / 2, thresholdLegendWidth / 2]);

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
      .attr('height', legendRectHeight)
      .attr('x', d => x(d[0]))
      .attr('width', d => (x(d[1]) - x(d[0])))
      .attr('fill', d => scale(d[0]));

    elem.append("text")
      .attr('fill', 'black')
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .attr("x", -thresholdLegendWidth / 2)
      .attr("y", -6)
      .text(title);
  };
}

export function labeledLegend({labels, colors, width, title}) {
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
      .attr('height', legendRectHeight)
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
      .attr("x", -width / 2)
      .attr("y", -6)
      .text(title);
  };
}

export function noDataLegend({title}) {
  return function (elem) {
    elem.attr('font-size', 10)
      .attr('font-family', 'sans-serif');

    elem.append('rect')
      .attr('fill', NaNColor)
      .attr('x', -thresholdLegendWidth / 2)
      .attr('width', thresholdLegendWidth)
      .attr('height', legendRectHeight);

    elem.append("text")
      .attr('fill', 'black')
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .attr("x", -thresholdLegendWidth / 2)
      .attr("y", -6)
      .text(title);
  };
}
