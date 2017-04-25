all: data/circos_topo.json

data/circos_topo.json: data/circos.json
	geo2topo $< -o $@
