import os
from doit.tools import create_folder
from doit.action import CmdAction
from pathlib import Path
from itertools import chain
from functools import reduce
from operator import add
import json

os.environ['PATH'] = 'node_modules/.bin/:' + os.environ['PATH']

SCRUTINS = [
    "presidentielle-1",
    "presidentielle-2",
    "legislatives-1",
    "legislatives-2"
]

SCRUTINS_RAW = {s: f'raw/2017-{s}_par_circonscription_long.csv' for s in SCRUTINS}
SCRUTINS_NDJSON = {s: f'data/{s}.ndjson' for s in SCRUTINS}
RESULTS = "data/results.ndjson"

GEO_SRC = "raw/france-circonscriptions-legislatives-2012.json"
GEO_RESULTS = "data/circonscriptions.ndjson"

NDJSON_ZONE_FILES = 'data/zone_{name}.ndjson'
ZONE_FILES = 'data/zone_{name}.json'
PROJ_ZONE_FILE = 'data/proj_{name}.json'


BUNDLE_FILES = ['dist/bundle.js', 'dist/style.css']

PROJ_SIZE = [1000, 900]

with open('zones.json', 'r') as f:
    ZONES = json.load(f)

def task_compile_bundle():
    src_dir = Path('src')
    src_files = list(chain(src_dir.rglob('*.js'), src_dir.rglob('*.css')))

    return {
        'file_dep': src_files,
        'targets': BUNDLE_FILES,
        'actions': ['npm run build']
    }


def task_create_topology():
    srcs = [PROJ_ZONE_FILE.format(name=zone) for zone in ZONES]
    target = 'dist/topology.json'
    args = ' '.join('"{}"'.format(f) for f in srcs)

    return {
        'file_dep': srcs,
        'targets': [target],
        'actions': [f"""
            cat {args} \
            | ndjson-split 'd.features' \
            | geo2topo -n circonscriptions=- \
            | topoquantize 1e5 > "{target}"
        """]
    }


def task_test_svg():
    zones = [z for z, v in ZONES.items() if 'extent' in v]
    zone_files = [PROJ_ZONE_FILE.format(name=zone) for zone in zones]
    args = ' '.join('"{}"'.format(z) for z in zone_files)
    size_args = '-w {} -h {}'.format(*PROJ_SIZE)

    return {
        'file_dep': zone_files,
        'targets': ['data/test.svg'],
        'actions': [f"""
            cat {args} \
            | ndjson-split 'd.features' \
            | geo2svg -n {size_args} --fill "#FFFFFF" > data/test.svg 
        """]
    }


def task_project_zones():
    extents = {z: v['extent'] for z, v in ZONES.items()}

    def project_zone(extent, src, target, desc):
        rotate = json.dumps([-desc['center'][0], 0])
        parallels = json.dumps(desc['parallels'])
        ext = json.dumps(extent)

        return f'''
            geoproject -n 'd3.geoConicConformal().parallels({parallels}).rotate({rotate}).fitExtent({extent}, d)' \
             < "{src}" > "{target}"
        '''

    for zone, extent in extents.items():
        src = ZONE_FILES.format(name=zone)
        target = PROJ_ZONE_FILE.format(name=zone)
        yield {
            'name': zone,
            'actions': [CmdAction((project_zone, [extent, src, target], {}))],
            'file_dep': [src, 'zones.json'],
            'targets': [target],
            'getargs': {'desc': ('read_bounds', zone)},
            'verbosity': 2,
        }


def task_read_bounds():
    src = 'data/bounds.json'

    def read_bounds():
        with open(src, 'r') as f:
            lines = [json.loads(l) for l in f]

        return {l['zone']: {k: v for k, v in l.items() if k != 'zone'} for l in lines}

    return {
        'file_dep': [src],
        'actions': [read_bounds],
    }


def task_compute_bounds():
    srcs = [ZONE_FILES.format(name=n) for n in ZONES]
    args = ' '.join('"{}"'.format(s) for s in srcs)

    return {
        'file_dep': srcs,
        'targets': ['data/bounds.json'],
        'actions': [f"""
            cat {args} \
            | ndjson-map -r d3=d3-geo '{{zone: d.zone, bounds: d3.geoBounds(d)}}' \
            | ndjson-map 'd.center=[(d.bounds[0][0]+d.bounds[1][0])/2,(d.bounds[0][1]+d.bounds[1][1])/2],d' \
            | ndjson-map 'd.parallels=[d.bounds[0][1],d.bounds[1][1]],d' \
            | ndjson-map 'd.ratio=(d.bounds[1][0]-d.bounds[0][0])/(d.bounds[1][1]-d.bounds[0][1]),d' > data/bounds.json
        """]
    }


def task_ndjson_to_geojson():
    for zone in ZONES:
        src = NDJSON_ZONE_FILES.format(name=zone)
        target = ZONE_FILES.format(name=zone)

        yield {
            'name': zone,
            'file_dep': [src],
            'targets': [target],
            'actions': [f"""
                ndjson-reduce 'p.features.push(d),p' '{{type:"FeatureCollection",features:[]}}' < "{src}" \
                | ndjson-map 'd.zone="{zone}",d' > {target}
            """]
        }


def task_split_zones():
    zone_departements = {z: v['departements'] for z, v in ZONES.items() if 'departements' in v}

    for zone_name, departements in zone_departements.items():
        deps = json.dumps(departements)
        target = NDJSON_ZONE_FILES.format(name=zone_name)
        yield {
            'name': zone_name,
            'file_dep': [GEO_RESULTS, 'zones.json'],
            'targets': [target],
            'actions': [f"""
                ndjson-filter '{deps}.includes(d.properties.departement)' < {GEO_RESULTS} > {target}
            """]
        }

    target = NDJSON_ZONE_FILES.format(name='hexagone')
    exclude = json.dumps(reduce(add, zone_departements.values()))

    yield {
        'name': 'hexagone',
        'file_dep': [GEO_RESULTS, 'zones.json'],
        'targets': [target],
        'actions': [f"""ndjson-filter '!{exclude}.includes(d.properties.departement)' < {GEO_RESULTS} > {target}"""]
    }


def task_joindre_geo_resultats():
    return {
        'file_dep': [GEO_SRC, RESULTS],
        'targets': [GEO_RESULTS],
        'actions': [f'''
            ndjson-cat < {GEO_SRC} \
            | ndjson-split 'd.features' \
            | ndjson-join 'd.properties.ID' 'd.id' - "{RESULTS}" \
            | ndjson-map 'd[0].properties=d[1], d[0].id=d[1].id, delete d[1].id, d[0]' > {GEO_RESULTS}
        ''']
    }


def task_joindre_scrutins():
    args = ' '.join(f'"{s}={f}"' for s, f in SCRUTINS_NDJSON.items())

    return {
        'file_dep': list(SCRUTINS_NDJSON.values()),
        'targets': [RESULTS],
        'actions': [f'python scripts/joindre_scrutins.py {args} > {RESULTS}']
    }


def task_results_to_ndjson():
    for scrutin in SCRUTINS:
        src = SCRUTINS_RAW[scrutin]
        target = SCRUTINS_NDJSON[scrutin]

        yield {
            'name': scrutin,
            'file_dep': [src],
            'targets': [target],
            'actions': [(create_folder, ['data']), f'python scripts/csv_to_ndjson.py {src} > {target}']
        }


def task_copy_index():
    src = Path('index.html')
    target = Path('dist', src)

    return {
        'file_dep': [src],
        'targets': [target],
        'actions': [(create_folder, [target.parent]), f'cp {src} {target}']
    }


def task_copy_assets():
    assets_dir = Path('assets')

    for asset in all_files_in_dir(assets_dir):
        target = Path('dist', asset)
        directory = target.parent
        yield {
            'name': str(asset),
            'file_dep': [asset],
            'targets': [target],
            'actions': [(create_folder, [directory]), f'cp {asset} {target}']
        }


def all_files_in_dir(dir_path):
    stack = [dir_path]

    while stack:
        for path in stack.pop().iterdir():
            if path.is_dir():
                stack.append(path)
            else:
                yield path
