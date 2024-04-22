# location of the open api spec file in the BE repository
OPEN_API_LOCATION=../../Task/core/src/main/resources/openapi/openapi-spec.yml

# ng-openapi-gen
ng-openapi-gen

# remove services and functions
rm -r ../src/app/generated/fn
rm ../src/app/generated/api-configuration.ts
rm ../src/app/generated/request-builder.ts
rm ../src/app/generated/strict-http-response.ts


