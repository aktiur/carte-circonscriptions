import {feature, mesh} from 'topojson';

import './dashboard.css';
import selector from './selector';
import map from './map';
import details from './details';

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

    root.append('main')
      .call(m);

    const sidebar = root.append('div').attr('class', 'sidebar');

    sidebar.append('div')
      .call(s);

    sidebar.append('div')
      .call(d);
  }

  return dashboard;
}
