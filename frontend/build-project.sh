#!/bin/sh

CODE_VERSION=`git rev-parse HEAD`

rm -rf dist
mkdir -p dist
PUBLIC_URL=/${CODE_VERSION} yarn react-scripts build
mv build dist/$CODE_VERSION
mv dist/$CODE_VERSION/index.html dist/index.html
echo $CODE_VERSION > dist/latest
