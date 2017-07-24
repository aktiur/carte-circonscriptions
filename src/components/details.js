import {scaleLinear} from 'd3-scale';
import {percentFormat, intFormat} from '../config';
import {max} from 'd3-array';
import {Observable} from 'rxjs/Observable';

import {nuanceColors} from '../config';

import designationDepartements from '../departements.json';

import './details.css';

const maxBarWidth = 100;

export default function (scrutin$, circonscription$) {
  function details(elem) {
    elem.attr('class', 'details');

    const title = elem.append('h2').text('');

    const noDataMessage = elem.append('div')
      .attr('class', 'hide')
      .text('Pas de second tour dans cette circonscription.');

    // set up table
    const dataDiv = elem.append('div').attr('class', 'hide');

    const scrutinTitle = dataDiv.append('h3');
    const table = dataDiv.append('table');
    const tbody = setUpTable(table);

    dataDiv.append('h3').text('Liste des communes dans cette circonscription');
    const municipalities = dataDiv.append('div').attr('class', 'communes');

    // set up scale for bars
    const x = scaleLinear().rangeRound([0, maxBarWidth]);

    Observable
      .combineLatest(scrutin$, circonscription$)
      .subscribe(showDetails);

    function showDetails([scrutin, circonscription]) {
      title.html(nomCirco(circonscription));
      scrutinTitle.html(`Résultats pour le ${scrutin.label}`);

      if (circonscription[scrutin] === null) {
        dataDiv.classed('hide', true);
        noDataMessage.classed('hide', false);
        return;
      }

      dataDiv.classed('hide', false);
      noDataMessage.classed('hide', true);

      const resultats = circonscription[scrutin.selector];
      const data = formatData(resultats);

      x.domain([0, max(data, d => d.score)]);

      const lignes = tbody.selectAll('tr').data(data, d => d.id);

      // enter phase
      const lignesEnter = lignes.enter()
        .append('tr')
        .attr('class', d => d.nuance);

      lignesEnter.append('th')
        .text(d => d.nuance)
        .attr('class', 'nuance')

        .style('color', d => nuanceColors[d.nuance]);
      lignesEnter.append('td').html(d => d.label).attr('class', 'candidat');
      lignesEnter.append('td').attr('class', 'votes');
      lignesEnter.append('td').attr('class', 'pourcentage');
      lignesEnter.append('td').append('div').attr('class', 'bar');

      const lignesUpdate = lignesEnter.merge(lignes).order();

      lignesUpdate.select('.votes').text(d => d.votes);
      lignesUpdate.select('.pourcentage').text(d => d.pourcentage);
      lignesUpdate.select('.bar')
        .style('width', d => x(d.score) + 'px')
        .style('background-color', d => nuanceColors[d.nuance]);

      lignes.exit().remove();

      municipalities.text(circonscription.communes);
    }
  }

  return details;
}

function nomCirco(d) {
  const designation = designationDepartements[d.departement];
  const ordinal = d.circonscription === 1 ? 'ère' : 'ème';
  return `${d.circonscription}<sup>${ordinal}</sup> circonscription ${designation}`;
}

function toTitleCase(str) {
  const candidate =  str.replace(/[a-zéàùèçâêîôûäëïöü]+/gi, function (txt) {
    return ['d', 'de', 'du'].includes(txt.toLowerCase()) ?
      txt.toLowerCase() :
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  return candidate.charAt(0).toUpperCase() + candidate.substr(1);
}

function candidateName(c) {
  return `<strong>${toTitleCase(c.nom)}</strong>, ${c.prenom}`;
}

function setUpTable(table) {
  table.append('caption').text("* Scores des candidats en % des exprimés, de l'abstention en % des inscrits");
  const header = table.append('thead').append('tr');

  [
    ['nuance', ''],
    ['candidat', 'Candidat'],
    ['votes', 'Voix'],
    ['pourcentage', '%*'],
    ['bar', '']
  ].map(([c, l]) => {
    header.append('th')
      .html(l)
      .attr('class', c);
  });

  return table.append('tbody');
}

function formatData(resultats) {

  const abstention = resultats.inscrits - resultats.votants;
  const abstentionInscrits = abstention / resultats.inscrits;
  const abstentionExprimes = abstention / resultats.exprimes;

  const data = resultats.candidats.map(c => ({
    id: `${c.nuance}/${c.nom}/${c.prenom}`,
    label: candidateName(c),
    pourcentage: percentFormat(c.voix / resultats.exprimes),
    votes: intFormat(c.voix),
    score: c.voix / resultats.exprimes,
    nuance: c.nuance
  }));

  data.push({
    id: 'abstention',
    label: '-',
    pourcentage: percentFormat(abstentionInscrits),
    votes: intFormat(abstention),
    score: abstentionExprimes,
    nuance: 'Abstention'
  });

  return data;
}