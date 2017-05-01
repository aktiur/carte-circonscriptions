import metrics from '../metrics';

import './selector.css';

export default function (elem) {
  elem.attr('class', 'selector');

  let options = elem.selectAll('.option').data(metrics);

  options = options.enter()
    .append('div')
    .attr('class', 'option')
    .merge(options);

  const inputs = options.append('input')
    .attr('type', 'radio')
    .property('checked', (d, i) => i === 0)
    .attr('name', 'metric')
    .attr('id', d => `option-${d.key}`)
    .on('click', emit);

  const labels = options.append('label')
    .attr('for', d => `option-${d.key}`)
    .text(d => d.label);

}

const listeners = [];
let last = metrics[0];

function emit(d) {
  last = d;

  for (let listener of listeners) {
    listener(d);
  }
}

export function addListener(listener) {
  listeners.push(listener);
  listener(last);
}

export function removeListener(listener) {
  if (!(listener in listeners)) {
    return;
  }
  listeners.splice(listeners.indexOf(listener), 1);
}
