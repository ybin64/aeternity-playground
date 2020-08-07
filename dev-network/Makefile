

NW_PROJ_NAME ?= aepg
AETERNITY_NODE_TAG ?= v5.5.4
#AETERNITY_NODE_TAG ?= v5.4.1

AETERNITY_COMPILER_TAG ?= v4.3.2


.PHONY:start-network
start-network:
	NODE_TAG=$(AETERNITY_NODE_TAG) \
		docker-compose -p $(NW_PROJ_NAME) -f docker-compose.yml up

.PHONY:start-compiler
start-compiler:
	COMPILER_TAG=$(AETERNITY_COMPILER_TAG) \
		docker-compose -p $(NW_PROJ_NAME) -f docker-compose.compiler.yml up


.PHONY:stop-network
stop-network:
	NODE_TAG=$(AETERNITY_NODE_TAG) \
		docker-compose -p $(NW_PROJ_NAME) -f docker-compose.yml down

.PHONY:stop-compiler
stop-compiler:
	COMPILER_TAG=$(AETERNITY_COMPILER_TAG) \
		docker-compose -p $(NW_PROJ_NAME) -f docker-compose.compiler.yml down


