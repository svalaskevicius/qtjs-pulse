#!/bin/sh

node_modules/.bin/mocha --recursive -R spec -w "$@"