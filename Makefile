ENVFILE?=.env
BASEWORKDIR=/opt/app
WORKDIR=$(BASEWORKDIR)/libs/domains/$(DOMAIN)/$(SERVICE)
NODE_MODULES_DIR=node_modules

shell: $(ENVFILE) $(NODE_MODULES_DIR)
	docker compose run -p 4000:4000 --rm serverless bash

deps:
	docker compose run --rm serverless make _deps

offline: $(ENVFILE) $(NODE_MODULES_DIR)
	docker compose run -w $(WORKDIR) -p 4000:4000 --rm serverless make _offline

#############
#	OTHERS	#
#############

_deps:
	yarn install
