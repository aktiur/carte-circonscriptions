import {select} from 'd3-selection';

import 'normalize.css/normalize.css';
import './main.css';

import dashboard from './components/dashboard';

const target = '#app';

select(target)
  .call(dashboard);
