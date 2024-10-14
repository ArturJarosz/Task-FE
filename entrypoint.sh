echo "Setting port and backend url."
echo PORT=$PORT
echo BASE_URL=$BASE_URL
echo AUTH0_DOMAIN=$AUTH0_DOMAIN
echo AUTH0_CLIENT_ID=$AUTH0_FE_CLIENT_ID
echo AUTH0_AUDIENCE=$AUTH0_AUDIENCE
envsubst '$PORT,$BASE_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

sed -i "s~BASE_URL~$BASE_URL~g" /usr/share/nginx/html/main.*.js
sed -i "s~AUTH0_AUDIENCE~$AUTH0_AUDIENCE~g" /usr/share/nginx/html/main.*.js
sed -i "s~AUTH0_DOMAIN~$AUTH0_DOMAIN~g" /usr/share/nginx/html/main.*.js
sed -i "s~AUTH0_CLIENT_ID~$AUTH0_FE_CLIENT_ID~g" /usr/share/nginx/html/main.*.js

nginx -g 'daemon off;'

