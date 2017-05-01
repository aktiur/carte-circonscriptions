import './dashboard.css';
import selector from './selector';
import map from './map';
import details from './details';

function dashboard(root) {
  root.append('div')
    .call(selector);

  const content = root.append('div').attr('class', 'content');

  content.append('div')
    .call(map);

  content.append('div')
    .call(details);
}

export default dashboard;
