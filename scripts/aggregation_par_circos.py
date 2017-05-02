import sys
import pandas as pd
from collections import OrderedDict

aggregations = OrderedDict([
    ('departement', 'first'),
    ('departement_libelle', 'first'),
    ('circo', 'first'),
    ('circo_libelle', 'first'),
    ('inscrits', 'sum'),
    ('abstentions', 'sum'),
    ('votants', 'sum'),
    ('blancs', 'sum'),
    ('nuls', 'sum'),
    ('exprimes', 'sum'),
    ('DUPONT-AIGNAN', 'sum'),
    ('LE PEN', 'sum'),
    ('MACRON', 'sum'),
    ('HAMON', 'sum'),
    ('ARTHAUD', 'sum'),
    ('POUTOU', 'sum'),
    ('CHEMINADE', 'sum'),
    ('LASSALLE', 'sum'),
    ('MÉLENCHON', 'sum'),
    ('ASSELINEAU', 'sum'),
    ('FILLON', 'sum'),
])


def aggregation(df):
    df['code'] = df['departement'] + df['circo'].map(str).str.pad(3, fillchar='0')

    return df.groupby(['code']).agg(aggregations)[list(aggregations)]


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('usage: python scripts/aggregation_par_circos.py source_file', file=sys.stderr)
        sys.exit(1)

    df = pd.read_csv(sys.argv[1], dtype={'departement': str, 'bureau': str, 'commune': str})
    aggregation(df).to_csv(sys.stdout)
