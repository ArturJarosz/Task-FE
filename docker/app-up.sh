#! /bin/bash

set -e

. ./utils.sh

ENVIRONMENT=""
VERSION=""
HELP_DISPLAYED=false

while getopts "e:v:h" flag; do
    case "${flag}" in
        e)  ENVIRONMENT=${OPTARG}
            verifyEnvironment "$ENVIRONMENT"
            ;;
        v)  VERSION=${OPTARG}
            verifyVersion "$VERSION"
            ;;
        h)  HELP_DISPLAYED=true
            displayHelpForCompose
            ;;
    esac
done

verifyMandatoryArgument "$VERSION" "VERSION"

export APP_VERSION="$VERSION"
export ENV="$ENVIRONMENT"
export ENV_FILE="./env/$ENVIRONMENT.env"

echo "version is ${APP_VERSION}"
docker compose --env-file "$ENV_FILE" down --remove-orphans
docker compose --env-file "$ENV_FILE" up -d --progress=plain --no-cache
