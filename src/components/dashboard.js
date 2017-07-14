import './dashboard.css';
import selector from './selector';
import map from './map';
import details from './details';

export default function(topology) {
  function dashboard(root) {
    const s = selector();
    const m = map(topology, s.metric$);
    const d = details(s.scrutin$, m.circonscription$);

    root.append('div')
      .call(s);

    const content = root.append('main');

    content.append('div')
      .call(m);

    content.append('div')
      .call(d);
  }

  return dashboard;
}
