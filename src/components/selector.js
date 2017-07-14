import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/combineLatest';

import './selector.css';
import metrics from '../metrics';
import {scrutins, NaNColor} from '../config';

const metricWrapper = ([scrutin, metric]) => ({
  init: data => metric.init(data.map(d => d.properties[scrutin]).filter(d => d !== null)),
  getColor: d => d.properties[scrutin] === null ? NaNColor : metric.getColor(d.properties[scrutin]),
});

export default function () {

  const selector = function(elem) {
    elem.attr('class', 'selector');

    const scrutinSelector = elem.append('div').attr('class', 'scrutin');
    const metricSelector = elem.append('div').attr('class', 'metric');

    let scrutinOptions = scrutinSelector.selectAll('.option').data(scrutins);
    let scrutinOptionsEntering = scrutinOptions.enter()
      .append('div')
      .attr('class', 'option');

    scrutinOptionsEntering
      .append('input')
      .attr('type', 'radio')
      .property('checked', (d, i) => i === 0)
      .attr('name', 'scrutin')
      .attr('id', (d, i) => `scrutin-${i}`)
      .on('click', d => scrutin$.next(d.selector));

    scrutinOptionsEntering
      .append('label')
      .attr('for', (d, i) => `scrutin-${i}`)
      .text(d => d.label);

    let metricOptions = metricSelector.selectAll('.option').data(metrics).enter()
      .append('div')
      .attr('class', 'option');

    metricOptions
      .append('input')
      .attr('type', 'radio')
      .property('checked', (d, i) => i === 0)
      .attr('name', 'metric')
      .attr('id', (d, i) => `metric-${i}`)
      .on('click', d => rawMetric$.next(d));

    metricOptions
      .append('label')
      .attr('for', (d, i) => `metric-${i}`)
      .text(d => d.label);
  };

  const scrutin$ = selector.scrutin$ = new ReplaySubject(1);
  const rawMetric$ = new ReplaySubject(1);
  selector.metric$ = Observable
    .combineLatest(scrutin$, rawMetric$)
    .map(metricWrapper);

  scrutin$.next(scrutins[0].selector);
  rawMetric$.next(metrics[0]);

  return selector;
}
