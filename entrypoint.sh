#! /bin/sh

set -e

echo PORT=[$PORT]
echo BASE_URL=[$BASE_URL]
envsubst '$PORT,$BASE_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

sed -i "s~BASE_URL~$BASE_URL~g" /usr/share/nginx/html/main.*.js

nginx -g 'daemon off;'

