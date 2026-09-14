#!/bin/bash

npx semantic-release

VERSION=$(git describe --tags --abbrev=0)

if [ -z "$VERSION" ]; then
  echo "Error: Could not retrieve version from git tags"
  exit 1
fi

echo "new_version=${VERSION}" >> $GITHUB_OUTPUT
echo "New version: ${VERSION}"
