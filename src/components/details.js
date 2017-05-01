import {scaleLinear, scaleBand} from 'd3-scale';
import {axisLeft, axisBottom} from 'd3-axis';
import {percentFormat} from '../config';

import './details.css';

const barColors = {
  'ARTHAUD': "#c41114",
  'ASSELINEAU': "#057c85",
  'CHEMINADE': "#e53517",
  'DUPONT-AIGNAN': "#39394b",
  'FILLON': "#23408f",
  'HAMON': "#e0003c",
  'LASSALLE': "#ff9632",
  'LE PEN': "#2f3e4b",
  'MÉLENCHON': "#ff3f19",
  'POUTOU': "#ff1f17",
  'MACRON': '#ffc600'
};

const width = 500, height = 400;
const labelsWidth = 100, scaleHeight = 20;
const rightMargin = 20;

let draw = null;

function nomCirco(d) {
  return `${d.properties.departement_libelle}, ${d.properties.circo}${d.properties.circo === 1 ? 'ère' : 'ème'} circonscription`;
}

function resumeCandidature(c) {
  console.log(c);
  const titulaire = c.titulaire_email ? `${c.titulaire_nom_complet} (<a href="mailto:${c.titulaire_email}">${c.titulaire_email}</a>)` : c.titulaire_nom_complet;
  const suppleant = c.suppleant_email ? `${c.suppleant_nom_complet} (<a href="mailto:${c.suppleant_email}">${c.suppleant_email}</a>)` : c.suppleant_nom_complet;

  return `
  <p><strong>Genre du candidat</strong> : ${c.genre}</p>
  <p><strong>Candidat titulaire</strong> : ${titulaire}</p>
  <p><strong>Candidat suppléant</strong> : ${suppleant}</p>
  `;
}

export default function details(elem) {
  elem.attr('class', 'details');

  const title = elem.append('h2')
    .text('Cliquez sur une circonscription pour obtenir des détails');

  const graph = elem.append('svg')
    .attr('width', width + labelsWidth + rightMargin)
    .attr('height', height + scaleHeight);

  const results = graph.append('g')
    .attr('transform', `translate(${labelsWidth},0)`);

  const labels = results.append('g')
    .attr('class', 'axis axis--y');

  const scale = results.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0,${height})`);

  const x = scaleLinear().rangeRound([0, width]);
  const y = scaleBand().rangeRound([0, height]).padding(0.1);

  const candidature = elem.append('div');

  const totaux = elem.append('div');

  draw = function draw(feature) {
    title.text(nomCirco(feature));

    const votes = feature.properties.votes;
    const exprimes = feature.properties.totaux.exprimes;

    const candidats = Object.keys(votes).sort(function (a, b) {
      return votes[a] - votes[b];
    }).reverse().slice(0, 5);

    const data = candidats.map(function (c) {
      return {candidat: c, score: votes[c]/exprimes};
    });

    y.domain(candidats);
    x.domain([0, Math.max(0.25, data[0].score)]);

    labels.call(axisLeft(y));
    scale.call(axisBottom(x).ticks(5, '%'));

    const bars = results.selectAll('.bar').data(data, function (d) {
      return d.candidat;
    });

    bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .merge(bars)
      .attr('y', function (d) {
        return y(d.candidat);
      })
      .attr('height', y.bandwidth())
      .attr('width', function (d) {
        return x(d.score);
      })
      .attr('fill', function (d) {
        return barColors[d.candidat];
      });

    bars.exit().remove();

    const figures = results.selectAll('.figure').data(data, function(d) {
      return d.candidat;
    });

    figures.enter()
      .append('text')
      .attr('class', 'figure')
      .attr('dx', 10)
      .attr('dy', '.3em')
      .merge(figures)
      .attr('y', d => y(d.candidat) + y.bandwidth() / 2)
      .text(d => percentFormat(d.score));

    figures.exit().remove();

    candidature.html(resumeCandidature(feature.properties.candidature));
  };
}

export function showDetails(feature) {
  if (draw) {
    draw(feature);
  }
}