import sys
import pandas as pd


def get_results(in_file):
    dtypes = {
        'code': str,
        'departement': str,
    }

    return pd.read_csv(
        in_file,
        dtypes=dtypes
    )


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('usage: python scripts/qualify_json.py json_src csv_src' ,file=sys.stderr)
        sys.exit(1)
