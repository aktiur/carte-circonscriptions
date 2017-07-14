import {select} from 'd3-selection';
import {json} from 'd3-request';

import 'normalize.css/normalize.css';
import './main.css';

import dashboard from './components/dashboard';

const target = '#app';

json('topology.json', function (err, topology) {
  if (err) {
    throw err;
  }
  select(target).call(dashboard(topology));
});
