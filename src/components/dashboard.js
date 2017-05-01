import './dashboard.css';
import selector from './selector';
import map from './map';
import details from './details';
import legend from './legend';

function dashboard(root) {
  root.append('div')
    .call(selector);

  const content = root.append('div').attr('class', 'content');

  content.append('div')
    .call(map);

  const sidebar = content.append('div');

  sidebar.append('div')
    .call(legend);

  sidebar.append('div')
    .call(details);

}

export default dashboard;
