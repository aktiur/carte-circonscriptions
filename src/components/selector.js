import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/combineLatest';

import './selector.css';
import {generalMetrics, specificMetrics} from '../metrics';
import {scrutins, nuanceDescriptions, NaNColor} from '../config';

export default function (circonscriptions) {

  const selector = function (elem) {
    elem.attr('class', 'selector');

    const scrutinSelector = elem.append('div').attr('class', 'scrutins group');

    scrutinSelector.append('h3').text('Choix du scrutin');
    let scrutinGroup = scrutinSelector.append('div').selectAll('.scrutin').data(scrutins)
      .enter()
      .append('div')
      .attr('class', 'subgroup');

    scrutinGroup.append('h4').text(d => d.label);

    let tourOptions = scrutinGroup.append('div').selectAll('.tour').data((d, i) => [
      {label: '1<sup>er</sup> tour', selector: d.selector + '-1', n: i},
      {label: '2<sup>e</sup> tour', selector: d.selector + '-2'}
    ]).enter()
      .append('div')
      .attr('class', 'option tour');

    tourOptions
      .call(appendRadio({
        'name': 'scrutin',
        'id': (d, i) => `id-${d.selector}`,
        'checked': (d, i) => d.n === 0 && i === 0,
        'onClick': d => scrutin$.next(d.selector)
      }));

    tourOptions
      .append('label')
      .attr('for', (d, i) => `id-${d.selector}`)
      .html(d => d.label);

    const metricSelector = elem.append('div').attr('class', 'metric group');
    metricSelector.append('h3').text("Choix de l'indicateur");

    const metricContainer = metricSelector.append('div');

    const generalMetricsDiv = metricContainer.append('div').attr('class', 'subgroup');
    generalMetricsDiv.append('h4').text('Indicateurs généraux');
    const generalMetricOptions = generalMetricsDiv.append('div').selectAll('.option').data(generalMetrics)
      .enter()
      .append('div')
      .attr('class', 'option');

    generalMetricOptions.call(appendRadio({
      name: 'metric',
      id: (d, i) => `general-metric-${i}`,
      checked: (d, i) => i === 0,
      onClick: d => metricConstructor$.next(d)
    }));

    generalMetricOptions
      .append('label')
      .attr('for', (d, i) => `general-metric-${i}`)
      .text(d => d.label);

    const specificMetricsDiv = metricContainer.append('div').attr('class', 'subgroup');

    const nuanceOptionsContainer = specificMetricsDiv.append('div');
    nuanceOptionsContainer.append('h4').text('Indicateurs pour').attr('class', 'inlined');
    const nuanceOptions = nuanceOptionsContainer.selectAll('.option').data(nuanceDescriptions).enter()
      .append('div')
      .attr('class', 'option nuance');

    nuanceOptions
      .call(appendRadio({
        name: 'nuance',
        id: (d, i) => `nuance-${i}`,
        checked: (d, i) => i === 0,
        onClick: d => nuance$.next(d)
      }));

    nuanceOptions
      .append('label')
      .attr('for', (d, i) => `nuance-${i}`)
      .text(d => d.label);

    const specificIndicatorOptions = specificMetricsDiv.append('div').selectAll('.option').data(specificMetrics).enter()
      .append('div')
      .attr('class', 'option');

    specificIndicatorOptions.call(appendRadio({
      name: 'metric',
      id: (d, i) => `specific-metric-${i}`,
      checked: false,
      onClick: d => metricConstructor$.next(d),
    }));

    specificIndicatorOptions
      .append('label')
      .attr('for', (d, i) => `specific-metric-${i}`)
      .text(d => d.label);
  };

  const scrutin$ = selector.scrutin$ = new ReplaySubject(1);
  const nuance$ = selector.nuance$ = new ReplaySubject(1);
  const metricConstructor$ = new ReplaySubject(1);

  const metric$ = selector.metric$ = Observable.combineLatest(scrutin$, nuance$, metricConstructor$)
    .map(instantiateMetric(circonscriptions));

  scrutin$.next('presidentielle-1');
  nuance$.next(nuanceDescriptions[0]);
  metricConstructor$.next(generalMetrics[0]);

  return selector;
}


function appendRadio({name, id, checked, onClick}) {
  return function (elem) {
    elem.append('input')
      .attr('type', 'radio')
      .property('checked', checked)
      .attr('name', name)
      .attr('id', id)
      .on('click', onClick);
  };
}

function instantiateMetric(circonscriptions) {
  return function ([scrutin, nuance, metric]) {
    const m = metric({
      data: circonscriptions.map(d => d.properties[scrutin]).filter(d => d !== null),
      nuance,
    });
    const a =  d => d.properties[scrutin] !== null ? m(d.properties[scrutin]) : NaNColor;
    a.legend = m.legend;
    return a;
  };
}
