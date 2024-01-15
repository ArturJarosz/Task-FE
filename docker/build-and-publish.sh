#! /bin/bash

set -e

. ./utils.sh

DEFAULT_ENV="github"
CONTINUE="true"
LATEST=""
PUBLISH=""
ORGANIZATION="azjarosz"
MODULE_NAME="task-fe"

export ENV="${DEFAULT_ENV}"
  # example file has to be set to pass eny information to compose file, to make it possible to list services in helper methods
export ENV_FILE="./env/example.env"
export APP_VERSION=""

# reading script flags
while getopts "e:l:p:h" flag; do
    case "${flag}" in
        h)  displayHelpForBuild
            CONTINUE="false"
            ;;
        e)  ENVIRONMENT=${OPTARG}
            verifyEnvironment "$ENVIRONMENT"
            ;;
        l)  LATEST=${OPTARG}
            verifyBoolean "${LATEST}"
            ;;
        p)  PUBLISH=${OPTARG}
            verifyBoolean "${PUBLISH}"
            ;;
        *)  displayHelpForBuild
            CONTINUE="false"
            ;;
    esac
done

verifyMandatoryArgument "$ENVIRONMENT" "Environment"
verifyMandatoryArgument "$LATEST" "Latest"

echo "Environment set to $ENVIRONMENT"
export ENV_FILE="./env/$ENVIRONMENT.env"

APP_VERSION=$(node -e "console.log(require('../package.json').version);")
echo "Version to build is ${APP_VERSION}"

source "${ENV_FILE}"

# build image
echo "Building ${MODULE_NAME}:${APP_VERSION} image."
docker compose --env-file "$ENV_FILE" build --no-cache --progress plain
# checking build result
buildResult=$?
# if success - publish, if not return error message
if [[ "${buildResult}" != "0" ]]; then
    echo "Building image was not successful. Cannot publish."
    exit 1
fi

if [[ "${LATEST}" = "true" ]]; then
    echo "Tagging image as ${ORGANIZATION}/${MODULE_NAME}:latest."
    docker tag ${ORGANIZATION}/${MODULE_NAME}:${APP_VERSION} ${ORGANIZATION}/${MODULE_NAME}:latest
fi

# publishing image
if [[ "${PUBLISH}" = "true" ]]; then
    echo "Publishing image."
    docker image push --all-tags ${ORGANIZATION}/${MODULE_NAME}
fi
