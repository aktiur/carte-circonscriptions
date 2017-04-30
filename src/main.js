import * as d3Selection from 'd3-selection';

import 'normalize.css/normalize.css';
import './main.css';

import dashboard from './components/dashboard';

const target = '#app';

d3Selection.select(target)
  .call(dashboard);
