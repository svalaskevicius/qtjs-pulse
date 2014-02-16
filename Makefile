
all:

test:
	@./node_modules/.bin/mocha \
		--recursive \
		--require should \
		--reporter spec

.PHONY: test
