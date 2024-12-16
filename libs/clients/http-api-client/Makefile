NODE_MODULES_ARTIFACT=node_modules.tar.gz
NODE_MODULES_DIR=../../../node_modules

################
# Entry Points #
################

_lint:
	$(NODE_MODULES_DIR)/eslint/bin/eslint.js

_tsc:
	$(NODE_MODULES_DIR)/typescript/bin/tsc --noEmit true

_test:
	$(NODE_MODULES_DIR)/jest/bin/jest.js test --runInBand --passWithNoTests

_testUnit:
	$(NODE_MODULES_DIR)/jest/bin/jest.js test/unit --runInBand --passWithNoTests

_testUnitWithCoverage:
	$(NODE_MODULES_DIR)/jest/bin/jest.js test/unit --runInBand --passWithNoTests  --coverage

_lintFix:
	$(NODE_MODULES_DIR)/eslint/bin/eslint.js --fix

_testIntegration:
	$(NODE_MODULES_DIR)/jest/bin/jest.js test/integration --runInBand --passWithNoTests

_testSystem:
	$(NODE_MODULES_DIR)/jest/bin/jest.js test/system
