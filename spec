#!/bin/sh

node_modules/.bin/_mocha --recursive -R spec -w "$@"
