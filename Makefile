SHELL := /bin/bash
PATH := node_modules/.bin:$(PATH)

DROMCOM = guadeloupe martinique guyane reunion mayotte

# à ajouter plus tard : nouvelle-caledonie polynesie-francaise saint-pierre-et-miquelon wallis-et-futuna saint-martin-saint-barthelemy

FEATURES_DIR = data/features
GEO_DIR = data/geo

CIRCO_GROUPS = hexagone corse $(DROMCOM)

GEO_FILES = $(addsuffix .json,$(addprefix $(GEO_DIR)/,$(CIRCO_GROUPS)))

FEATURES_FILES = $(addsuffix .ndjson,$(addprefix $(FEATURES_DIR)/,$(CIRCO_GROUPS)))
DROMCOM_FEATURES_FILES = $(addsuffix .ndjson,$(addprefix $(FEATURES_DIR)/,$(DROMCOM)))

GEO_SRC = raw/france-circonscriptions-legislatives-2012.json

$(FEATURES_DIR)/guadeloupe.ndjson: CODE = ZA
$(FEATURES_DIR)/martinique.ndjson: CODE = ZB
$(FEATURES_DIR)/guyane.ndjson: CODE = ZC
$(FEATURES_DIR)/reunion.ndjson: CODE = ZD
$(FEATURES_DIR)/mayotte.ndjson: CODE = ZM
$(FEATURES_DIR)/nouvelle-caledonie.ndjson: CODE = ZN
$(FEATURES_DIR)/polynesie-francaise.ndjson: CODE = ZP
$(FEATURES_DIR)/saint-pierre-et-miquelon.ndjson: CODE = ZS
$(FEATURES_DIR)/wallis-et-futuna.ndjson: CODE = ZW
$(FEATURES_DIR)/saint-martin-saint-barthelemy.ndjson: CODE = ZX

RES_JOIN_SCRIPT = '\
 d[0].id = d[1].code, \
 d[0].properties = { \
   departement: d[1].departement, departement_libelle: d[1].departement_libelle, circo: +d[1].circo, \
   totaux: Object.keys(d[1]).slice(5, 11).reduce((r,k) => (r[k]=+d[1][k], r), {}), \
   votes: Object.keys(d[1]).slice(11).reduce((r,k) => (r[k]=+d[1][k], r), {}), \
 }, \
 d[0]'

SUPP_MAP_SCRIPT = '\
  {id: d.code, departement: d.departement, departement_libelle: d.departement_libelle, circo: +d.circo, \
   totaux: Object.keys(d).slice(5, 11).reduce((r,k) => (r[k]=+d[k], r), {}), \
   votes: Object.keys(d).slice(11).reduce((r,k) => (r[k]=+d[k], r), {}), \
  }'

CONSO_DEP_MAPPING = {"971":"ZA", "972": "ZB", "973": "ZC", "974": "ZD", "975": "ZM", "976": "ZN", "987": "ZP", "978": "ZS", "979": "ZW", "ZY": "ZX", "99": "ZZ"}

all: src/data/topo.json src/data/supp.json

print-%  : ; @echo $* = $($*)

src/data/topo.json src/data/supp.json: | src/data

src/data/topo.json: $(GEO_FILES)
	geo2topo $(GEO_FILES) \
	| topomerge -k 'd.properties.departement' departements=hexagone  \
	| topomerge --mesh departements=departements > $@

src/data/supp.json: data/2017_par_circo.csv data/candidats.ndjson
	csv2json -n data/2017_par_circo.csv \
	| ndjson-filter '["ZN","ZP","ZS","ZW","ZX","ZZ"].includes(d.departement)' \
	| ndjson-map $(SUPP_MAP_SCRIPT) \
	| ndjson-join 'd.id' - data/candidats.ndjson \
	| ndjson-map 'd[0].candidature=d[1], d[0]' \
	| ndjson-reduce > $@

$(GEO_FILES): | $(GEO_DIR)

$(FEATURES_FILES): | $(FEATURES_DIR)

$(GEO_DIR) $(FEATURES_DIR) src/data:
	mkdir -p $@

$(GEO_FILES): $(GEO_DIR)/%.json: $(FEATURES_DIR)/%.ndjson data/2017_par_circo.csv data/candidats.ndjson
	ndjson-join 'd.properties.ID' 'd.code' $< <(csv2json -n data/2017_par_circo.csv) \
	| ndjson-map $(RES_JOIN_SCRIPT) \
	| ndjson-join 'd.id' - data/candidats.ndjson \
	| ndjson-map 'd[0].properties.candidature=d[1], d[0]' \
	| ndjson-reduce 'p.features.push(d), p' '{"type":"FeatureCollection", "features": []}' > $@

# pour l'hexagone, il y a une circo en double: il faut fusionner 5 et 7 du val de marne
$(FEATURES_DIR)/hexagone.ndjson: $(GEO_SRC)
	tr -d '\n' < $< \
	| ndjson-split 'd.features' \
	| ndjson-filter '(d.properties.code_dpt.match(/[0-9]{2}/) && d.properties.num_circ!=="007")' > $@

# Pour la Corse, il faut corriger le nom de departement
$(FEATURES_DIR)/corse.ndjson: $(GEO_SRC)
	tr -d '\n' < $< \
	| ndjson-split 'd.features' \
	| ndjson-filter '["2A", "2B"].includes(d.properties.code_dpt)' \
	| ndjson-map 'd.properties.nom_dpt = d.properties.code_dpt === "2A" ? "Corse-du-Sud" : "Haute-Corse", d.properties.nom_reg = "Corse", d' > $@

$(DROMCOM_FEATURES_FILES): $(GEO_SRC)
	tr -d '\n' < $< \
	| ndjson-split 'd.features' \
	| ndjson-filter 'd.properties.code_dpt === "$(CODE)"' > $@

data/candidats.ndjson: raw/conso.csv
	csv2json -n raw/conso.csv \
	| ndjson-map 'd.departement=d.departement in $(CONSO_DEP_MAPPING) ? $(CONSO_DEP_MAPPING)[d.departement] : d.departement, d' \
	| ndjson-map 'd.departement=("00"+d.departement).slice(-2), d' \
	| ndjson-map 'd.id=d.departement + ("000" + d.circo).slice(-3), d' \
	| ndjson-map 'd.genre = (["M", "F"].includes(d.genre.trim()) ? d.genre.trim() : ""), d' \
	| ndjson-map -r _=lodash '_.pick(d, ["id", "genre", "titulaire_nom_complet", "titulaire_email", "suppleant_nom_complet", "suppleant_email", "explication"])' > $@

data/2017_par_circo.csv: data/2017_cleaned.csv
	python scripts/aggregation_par_circos.py $< > $@

data/2017_cleaned.csv: raw/PR17_BVot_T1_FE.txt
	python scripts/clean_2017.py $< > $@

clean:
	rm -rf data/
