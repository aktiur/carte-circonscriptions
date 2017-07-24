import {feature, mesh} from 'topojson';

import './dashboard.css';
import selector from './selector';
import map from './map';
import details from './details';
import metricDescription from './metricDescription';

export default function (topology) {
  function dashboard(root) {
    const circonscriptions = feature(topology, topology.objects.circonscriptions).features;
    const departementsBoundaries = mesh(topology, topology.objects.circonscriptions, function (a, b) {
      // select external boundaries and boundaries between departements
      return a === b || a.properties.departement !== b.properties.departement;
    });

    const s = selector(circonscriptions);
    const m = map(circonscriptions, departementsBoundaries, s.metric$);
    const d = details(s.scrutin$, m.circonscription$);
    const md = metricDescription(s.metric$);

    root.append('div')
      .call(s);

    const content = root.append('main');

    content.append('div')
      .call(m);

    const sidebar = content.append('div').attr('class', 'sidebar')

    sidebar.append('div')
      .call(md);

    sidebar.append('div')
      .call(d);
  }

  return dashboard;
}
