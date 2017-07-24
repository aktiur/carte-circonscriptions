
export default function(metric$) {
  return function(elem) {
    const description = elem.append('div');

    metric$.subscribe(updateDescription);

    function updateDescription(metric)  {
      description.html(metric.description);
    }
  };
}
