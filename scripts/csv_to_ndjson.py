import csv
from operator import itemgetter
import json
import sys

nuances = {
    "DUPONT-AIGNAN": 'DLF',
    "LE PEN": 'FN',
    "MACRON": 'REM',
    "HAMON": 'SOC',
    "ARTHAUD": 'EXG',
    "POUTOU": 'EXG',
    "CHEMINADE": 'DIV',
    "LASSALLE": 'DVD',
    "M\u00c9LENCHON": 'FI',
    "ASSELINEAU": 'DVD',
    "FILLON": 'LR',
}


def enumerer_circos(r):
    circo = (None, None, None)
    resultats_circo = None
    candidats_sorter = itemgetter('voix')

    for l in r:
        if circo != (l['departement'], l['circonscription']):
            # nouvelle circo: on émet la précédente s'il y en a une
            if resultats_circo:
                resultats_circo['candidats'].sort(key=candidats_sorter, reverse=True)
                yield circo, json.dumps(resultats_circo)

            # on mémorise la clé de la nouvelle circo
            circo = (l['departement'], l['circonscription'])

            # on initialise le dictionnaire de résultats
            resultats_circo = {
                'departement': l['departement'],
                'circonscription': int(l['circonscription']),
                'inscrits': int(l['inscrits']),
                'votants': int(l['votants']),
                'blancs': int(l['blancs']),
                'exprimes': int(l['exprimes']),

                # le tableau vide des candidats
                'candidats': []
            }

        resultats_circo['candidats'].append({
            'numero_panneau': int(l['numero_panneau']),
            'sexe': l['sexe'],
            'nom': l['nom'],
            'prenom': l['prenom'],
            'nuance': l['nuance'] if 'nuance' in l else nuances[l['nom']],
            'voix': int(l['voix'])
        })

    if resultats_circo:
        resultats_circo['candidats'].sort(key=candidats_sorter, reverse=True)
        yield circo, json.dumps(resultats_circo)


def clean_results(in_file, out_file):
    r = csv.DictReader(in_file)
    lines = []

    for donnees_bureau in enumerer_circos(r):
        lines.append(donnees_bureau)

    lines.sort()

    for _, l in lines:
        out_file.write(l)
        out_file.write('\n')


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts/scrutin_to_ndjson fichier_source")
        sys.exit(1)

    with open(sys.argv[1], 'r') as in_file:
        clean_results(in_file, sys.stdout)
